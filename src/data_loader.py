import os

def load_fasta(file_path):
    """
    Reads a FASTA file and returns a list of sequence records.
    Each record is a tuple (header, sequence).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    sequences = []
    current_header = None
    current_seq = []

    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith(">"):
                if current_header:
                    sequences.append((current_header, "".join(current_seq)))
                current_header = line[1:]
                current_seq = []
            else:
                current_seq.append(line)
        
        # Add the last sequence
        if current_header:
            sequences.append((current_header, "".join(current_seq)))
            
    return sequences

def clean_sequence(sequence):
    """
    Replaces non-standard amino acids (B, Z, J, O, U) with 'X'.
    And ensures the sequence is upper case.
    """
    sequence = sequence.upper()
    # Replacements for common ambiguous codes
    # B -> Asn or Asp -> X
    # Z -> Gln or Glu -> X
    # J -> Leu or Ile -> X
    # O -> Pyrrolysine -> X
    # U -> Selenocysteine -> X
    
    replacements = {'B': 'X', 'Z': 'X', 'J': 'X', 'O': 'X', 'U': 'X'}
    cleaned_seq = "".join([replacements.get(aa, aa) for aa in sequence])
    return cleaned_seq

def encode_labels(labels):
    """
    Converts a list of string labels to integer indices.
    Returns the encoded labels and the label-to-index mapping.
    """
    unique_labels = sorted(list(set(labels)))
    label_to_index = {label: i for i, label in enumerate(unique_labels)}
    encoded_labels = [label_to_index[label] for label in labels]
    
    return encoded_labels, label_to_index
