# Transformer-Based Representation Learning for Protein Family Classification and Functional Inference

A full-stack protein classification platform that uses **ESM-2 transformer embeddings** to classify protein sequences into 321 families, predict 3D structures via **ESMFold**, and generate **AI-powered biological insights** using Gemini.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Protein Classification** | Classifies sequences into 321 protein families using ESM-2 embeddings + MLP classifier |
| **3D Structure Prediction** | Predicts protein structure via Meta's ESMFold API with interactive 3D visualization |
| **AI Insights** | Generates biological explanations (function, significance, structural features) using Gemini 2.5 Flash |
| **Batch FASTA Upload** | Upload `.fasta` files and classify up to 20 sequences at once with a sortable results table |
| **Export Results** | Download results as CSV or print-to-PDF directly from the dashboard |
| **Embedding Visualization** | 2D PCA projection of 320-dim transformer embeddings |
| **Sequence Analysis** | Hydrophobicity, polarity, and charge property heatmaps |
| **Skeleton Loading** | Shimmer placeholders that match the results layout during analysis |
| **Mobile Responsive** | Hamburger nav, responsive typography, and proper mobile layout |

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│   React Frontend    │────▶│    Flask Backend (API)    │────▶│  ESMFold API    │
│   (Vite + Tailwind) │     │                          │     │  (Meta)         │
└─────────────────────┘     │  ┌─────────────────────┐ │     └─────────────────┘
                            │  │  ESM-2 Model (local) │ │
                            │  │  MLP Classifier      │ │     ┌─────────────────┐
                            │  │  PCA Visualization   │ │────▶│  Gemini 2.5     │
                            │  └─────────────────────┘ │     │  Flash API      │
                            └──────────────────────────┘     └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier works)

### Quick Start 🚀

1.  **Clone the repository**
2.  **Configure Environment**:
    - Copy `.env.example` to `.env`
    - Add your `GEMINI_API_KEY`

#### Linux / Mac 🍎🐧
Open a terminal in the project folder and run:
```bash
chmod +x setup.sh run.sh  # (Only needed once)
./setup.sh               # Installs dependencies
./run.sh                 # Starts the app
```

#### Windows 🪟
Double-click these files:
1.  `setup.bat` (Installs dependencies)
2.  `run.bat` (Starts the app)

The app will launch at `http://localhost:5173`.
** in your browser.

---

## 📁 Project Structure

```
sem6/
├── app.py                  # Flask API server (main backend)
├── requirements.txt        # Python dependencies (pinned)
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
│
├── src/                    # Core ML modules
│   ├── embedding_extractor.py  # ESM-2 embedding generation
│   ├── classifier.py           # MLP neural network
│   └── data_loader.py          # FASTA parsing & preprocessing
│
├── models/                 # Trained model artifacts
│   ├── real_model.joblib       # Trained MLP classifier
│   ├── label_encoder.joblib    # Label encoder (321 families)
│
├── data/                   # Raw data files
│   ├── embeddings_real.npy     # Training embeddings for PCA
│   ├── labels_real.npy         # Training labels
│   └── sample.fasta            # Example sequence
│
├── scripts/                # Training & utility scripts
│   ├── train_model.py          # Local model training script
│   ├── train_in_colab.py       # Google Colab training script
│   ├── process_data.py         # Data preprocessing pipeline
│   └── visualize_results.py    # Embedding visualization
│
├── tests/                  # Test suite
│   ├── test_api.py             # API endpoint tests (19 tests)
│   └── test_data_loader.py     # Data loader tests (3 tests)
│
└── frontend/               # React application
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/predict` | Classify a protein sequence | 30/min |
| `POST` | `/api/predict-batch` | Classify multiple sequences (max 20) | 5/min |
| `POST` | `/api/fold` | Predict 3D structure (ESMFold) | 10/min |
| `POST` | `/api/explain` | Generate AI biological insights | 15/min |
| `GET`  | `/api/data` | Get training data for PCA plot | 60/min |

### Example: Classify a Sequence

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"sequence": "VHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLST"}'
```

Response:
```json
{
  "family": "OXYGEN TRANSPORT",
  "confidence": 0.9997,
  "pca_x": -2.086,
  "pca_y": -0.864,
  "sequence": "VHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLST"
}
```

### Example: AI Explanation

```bash
curl -X POST http://localhost:5000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"family": "OXYGEN TRANSPORT", "confidence": 0.99, "sequence": "VHLTPEEK..."}'
```

### Example: Batch Classification

```bash
curl -X POST http://localhost:5000/api/predict-batch \
  -H "Content-Type: application/json" \
  -d '{"sequences": [
    {"name": "Hemoglobin", "sequence": "VHLTPEEKSAVTALWGKVNVDEVGG..."},
    {"name": "Insulin", "sequence": "MALWMRLLPLLALLALWGPDPAAA..."}
  ]}'
```

Response:
```json
{
  "results": [
    {"name": "Hemoglobin", "family": "OXYGEN TRANSPORT", "confidence": 0.9997, "error": null},
    {"name": "Insulin", "family": "TRANSCRIPTIONAL REGULATORY PROTEIN", "confidence": 0.998, "error": null}
  ]
}
```

---

## 🔒 Security

The application implements multiple security layers:

| Protection | Implementation |
|-----------|---------------|
| **Input Validation** | Regex-based amino acid validation, max 2000 chars |
| **CORS Restrictions** | Restricted to configured origins (env: `CORS_ORIGINS`) |
| **Rate Limiting** | Per-IP, in-memory rate limiting on all endpoints |
| **Secure Deserialization** | Models stored as `.joblib` (not pickle) |
| **Error Sanitization** | Generic client messages, full traces logged server-side |
| **Debug Mode Control** | Off by default, env-controlled (`FLASK_DEBUG`) |
| **API Key Auth** | Optional `X-API-Key` header auth (env: `API_KEY`) |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | — | **Required** for AI Insights feature |
| `FLASK_DEBUG` | `false` | Enable Flask debug mode |
| `PORT` | `5000` | Backend server port |
| `API_KEY` | — | Optional API key for endpoint auth |
| `CORS_ORIGINS` | `localhost:5173` | Comma-separated allowed origins |

---

## 🧪 Running Tests

```bash
source venv/bin/activate

# Run all tests
python -m unittest discover tests -v

# Run API tests only (19 tests)
python -m unittest tests.test_api -v

# Run data loader tests only (3 tests)
python -m unittest tests.test_data_loader -v
```

---

## 🧹 Linting & Code Quality

To ensure code quality and consistency, we use `flake8` (Python) and `eslint` (JavaScript).

### Backend (Python)
```bash
source venv/bin/activate
pip install flake8  # (If not installed)
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
```

### Frontend (React)
```bash
cd frontend
npm run lint
```

---

## 🧪 How This Compares to AlphaFold

This project is an **AlphaFold-inspired protein analysis platform** — it shares the same domain but serves a different purpose.

### Similarities

| Aspect | ProteinClassify | AlphaFold |
|--------|----------------|-----------|
| **Transformer backbone** | ESM-2 (Meta's protein language model) | Custom Evoformer transformer |
| **3D Structure** | ESMFold (single-sequence, inspired by AlphaFold) | Evoformer → Structure Module |
| **Learned representations** | Learns biochemical patterns from millions of sequences | Learns from evolutionary & structural data |

### Key Differences

| | ProteinClassify | AlphaFold |
|---|----------------|-----------|
| **Primary output** | **Family classification** (321 families) + structure as a bonus | **3D atomic coordinates** (structure is the main output) |
| **Model scale** | ESM-2 8M params — runs on CPU | ~93M params, requires GPU clusters |
| **Extra features** | AI insights (Gemini), batch analysis, embedding viz, sequence heatmaps | Focused purely on structure prediction |
| **Training data** | ~2000 labeled PDB sequences, custom MLP classifier | ~170K PDB structures, trained by DeepMind |
| **MSA required** | No — single sequence in, prediction out | AlphaFold2 needs MSA; AlphaFold3 can skip it |

> **In short:** AlphaFold is a structure prediction engine. ProteinClassify is a bioinformatics dashboard that classifies proteins, generates AI explanations, and uses ESMFold for structure as one feature among many.

---

## 🛠️ Tech Stack

**Backend:** Python, Flask, scikit-learn, PyTorch, Transformers (ESM-2), Gemini API

**Frontend:** React, Vite, Tailwind CSS, Framer Motion, NGL Viewer, Recharts, Axios

**ML Pipeline:** ESM-2 (8M param) → 320-dim embeddings → PCA + MLP Classifier (321 families)

---

## 📄 License

This project was developed as a semester 6 academic project.
