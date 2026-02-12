import numpy as np
import os
from src.classifier import SimpleMLP

def main():
    print("Loading data...")
    if not os.path.exists("data/embeddings.npy") or not os.path.exists("data/labels.npy"):
        print("Error: data/embeddings.npy or data/labels.npy not found. Run process_data.py first.")
        return

    X = np.load("data/embeddings.npy")
    y = np.load("data/labels.npy")

    print(f"Loaded X: {X.shape}, y: {y.shape}")
    
    # Shuffle indices
    indices = np.arange(X.shape[0])
    np.random.shuffle(indices)
    X = X[indices]
    y = y[indices]

    # Simple Train/Test split (80/20)
    split_idx = int(X.shape[0] * 0.8)
    # Ensure at least 1 sample in test if data is tiny
    if split_idx == X.shape[0] and X.shape[0] > 1:
        split_idx -= 1
        
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    print(f"Training on {X_train.shape[0]} samples, Testing on {X_test.shape[0]} samples")

    # Determine dimensions
    input_dim = X.shape[1]
    # Handle case where y might be empty or 0-dim if very few samples
    if len(y) > 0:
        num_classes = len(np.unique(y))
        # Ensure num_classes handles the max label index just in case
        num_classes = max(num_classes, np.max(y) + 1)
    else:
        num_classes = 2 # fallback

    hidden_dim = 64

    print(f"Initializing MLP: Input={input_dim}, Hidden={hidden_dim}, Output={num_classes}")
    
    model = SimpleMLP(input_dim, hidden_dim, num_classes, learning_rate=0.1)
    
    print("Starting training...")
    # Train for more epochs since it's fast
    model.train(X_train, y_train, epochs=200)

    print("\nEvaluating...")
    if X_test.shape[0] > 0:
        predictions = model.predict(X_test)
        accuracy = np.mean(predictions == y_test)
        print(f"Test Accuracy: {accuracy * 100:.2f}%")
        print(f"Predictions: {predictions}")
        print(f"True Labels: {y_test}")
    else:
        print("Test set is empty (too few samples), running evaluation on TRAIN set instead.")
        predictions = model.predict(X_train)
        accuracy = np.mean(predictions == y_train)
        print(f"Train Accuracy: {accuracy * 100:.2f}%")

if __name__ == "__main__":
    main()
