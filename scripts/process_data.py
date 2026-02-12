import os
import numpy as np
import argparse
from src.data_loader import load_fasta, clean_sequence, encode_labels
from src.embedding_extractor import EmbeddingExtractor

def main():
    parser = argparse.ArgumentParser(description="Extract protein embeddings.")
    parser.add_argument("--input", type=str, default="data/sample.fasta", help="Path to input FASTA file")
    parser.add_argument("--output_dir", type=str, default="data", help="Directory to save embeddings")
    parser.add_argument("--model", type=str, default="facebook/esm2_t6_8M_UR50D", help="Model name")
    args = parser.parse_args()

    # 1. Load Data
    print(f"Loading data from {args.input}...")
    try:
        raw_data = load_fasta(args.input)
    except FileNotFoundError:
        print(f"Error: File {args.input} not found.")
        return

    headers, sequences = zip(*raw_data)
    
    # 2. Preprocess
    print("Cleaning sequences...")
    cleaned_sequences = [clean_sequence(seq) for seq in sequences]
    
    # Dummy labels logic for now (extract from header or just placeholder)
    # If header is ">FamilyA__Protein1", we might split by "__"
    # For now, let's just use the whole header as a label or a dummy 'Unknown' if not specified
    # In a real dataset, we'd expect headers to contain class info.
    # Let's assume the dummy sample.fasta just has IDs. We'll generate dummy labels for testing.
    # In a real scenario, you'd parse `header` for the label.
    
    # Check if headers contain typical label info, else use formatted string
    labels = []
    for h in headers:
        # Example heuristic: use the first word or 'Unknown'
        # For our sample data, let's just use "Family_A" and "Family_B" cyclically for demo
        labels.append("Family_Unknown") 

    encoded_labels, label_mapping = encode_labels(labels)
    
    # 3. Extract Embeddings
    print(f"Initializing model {args.model}...")
    extractor = EmbeddingExtractor(model_name=args.model)
    
    print(f"Extracting embeddings for {len(cleaned_sequences)} sequences...")
    embeddings = extractor.get_embeddings(cleaned_sequences)
    
    print(f"Embeddings shape: {embeddings.shape}")
    
    # 4. Save
    os.makedirs(args.output_dir, exist_ok=True)
    emb_path = os.path.join(args.output_dir, "embeddings.npy")
    lbl_path = os.path.join(args.output_dir, "labels.npy")
    
    np.save(emb_path, embeddings)
    np.save(lbl_path, np.array(encoded_labels))
    
    print(f"Saved embeddings to {emb_path}")
    print(f"Saved labels to {lbl_path}")

if __name__ == "__main__":
    main()
