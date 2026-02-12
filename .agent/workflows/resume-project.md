---
description: Resume the Protein Classification project from where we left off on Feb 10, 2026
---

# 🧠 Project Memory: Protein Classification Platform

## Last Session: Feb 10, 2026 at 11:34 PM IST

## Current Status: **Integrating Real Model from Colab**

We just finished training the real ESM-2 model on Google Colab using the Kaggle PDB dataset. The trained artifacts have been downloaded and moved to the `data/` folder.

---

## What's Done ✅
1. **Full-stack app built**: Flask backend (`app.py`) + React frontend (`frontend/`)
2. **UI**: Scientific Dashboard theme with glassmorphism, animations, tooltips
3. **Features**: 3D protein viewer (NGL), Sequence Heatmap, Embedding Chart, Multiple Examples
4. **Colab Training**: Ran `train_in_colab.py` on Google Colab with GPU
5. **Artifacts downloaded** and moved to `data/`:
   - `data/embeddings_real.npy` - Real ESM-2 embeddings
   - `data/labels_real.npy` - Real classification labels
   - `data/real_model.pkl` - Trained sklearn MLPClassifier
   - `data/label_encoder.pkl` - LabelEncoder (maps indices → family names)

## What's Next ❗
1. **Check if `real_model.pkl` was downloaded** - This is the trained sklearn MLPClassifier. It should be in `data/`. If missing, ask user to re-download from Colab.
2. **Update `app.py`** to use the real model instead of the mock:
   - Replace `SimpleMLP` with `pickle.load(open('data/real_model.pkl', 'rb'))`
   - Replace mock `EmbeddingExtractor` with real ESM-2 (or keep mock for speed)
   - Load `label_encoder.pkl` to map prediction indices to real family names
   - Load `embeddings_real.npy` and `labels_real.npy` for PCA visualization
3. **Test the app** with the new model
4. **Verify** that different protein sequences now get different family predictions

## Key File Locations
- **Backend**: `/home/kangura/Manzil/S/sem6/app.py`
- **Frontend**: `/home/kangura/Manzil/S/sem6/frontend/`
- **Training Data**: `/home/kangura/Manzil/S/sem6/data/`
- **Kaggle Dataset**: `/home/kangura/Manzil/S/sem6/protein/` (pdb_data_seq.csv + pdb_data_no_dups.csv)
- **Colab Script**: `/home/kangura/Manzil/S/sem6/train_in_colab.py`
- **Documentation**: Check artifacts in `.gemini/antigravity/brain/` for Documentation.md and task.md

## How to Start Servers
// turbo-all
1. Start the Flask backend:
```bash
cd /home/kangura/Manzil/S/sem6 && ./venv/bin/python3 app.py
```

2. Start the React frontend:
```bash
cd /home/kangura/Manzil/S/sem6/frontend && npm run dev -- --host --port 5173
```

## Important Notes
- The mock `EmbeddingExtractor` in `src/embedding_extractor.py` always predicts "Family A" — this is why all structures show 1CRN
- Once we integrate the real model, predictions will be diverse and the 3D viewer will show different structures
- The `StructureViewer.jsx` maps families to PDB IDs (Family A→1CRN, Family B→1MBN, etc.)
- We may need to update this mapping based on real family names from `label_encoder.pkl`
