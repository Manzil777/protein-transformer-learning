---
description: Comprehensive project status and documentation (Up-to-date as of Feb 13, 2026)
---

# Project: Protein Classification & Analysis Platform

## 1. Overview
A full-stack application for classifying, visualizing, and explaining protein sequences.
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion (Glassmorphism UI)
- **Backend**: Flask + Python 3.13 + ESM-2 Embeddings
- **AI**: Google Gemini 2.5 Flash for biological context
- **Model**: Custom MLPClassifier (approx. 95% accuracy on Kaggle PDB dataset)

## 2. Current Status: ✅ Stable & Feature-Complete (v1.0)
The application has successfully migrated from a prototype phase to a robust, developer-friendly architecture.

### Key Milestones Achieved
- [x] **Real Model Integration**: Replaced mock classifier with `real_model.joblib` and `label_encoder.joblib`.
- [x] **3D Visualization**: NGL Viewer for protein structures (PDB files mapped to families).
- [x] **AI Insights**: Automated biological explanations using Gemini API.
- [x] **Batch Processing**: Drag & drop FASTA file support for multiple sequences.
- [x] **Workflow Modernization**: Single command `npm run dev` replaces legacy shell scripts.
- [x] **Security Audit**: Passed (Low Risk). Dependencies patched, secrets secured.
- [x] **Documentation Cleaned**: Outdated `resume-project.md` removed.

## 3. Features
1.  **Protein Analysis**: Input a sequence (or upload FASTA) to get family classification.
2.  **Structural Folding**: Visualizes 3D structure (fetching PDB or AlphaFold representative).
3.  **Embeddings Visualization**: PCA scatter plot showing where the input sequence lies relative to training data.
4.  **AI Explainer**: "What is this protein family?" — biological context generated on-the-fly.
5.  **Data Export**: Download results as CSV or PDF report.

## 4. Technical Usage

### Prerequisites
- Node.js (v18+)
- Python 3.13+
- `.env` file with `GEMINI_API_KEY`

### Setup & Run (New Workflow)
We have removed `run.sh` and `setup.sh` in favor of standard NPM scripts.

```bash
# Install dependencies (First run only)
npm run install:all

# Start Backend (Port 5000) AND Frontend (Port 5173) contentedly
npm run dev
```

### Environment Variables (.env)
```ini
FLASK_DEBUG=false
GEMINI_API_KEY=your_key_here
API_KEY=optional_api_key_for_auth
CORS_ORIGINS=http://localhost:5173
```

## 5. Directory Structure
```
/
├── app.py                 # Flask entry point
├── package.json           # Root NPM config (orchestrates dev server)
├── requirements.txt       # Python dependencies (includes python-dotenv)
├── frontend/              # React application
│   ├── src/components/    # UI Components (InputSection, ResultsDashboard)
│   ├── src/pages/         # Page Logic (Analyzer.jsx)
│   └── package.json       # Frontend dependencies
├── data/                  # ML Artifacts (model.joblib, embeddings.npy)
├── .agent/                # AI Agent capabilities (Ignored by git)
└── .gsd/                  # GSD Workflow config (Ignored by git)
```

## 6. Known Issues / Future Work
- **ESMFold API**: Occasional SSL handshake errors with `esmatlas.com` (backend handles gracefully).
- **Model Size**: `real_model.joblib` is optimized, but large embedding files are excluded from repo.
- **Production**: Recommended to set up Nginx reverse proxy and Gunicorn for deployment.

---
*Created by Antigravity Agent on Feb 13, 2026*
