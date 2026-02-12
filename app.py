from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import re
import hashlib
import traceback
import logging
import joblib
import requests as http_requests
from functools import wraps
from google import genai
from src.embedding_extractor import EmbeddingExtractor
from sklearn.decomposition import PCA

# --- [P4-Logging] Configure structured logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# --- [P2] CORS: Restrict to known origins instead of wildcard ---
ALLOWED_ORIGINS = os.environ.get(
    'CORS_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')
CORS(app, origins=ALLOWED_ORIGINS)

# --- [P7] Simple API key authentication (optional, enable via env var) ---
API_KEY = os.environ.get('API_KEY', None)  # Set to enable auth

def require_api_key(f):
    """Decorator to require API key if API_KEY is configured."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if API_KEY:
            provided_key = request.headers.get('X-API-Key', '')
            if provided_key != API_KEY:
                return jsonify({'error': 'Unauthorized — invalid or missing API key'}), 401
        return f(*args, **kwargs)
    return decorated

# --- [P1] Input validation constants ---
MAX_SEQ_LENGTH = 2000
VALID_AA_REGEX = re.compile(r'^[ACDEFGHIKLMNPQRSTVWXY]+$')

def validate_sequence(raw_sequence):
    """
    Cleans and validates a protein sequence.
    Returns (cleaned_seq, error_response) — error_response is None if valid.
    """
    if not raw_sequence:
        return None, (jsonify({'error': 'No sequence provided'}), 400)

    cleaned = raw_sequence.upper().replace('\n', '').replace(' ', '').replace('>', '')
    # Strip FASTA header line if present
    lines = cleaned.split('\n')
    cleaned = ''.join(line for line in lines if not line.startswith('>'))
    cleaned = cleaned.strip()

    if len(cleaned) == 0:
        return None, (jsonify({'error': 'Sequence is empty after cleaning'}), 400)

    if len(cleaned) > MAX_SEQ_LENGTH:
        return None, (jsonify({'error': f'Sequence too long ({len(cleaned)} chars). Max is {MAX_SEQ_LENGTH}.'}), 400)

    if not VALID_AA_REGEX.match(cleaned):
        invalid_chars = set(c for c in cleaned if c not in 'ACDEFGHIKLMNPQRSTVWXY')
        return None, (jsonify({'error': f'Invalid characters in sequence: {invalid_chars}. Only standard amino acid letters are allowed.'}), 400)

    return cleaned, None


# --- [P5] Simple in-memory rate limiter (no extra dependency needed) ---
from collections import defaultdict
import time

class RateLimiter:
    """Simple per-IP rate limiter using a sliding window."""
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = defaultdict(list)

    def is_allowed(self, client_ip):
        now = time.time()
        # Clean old entries
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < self.window
        ]
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        self.requests[client_ip].append(now)
        return True

# Rate limiters: predict=30/min, fold=10/min, data=60/min, explain=15/min, batch=5/min
predict_limiter = RateLimiter(max_requests=30, window_seconds=60)
fold_limiter = RateLimiter(max_requests=10, window_seconds=60)
data_limiter = RateLimiter(max_requests=60, window_seconds=60)
explain_limiter = RateLimiter(max_requests=15, window_seconds=60)
batch_limiter = RateLimiter(max_requests=5, window_seconds=60)

def rate_limit(limiter):
    """Decorator to apply rate limiting."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            client_ip = request.remote_addr or '127.0.0.1'
            if not limiter.is_allowed(client_ip):
                return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429
            return f(*args, **kwargs)
        return decorated
    return decorator


# Global variables to hold model and data
model = None
label_encoder = None
pca_model = None
embeddings_2d = None
labels = None
label_mapping = {}

def load_resources():
    global model, label_encoder, pca_model, embeddings_2d, labels, label_mapping

    logger.info("Loading resources...")

    # --- [P4] Prefer joblib over pickle; fall back to pickle if joblib file doesn't exist ---
    model_path_joblib = "data/real_model.joblib"
    model_path_pkl = "data/real_model.pkl"
    le_path_joblib = "data/label_encoder.joblib"
    le_path_pkl = "data/label_encoder.pkl"
    emb_path = "data/embeddings_real.npy"
    lab_path = "data/labels_real.npy"

    # 1. Load model (prefer .joblib, fall back to .pkl)
    if os.path.exists(model_path_joblib):
        model = joblib.load(model_path_joblib)
        logger.info(f"Loaded model (joblib): {type(model).__name__}")
    elif os.path.exists(model_path_pkl):
        import pickle
        logger.warning("Loading model from .pkl (insecure). Consider converting to .joblib.")
        with open(model_path_pkl, 'rb') as f:
            model = pickle.load(f)
        logger.info(f"Loaded model (pickle): {type(model).__name__}")
        # Auto-convert to joblib for future safety
        joblib.dump(model, model_path_joblib)
    # Load Model & Label Encoder
    try:
        model = joblib.load('models/real_model.joblib')
        logger.info("Loaded model (joblib): MLPClassifier")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")

    try:
        label_encoder = joblib.load('models/label_encoder.joblib')
        logger.info("Loaded label encoder (joblib)")
        if hasattr(label_encoder, 'classes_'):
            label_mapping = {i: label for i, label in enumerate(label_encoder.classes_)}
            logger.info(f"Loaded {len(label_mapping)} class labels")
        else:
            logger.warning("Label encoder has no classes_ attribute")
    except Exception as e:
        logger.error(f"Failed to load label encoder: {e}")
        logger.warning("No label encoder found! Using generic labels.")
        label_mapping = {i: f'Family {i}' for i in range(10)}

        logger.info(f"Loaded {len(label_mapping)} class labels")

    # 3. Load training embeddings + labels for PCA visualization
    if os.path.exists(emb_path) and os.path.exists(lab_path):
        X = np.load(emb_path)
        labels = np.load(lab_path)

        # Fit PCA on training data
        pca_model = PCA(n_components=2)
        embeddings_2d = pca_model.fit_transform(X)
        logger.info(f"PCA fitted on {X.shape[0]} embeddings")
    else:
        logger.warning("Embedding/label files not found!")

    logger.info("All resources loaded successfully!")

# Initialize the real ESM-2 extractor
extractor = EmbeddingExtractor(model_name="facebook/esm2_t6_8M_UR50D")

@app.route('/api/predict', methods=['POST'])
@require_api_key
@rate_limit(predict_limiter)
def predict():
    data = request.json
    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    sequence = data.get('sequence', '')

    # [P1] Validate input
    cleaned_seq, error = validate_sequence(sequence)
    if error:
        return error

    # Generate real ESM-2 embedding
    embedding = extractor.get_embeddings([cleaned_seq])

    # Predict
    if model:
        pred_idx = model.predict(embedding)[0]

        # Get confidence via predict_proba
        try:
            probs = model.predict_proba(embedding)[0]
            confidence = float(probs[pred_idx])
        except Exception:
            confidence = -1.0  # Indicate confidence unavailable (was 0.95 — misleading)

        family_name = label_mapping.get(pred_idx, f"Family_{pred_idx}")

        # Get 2D coordinate for visualization
        if pca_model:
            coord = pca_model.transform(embedding)[0]
            pca_x, pca_y = float(coord[0]), float(coord[1])
        else:
            pca_x, pca_y = 0.0, 0.0

        return jsonify({
            'family': family_name,
            'confidence': confidence,
            'pca_x': pca_x,
            'pca_y': pca_y,
            'sequence': cleaned_seq
        })
    else:
        return jsonify({'error': 'Model not loaded'}), 500

MAX_BATCH_SIZE = 20

@app.route('/api/predict-batch', methods=['POST'])
@require_api_key
@rate_limit(batch_limiter)
def predict_batch():
    """Classify multiple protein sequences from a FASTA upload."""
    data = request.json
    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    sequences = data.get('sequences', [])
    if not sequences:
        return jsonify({'error': 'No sequences provided'}), 400

    if len(sequences) > MAX_BATCH_SIZE:
        return jsonify({'error': f'Too many sequences ({len(sequences)}). Max is {MAX_BATCH_SIZE}.'}), 400

    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    results = []
    for item in sequences:
        name = item.get('name', 'Unknown')
        raw_seq = item.get('sequence', '')

        cleaned_seq, error = validate_sequence(raw_seq)
        if error:
            results.append({
                'name': name,
                'error': 'Invalid sequence',
                'family': None,
                'confidence': None
            })
            continue

        try:
            embedding = extractor.get_embeddings([cleaned_seq])
            pred_idx = model.predict(embedding)[0]

            try:
                probs = model.predict_proba(embedding)[0]
                confidence = float(probs[pred_idx])
            except Exception:
                confidence = -1.0

            family_name = label_mapping.get(pred_idx, f"Family_{pred_idx}")

            if pca_model:
                coord = pca_model.transform(embedding)[0]
                pca_x, pca_y = float(coord[0]), float(coord[1])
            else:
                pca_x, pca_y = 0.0, 0.0

            results.append({
                'name': name,
                'family': family_name,
                'confidence': confidence,
                'pca_x': pca_x,
                'pca_y': pca_y,
                'sequence': cleaned_seq,
                'error': None
            })
        except Exception as e:
            logger.error(f"[Batch] Error classifying {name}: {traceback.format_exc()}")
            results.append({
                'name': name,
                'error': 'Classification failed',
                'family': None,
                'confidence': None
            })

    logger.info(f"[Batch] Classified {len(results)} sequences")
    return jsonify({'results': results})

@app.route('/api/fold', methods=['POST'])
@require_api_key
@rate_limit(fold_limiter)
def fold():
    """Predict 3D structure using Meta's ESMFold API."""
    data = request.json
    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    sequence = data.get('sequence', '')

    # [P1] Validate input
    cleaned_seq, error = validate_sequence(sequence)
    if error:
        return error

    # Limit sequence length for the public API
    if len(cleaned_seq) > 400:
        cleaned_seq = cleaned_seq[:400]

    try:
        logger.info(f"[ESMFold] Predicting structure for {len(cleaned_seq)} residues...")
        response = http_requests.post(
            'https://api.esmatlas.com/foldSequence/v1/pdb/',
            data=cleaned_seq,
            headers={'Content-Type': 'text/plain'},
            timeout=60
        )

        if response.status_code == 200:
            pdb_text = response.text
            logger.info(f"[ESMFold] Success! Received {len(pdb_text)} bytes of PDB data.")
            return jsonify({'pdb': pdb_text})
        else:
            logger.error(f"[ESMFold] API error: {response.status_code} - {response.text[:200]}")
            return jsonify({'error': f'ESMFold API returned {response.status_code}'}), 502
    except http_requests.exceptions.Timeout:
        return jsonify({'error': 'ESMFold API timed out (sequence may be too long)'}), 504
    except Exception as e:
        # [P6] Log full error internally, but send generic message to client
        logger.error(f"[ESMFold] Error: {traceback.format_exc()}")
        return jsonify({'error': 'Structure prediction failed. Please try again.'}), 500

# --- Gemini AI Explainer ---
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', None)
gemini_client = None

if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Gemini AI client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
else:
    logger.warning("GEMINI_API_KEY not set. /api/explain endpoint will be unavailable.")

PROTEIN_EXPLAINER_PROMPT = """You are a brilliant molecular biologist and science communicator. A protein sequence has been classified by an ML model.

Classification result:
- **Predicted Family:** {family}
- **Confidence:** {confidence}%
- **Sequence length:** {seq_length} amino acids
- **First 50 residues:** {seq_preview}...

Provide a concise, engaging biological explanation structured EXACTLY as follows. Use 2-3 sentences per section. Be scientifically accurate but accessible to biology undergrads:

🧬 WHAT IS THIS PROTEIN FAMILY?
[Explain what this protein family does and its key molecular function]

🏥 BIOLOGICAL SIGNIFICANCE
[Why is this family important? Any connection to human health, diseases, or drug targets?]

🔬 STRUCTURAL FEATURES
[What structural motifs or domains are typically found in this family?]

💡 INTERESTING FACT
[One fascinating or surprising fact about this protein family]

Keep the total response under 200 words. Do not use markdown headers, only use the emoji labels above. Do not mention the ML model or classification system."""

@app.route('/api/explain', methods=['POST'])
@require_api_key
@rate_limit(explain_limiter)
def explain():
    """Generate an AI-powered explanation of the classified protein family."""
    if not gemini_client:
        return jsonify({'error': 'AI explainer is not configured. Set GEMINI_API_KEY environment variable.'}), 503

    data = request.json
    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    family = data.get('family', '')
    confidence = data.get('confidence', 0)
    sequence = data.get('sequence', '')

    if not family:
        return jsonify({'error': 'No protein family provided'}), 400

    prompt = PROTEIN_EXPLAINER_PROMPT.format(
        family=family,
        confidence=round(confidence * 100, 1),
        seq_length=len(sequence),
        seq_preview=sequence[:50] if sequence else 'N/A'
    )

    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        explanation = response.text
        logger.info(f"[Explain] Generated explanation for family: {family}")
        return jsonify({'explanation': explanation})
    except Exception as e:
        logger.error(f"[Explain] Gemini API error: {traceback.format_exc()}")
        return jsonify({'error': 'AI explanation generation failed. Please try again.'}), 500

@app.route('/api/data', methods=['GET'])
@require_api_key
@rate_limit(data_limiter)
def get_data():
    if embeddings_2d is None:
        return jsonify({'error': 'Data not loaded'}), 500

    # Return list of points: {x, y, label}
    points = []
    for i in range(len(embeddings_2d)):
        points.append({
            'x': float(embeddings_2d[i][0]),
            'y': float(embeddings_2d[i][1]),
            'label': label_mapping.get(int(labels[i]), f"Family_{labels[i]}")
        })
    return jsonify(points)

if __name__ == '__main__':
    load_resources()
    # --- [P3] Debug mode controlled by environment variable ---
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, port=port)
