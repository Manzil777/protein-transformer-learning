# PRD: ProteinClassify — Transformer-Based Protein Analysis Platform

> **Version:** 1.0 · **Author:** Manzil · **Last Updated:** 2026-02-13
> **Status:** SHIPPED (Semester 6 Academic Project)

---

## 1. Overview

ProteinClassify is a full-stack bioinformatics dashboard that classifies protein sequences into 321 families using **ESM-2 transformer embeddings**, predicts 3D structures via **ESMFold**, and generates AI-powered biological insights using **Gemini 2.5 Flash**. It targets biology undergrads, researchers, and educators who need fast, interactive protein analysis without GPU infrastructure.

---

## 2. Problem Statement

Protein family classification traditionally requires deep bioinformatics expertise, access to large databases (Pfam, InterPro), and command-line tools. Students and early researchers need an accessible, visual tool that:

1. Classifies unknown protein sequences with high confidence
2. Visualizes where the protein sits in embedding space relative to known families
3. Predicts 3D structure from sequence alone
4. Explains results in human-readable biological language

---

## 3. Target Users

| Persona | Description | Primary Need |
|---------|-------------|--------------|
| **Biology Undergrad** | Learning about protein families | Quick classification + plain-language explanation |
| **Researcher** | Exploring novel sequences | Batch analysis, export, embedding visualization |
| **Educator** | Demonstrating ML in biology | Interactive demo with visual feedback |

---

## 4. Core Features

### 4.1 Single Sequence Classification
- **Input:** Amino acid sequence (paste or sample)
- **Output:** Predicted family, confidence score, PCA coordinates
- **API:** `POST /api/predict`
- **Validation:** Max 2,000 chars, standard amino acid alphabet only (ACDEFGHIKLMNPQRSTVWXY)

### 4.2 Batch FASTA Upload
- **Input:** `.fasta` file (drag-and-drop or file picker), up to 20 sequences
- **Output:** Sortable results table with family, confidence per sequence
- **API:** `POST /api/predict-batch`
- **Export:** CSV download, print-to-PDF

### 4.3 3D Structure Prediction
- **Source:** Meta's ESMFold API (single-sequence, no MSA required)
- **Visualization:** Interactive 3D viewer via NGL Viewer (rotate, zoom, color by chain)
- **API:** `POST /api/fold`
- **Limits:** Sequences capped at 400 residues for the public API

### 4.4 AI Biological Insights
- **Engine:** Google Gemini 2.5 Flash
- **Output:** Structured explanation — What is this family? Biological significance? Structural features? Fun fact.
- **API:** `POST /api/explain`
- **Requires:** `GEMINI_API_KEY` env var

### 4.5 Embedding Space Visualization
- **Method:** PCA (2-component) projection of 320-dim ESM-2 embeddings
- **Display:** Recharts scatter plot showing training data + user's protein
- **API:** `GET /api/data`

### 4.6 Sequence Property Heatmaps
- **Properties:** Hydrophobicity, polarity, charge
- **Display:** Color-coded residue-level heatmap (client-side, no API call)

---

## 5. User Stories & Acceptance Criteria

### 5.1 Student Learning
**As a** biology student,
**I want to** paste a protein sequence I found in a textbook,
**So that I can** see what family it belongs to and understand its function.

**Acceptance Criteria:**
- [ ] Paste inputs < 2000 chars are accepted.
- [ ] Classification returns within 3 seconds.
- [ ] "Predicted Family" is clearly displayed.
- [ ] AI explanation answers "What is this?" in simple terms.
- [ ] 3D viewer loads the structure automatically.

### 5.2 Researcher Batch Analysis
**As a** bioinformatics researcher,
**I want to** upload a FASTA file with 20 unknowns,
**So that I can** quickly filter them for specific transport proteins.

**Acceptance Criteria:**
- [ ] Drag-and-drop `.fasta` support.
- [ ] Progress bar shows batch processing status.
- [ ] Result table allows sorting by "Family" and "Confidence".
- [ ] "Export CSV" button downloads all inputs + predictions.
- [ ] Failed sequences (e.g., non-standard AAs) are highlighted in red.

### 5.3 Error Handling
**As a** user,
**I want** clear feedback when I enter invalid data,
**So that I** know how to fix it without page refresh.

**Acceptance Criteria:**
- [ ] Invalid characters (e.g., "B", "Z", numbers) trigger immediate red error below input.
- [ ] API rate limit (429) shows "Too many requests, please wait 1m" toast.
- [ ] Server error (500) shows a friendly "Service unavailable" message, not a stack trace.

---

## 6. UX/UI Flow

### 6.1 Analysis Flow
1.  **Landing**: User sees "Analyze Protein" CTA or "Try Sample".
2.  **Input**:
    -   *Action*: User pastes sequence OR uploads file.
    -   *Feedback*: Real-time validation (length/chars).
3.  **Processing**:
    -   *State*: "Analyzing..." spinner overlay.
    -   *Action*: Frontend calls `/api/predict` (and `/api/fold` in parallel).
4.  **Results**:
    -   *Success*: Dashboard reveals with animation.
    -   *Visualization*: Charts animate in (0 -> 100%).
    -   *Interaction*: User can rotate 3D model, hover heatmap coordinates.

---

## 7. Data Dictionary

### Protein Object (Internal & API)
| Field | Type | Description |
|-------|------|-------------|
| `sequence` | `string` | The amino acid sequence (cleaned). |
| `family` | `string` | Predicted label (e.g., "GLOBIN"). |
| `confidence`| `float` | Softmax probability (0.00-1.00). |
| `pca_x` | `float` | X-coordinate in 2D embedding space. |
| `pca_y` | `float` | Y-coordinate in 2D embedding space. |
| `pdb_data` | `string` | Raw PDB text for 3D viewer. |
| `explanation`| `string` | AI-generated text block. |

### Batch Item Object
| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | FASTA header (e.g., ">Seq1"). |
| `sequence` | `string` | The sequence content. |
| `status` | `enum` | `pending` \| `loading` \| `complete` \| `error` |
| `result` | `Protein` | Result object (if complete). |
| `error` | `string` | Error message (if error). |

---

## 8. Success Metrics

| Metric | Goal | Tracking Method |
|--------|------|-----------------|
| **Accuracy** | >95% Top-1 Accuracy | Test set validation log |
| **Latency** | <500ms (P95) | API response time log |
| **Retention** | >3 batch uploads/session | Client-side analytics (future) |
| **Error Rate** | <1% 5xx errors | Server error logs |

---

## 9. Architecture

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

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 7.3 | Build tool / dev server |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 12.x | Animations |
| Recharts | 3.7 | Embedding chart |
| NGL Viewer | 2.4 | 3D protein structure |
| Axios | 1.13 | HTTP client |
| Lucide React | 0.563 | Icons |

### Backend Stack
| Technology | Purpose |
|-----------|---------|
| Flask | API server |
| PyTorch + Transformers | ESM-2 embedding extraction |
| scikit-learn | MLP classifier + PCA |
| joblib | Model serialization |
| google-genai | Gemini API client |

### ML Pipeline
| Stage | Detail |
|-------|--------|
| **Model** | ESM-2 (`facebook/esm2_t6_8M_UR50D`) — 8M params, CPU-friendly |
| **Embeddings** | 320-dimensional per-sequence mean pooling |
| **Classifier** | MLP (scikit-learn) trained on ~2,000 PDB sequences |
| **Classes** | 321 protein families |
| **Artifacts** | `models/real_model.joblib`, `models/label_encoder.joblib` |

---

## 6. Pages & Components

### Pages
| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page — hero, features, process, CTA |
| Analyzer | `/analyze` | Main analysis workspace |

### Components
| Component | Parent | Purpose |
|-----------|--------|---------|
| `InputSection` | Analyzer | Sequence input, FASTA upload, sample buttons |
| `ResultsDashboard` | Analyzer | Orchestrates all result panels |
| `EmbeddingChart` | ResultsDashboard | PCA scatter plot (Recharts) |
| `StructureViewer` | ResultsDashboard | 3D protein viewer (NGL) |
| `SequenceHeatmap` | ResultsDashboard | Residue-level property heatmap |
| `ProteinExplainer` | ResultsDashboard | AI-generated insights panel |
| `BatchResults` | Analyzer | Sortable batch results table |
| `SkeletonDashboard` | Analyzer | Shimmer loading placeholders |
| `ErrorBoundary` | App | React error boundary |

---

## 7. API Contract

| Method | Endpoint | Rate Limit | Auth | Description |
|--------|----------|------------|------|-------------|
| `POST` | `/api/predict` | 30/min | Optional | Classify single sequence |
| `POST` | `/api/predict-batch` | 5/min | Optional | Classify up to 20 sequences |
| `POST` | `/api/fold` | 10/min | Optional | Predict 3D structure |
| `POST` | `/api/explain` | 15/min | Optional | AI biological explanation |
| `GET`  | `/api/data` | 60/min | Optional | Training data for PCA plot |

### Security
- Input validation (regex, length limits)
- CORS restricted to configured origins
- Per-IP in-memory rate limiting
- Optional `X-API-Key` header auth
- Secure deserialization (joblib, not pickle)
- Error sanitization (generic client messages)

---

## 8. Configuration

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `GEMINI_API_KEY` | Yes (for /explain) | — | Gemini AI insights |
| `FLASK_DEBUG` | No | `false` | Debug mode |
| `PORT` | No | `5000` | Backend port |
| `API_KEY` | No | — | Endpoint authentication |
| `CORS_ORIGINS` | No | `localhost:5173` | Allowed origins |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Performance** | Single prediction < 3s on CPU |
| **Responsiveness** | Mobile-first, hamburger nav, responsive typography |
| **Accessibility** | Semantic HTML, aria labels on interactive elements |
| **Loading UX** | Skeleton placeholders matching result layout |
| **Export** | CSV + print-to-PDF from dashboard |
| **Error Handling** | ErrorBoundary + per-endpoint error states |

---

## 10. Testing

| Suite | Count | Tool | Command |
|-------|-------|------|---------|
| Backend API tests | 19 | unittest | `venv/bin/python -m unittest tests.test_api -v` |
| Data loader tests | 3 | unittest | `venv/bin/python -m unittest tests.test_data_loader -v` |
| Frontend lint | — | ESLint | `cd frontend && npm run lint` |
| Frontend unit tests | — | Vitest | `cd frontend && npx vitest run` |
| CodeRabbit | — | GitHub PR review | Auto-review on push (chill mode) |

---

## 11. Known Limitations & Future Work

### Current Limitations
- ESMFold API has intermittent SSL issues (`esmatlas.com`)
- 321 families — limited coverage of full protein space
- ESM-2 8M variant — smallest model, lower accuracy than larger variants
- In-memory rate limiter resets on server restart
- No user authentication / session persistence

### Potential Enhancements
- [ ] User accounts + saved analysis history
- [ ] Upgrade to ESM-2 35M or 150M for better accuracy
- [ ] Multiple Sequence Alignment (MSA) support
- [ ] Comparison mode (classify 2 proteins side-by-side)
- [ ] Real-time structure prediction (local ESMFold instead of API)
- [ ] Dark mode toggle
- [ ] Redis-backed rate limiting for production
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] PWA support for offline-capable sequence analysis

---

## 12. File Structure

```
sem6/
├── app.py                      # Flask API server
├── requirements.txt            # Python dependencies
├── .env.example                # Environment template
├── PRD.md                      # ← This document
├── PLAN.md                     # GSD execution plan
├── STATE.md                    # GSD session memory
├── src/
│   ├── embedding_extractor.py  # ESM-2 embedding generation
│   ├── classifier.py           # MLP neural network
│   └── data_loader.py          # FASTA parsing & preprocessing
├── models/
│   ├── real_model.joblib       # Trained MLP classifier
│   └── label_encoder.joblib    # Label encoder (321 families)
├── data/
│   ├── embeddings_real.npy     # Training embeddings for PCA
│   └── labels_real.npy         # Training labels
├── tests/
│   ├── test_api.py             # API endpoint tests (22 total)
│   └── test_data_loader.py     # Data loader tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Router, Nav, Footer
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   └── Analyzer.jsx    # Analysis workspace
│   │   ├── components/         # 9 React components
│   │   └── utils/exportUtils   # CSV/PDF export
│   └── package.json
├── scripts/                    # Training & utility scripts
└── .coderabbit.yaml            # CodeRabbit review config
```

---

## 13. Glossary

- **ESM-2**: Evolutionary Scale Modeling (v2). A transformer-based protein language model by Meta AI.
- **ESMFold**: An end-to-end atomic-level protein structure predictor based on ESM-2.
- **Embedding**: A fixed-size vector representation (320-dim) of a protein sequence.
- **PCA**: Principal Component Analysis. Dimensionality reduction technique (320D → 2D).
- **FASTA**: Text-based format for representing nucleotide or amino acid sequences.
- **PDB**: Protein Data Bank format. Atomic coordinate data for 3D structures.
- **Residue**: A single monomer within the protein chain (i.e., one amino acid).
- **Gemini**: Google's multimodal AI model, used here for text explanation.

