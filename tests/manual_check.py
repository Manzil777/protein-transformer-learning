from src.data_loader import load_fasta, clean_sequence, encode_labels
import os

def main():
    fasta_path = "data/sample.fasta"
    if not os.path.exists(fasta_path):
        print(f"File not found: {fasta_path}")
        return

    print(f"Loading {fasta_path}...")
    sequences = load_fasta(fasta_path)
    print(f"Loaded {len(sequences)} sequences.")

    print("\nSample Sequences:")
    for header, seq in sequences:
        print(f"Header: {header}")
        print(f"Original Length: {len(seq)}")
        cleaned = clean_sequence(seq)
        print(f"Cleaned Sequence (Snippet): {cleaned[:50]}...")
        if "X" in cleaned:
            print("  -> Contains non-standard amino acids (replaced with X)")
        print("-" * 20)

    # Dummy labels for testing encoding
    labels = ["FamilyA", "FamilyB", "FamilyA", "FamilyC"]
    print(f"\nTesting Label Encoding with: {labels}")
    encoded, mapping = encode_labels(labels)
    print(f"Encoded: {encoded}")
    print(f"Mapping: {mapping}")

if __name__ == "__main__":
    main()
