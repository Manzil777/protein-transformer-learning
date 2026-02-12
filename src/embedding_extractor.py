import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel

class EmbeddingExtractor:
    def __init__(self, model_name="facebook/esm2_t6_8M_UR50D", device=None):
        """
        Initializes the ESM-2 embedding extractor.
        Uses CPU-only torch for lightweight local inference.
        Args:
            model_name (str): HuggingFace model name.
            device (str): Device to use (defaults to CPU).
        """
        print(f"Loading ESM-2 model: {model_name}...")
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)
        self.model.eval()
        self.hidden_dim = self.model.config.hidden_size  # 320 for t6_8M
        print(f"ESM-2 loaded on {self.device} (hidden_dim={self.hidden_dim})")

    def get_embeddings(self, sequences, batch_size=8):
        """
        Generates real ESM-2 embeddings for a list of protein sequences.
        Args:
            sequences (list): List of protein sequence strings.
            batch_size (int): Batch size for processing.
        Returns:
            numpy.ndarray: Array of shape (num_sequences, hidden_dim).
        """
        all_embeddings = []

        with torch.no_grad():
            for i in range(0, len(sequences), batch_size):
                batch = sequences[i:i + batch_size]
                inputs = self.tokenizer(
                    batch,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=512
                )
                inputs = {k: v.to(self.device) for k, v in inputs.items()}

                outputs = self.model(**inputs)
                # Mean pooling over sequence length
                batch_emb = outputs.last_hidden_state.mean(dim=1)
                all_embeddings.append(batch_emb.cpu().numpy())

        return np.concatenate(all_embeddings, axis=0).astype(np.float32)
