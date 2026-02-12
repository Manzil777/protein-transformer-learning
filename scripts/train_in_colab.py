# ==========================================
# PASTE THIS INTO A GOOGLE COLAB CELL
# ==========================================

# 1. Install Dependencies
!pip install transformers torch scikit-learn numpy sequence-classification

import torch
import numpy as np
import pickle
from transformers import AutoTokenizer, AutoModel
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# 2. Configuration
# We use the smallest ESM-2 model (8M params) so it fits easily in Colab's free tier
# For better results, change to "facebook/esm2_t12_35M_UR50D" or larger if you have Colab Pro
MODEL_NAME = "facebook/esm2_t6_8M_UR50D" 
DATA_FILE = "dataset.fasta" # Upload your FASTA file and rename it to this

print(f"Loading {MODEL_NAME}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

# Move to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
print(f"Using device: {device}")

# 3. Load Data (Supports CSV or FASTA)
import os
import pandas as pd

# 3. Load Data (Supports Single CSV, FASTA, or PDB Dataset Pair)
import os
import pandas as pd

# CONFIGURATION FOR YOUR DATASET
# ---------------------------------------------------------
# OPTION A: Single CSV
DATA_FILE = "dataset.csv" 
SEQ_COL = "sequence"
LABEL_COL = "classification"

# OPTION B: PDB Dataset (Two files)
PDB_SEQ_FILE = "pdb_data_seq.csv"
PDB_META_FILE = "pdb_data_no_dups.csv"
# ---------------------------------------------------------

sequences = []
labels = []

if os.path.exists(PDB_SEQ_FILE) and os.path.exists(PDB_META_FILE):
    print("Detected PDB Dataset Pair! Loading and merging...")
    
    # 1. Load Sequences
    try:
        df_seq = pd.read_csv(PDB_SEQ_FILE, on_bad_lines='skip', engine='python')
        print(f"Loaded sequences: {df_seq.shape}")
    except Exception as e:
        print(f"Error loading {PDB_SEQ_FILE}: {e}")
        df_seq = pd.DataFrame(columns=['structureId', 'sequence'])
    
    # 2. Load Metadata (Classifications)
    try:
        df_meta = pd.read_csv(PDB_META_FILE, on_bad_lines='skip', engine='python')
        print(f"Loaded metadata: {df_meta.shape}")
    except Exception as e:
        print(f"Error loading {PDB_META_FILE}: {e}")
        print("Using basic fallback for metadata...")
        # Create a dummy DF for now so script doesn't crash completely
        df_meta = pd.DataFrame(columns=['structureId', 'classification', 'macromoleculeType'])
    
    # 3. Merge on structureId
    # Note: pdb_data_seq has duplicated structureIds for chains, meta is unique per structure
    df = pd.merge(df_seq, df_meta, on='structureId')
    
    # 4. Filter for Proteins ONLY
    if 'macromoleculeType_x' in df.columns:
        df = df[df['macromoleculeType_x'] == 'Protein']
    elif 'macromoleculeType' in df.columns:
        df = df[df['macromoleculeType'] == 'Protein']
        
    # 5. Clean
    df = df.dropna(subset=['sequence', 'classification'])
    
    # 6. Select Top Classes (Optional: to keep dataset balanced/trainable)
    # top_classes = df['classification'].value_counts().head(10).index
    # df = df[df['classification'].isin(top_classes)]
    
    # Limit for demo speed (Remove this line for full training)
    print(f"Total protein records: {len(df)}")
    df = df.head(2000) 
    print("⚠️ Using subset of 2000 for speed demonstration. Comment out 'df.head()' to use all.")

    sequences = df['sequence'].tolist()
    labels = df['classification'].tolist()
    
elif os.path.exists(DATA_FILE):
    print(f"Loading single file {DATA_FILE}...")
    
    if DATA_FILE.endswith('.csv'):
        df = pd.read_csv(DATA_FILE)
        df = df.dropna(subset=[SEQ_COL, LABEL_COL])
        # df = df.iloc[:1000] # Limit
        sequences = df[SEQ_COL].tolist()
        labels = df[LABEL_COL].tolist()
        
    elif DATA_FILE.endswith('.fasta'):
        current_seq = []
        with open(DATA_FILE, 'r') as f:
            for line in f:
                if line.startswith(">"):
                    if current_seq:
                        sequences.append("".join(current_seq))
                        current_seq = []
                        labels.append("Unknown")
                else:
                    current_seq.append(line.strip())
            if current_seq: sequences.append("".join(current_seq))
            
else:
    print("⚠️ No dataset file found! Generating DUMMY data...")
    sequences = ["MKTVRQERLKSIVRILERSKEPVSGAQLAEELSVSRQVIVQDIAYLRSLGYNIVATPRGYVLAGG"] * 50
    labels = ["Family A"] * 50


# 4. Extract Embeddings
print("Extracting embeddings...")
batch_size = 8
embeddings = []

model.eval()
with torch.no_grad():
    for i in range(0, len(sequences), batch_size):
        batch_seqs = sequences[i:i+batch_size]
        
        # Tokenize
        inputs = tokenizer(batch_seqs, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Forward pass
        outputs = model(**inputs)
        
        # Get mean pooling (representation of whole protein)
        # outputs.last_hidden_state is (batch, seq_len, hidden_dim)
        # We average over seq_len to get (batch, hidden_dim)
        batch_embeddings = outputs.last_hidden_state.mean(dim=1)
        embeddings.append(batch_embeddings.cpu().numpy())

X = np.concatenate(embeddings)
print(f"Extracted shape: {X.shape}")

# 5. Train Classifier
print("Training Classifier...")
le = LabelEncoder()
y = le.fit_transform(labels)

# Use a real sklearn MLP this time
clf = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=500, random_state=42)
clf.fit(X, y)
print(f"Training score: {clf.score(X, y):.4f}")

# 6. Save Artifacts for Local Use
print("Saving artifacts...")
np.save("embeddings_real.npy", X)
np.save("labels_real.npy", y)

with open("real_model.pkl", "wb") as f:
    pickle.dump(clf, f)
    
with open("label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)

print("DONE! Download the .npy and .pkl files from the sidebar.")
