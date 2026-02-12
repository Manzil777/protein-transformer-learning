import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import os
from src.classifier import SimpleMLP

def load_data():
    if not os.path.exists("data/embeddings.npy") or not os.path.exists("data/labels.npy"):
        raise FileNotFoundError("Data files not found. Run process_data.py first.")
    
    X = np.load("data/embeddings.npy")
    y = np.load("data/labels.npy")
    return X, y

def visualize_clusters(X, y, output_dir):
    print("Generating PCA plot...")
    # PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)
    
    plt.figure(figsize=(8, 6))
    scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap='viridis', alpha=0.7)
    plt.colorbar(scatter, label='Class Label')
    plt.title('Protein Embeddings (PCA)')
    plt.xlabel('PC1')
    plt.ylabel('PC2')
    plt.savefig(os.path.join(output_dir, 'pca_plot.png'))
    plt.close()

    # t-SNE (only if enough samples)
    if X.shape[0] > 5:
        print("Generating t-SNE plot...")
        tsne = TSNE(n_components=2, perplexity=min(5, X.shape[0]-1), random_state=42)
        X_tsne = tsne.fit_transform(X)
        
        plt.figure(figsize=(8, 6))
        scatter = plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='viridis', alpha=0.7)
        plt.colorbar(scatter, label='Class Label')
        plt.title('Protein Embeddings (t-SNE)')
        plt.savefig(os.path.join(output_dir, 'tsne_plot.png'))
        plt.close()
    else:
        print("Skipping t-SNE (too few samples).")

def evaluate_model(X, y, output_dir):
    print("Evaluating model for Confusion Matrix...")
    # Retrain a simple model to get predictions (or we could save/load the model)
    # For visualization, we'll just do a quick train/predict on the full set/split
    
    # 80/20 split
    indices = np.arange(X.shape[0])
    np.random.shuffle(indices)
    split = int(0.8 * len(indices))
    train_idx, test_idx = indices[:split], indices[split:]
    
    if len(test_idx) == 0:
        print("Not enough data for test set. Using training set for confirmation matrix.")
        test_idx = train_idx
        
    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]
    
    # Determine dims
    input_dim = X.shape[1]
    num_classes = len(np.unique(y))
    num_classes = max(num_classes, np.max(y) + 1)
    
    model = SimpleMLP(input_dim, 64, num_classes)
    model.train(X_train, y_train, epochs=200) # Quick retrain
    
    y_pred = model.predict(X_test)
    
    print("Generating Confusion Matrix...")
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    
    plt.figure(figsize=(8, 6))
    disp.plot(cmap='Blues')
    plt.title('Confusion Matrix')
    plt.savefig(os.path.join(output_dir, 'confusion_matrix.png'))
    plt.close()

def main():
    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        X, y = load_data()
        print(f"Loaded {X.shape[0]} samples.")
        
        visualize_clusters(X, y, output_dir)
        evaluate_model(X, y, output_dir)
        
        print(f"Visualization complete. Check the '{output_dir}' directory.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
