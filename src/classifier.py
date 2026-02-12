import numpy as np

class SimpleMLP:
    def __init__(self, input_dim, hidden_dim, output_dim, learning_rate=0.01):
        """
        Initializes a simple 2-layer MLP.
        """
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        self.lr = learning_rate

        # Initialize weights (Xavier/Glorot initialization)
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2. / input_dim)
        self.b1 = np.zeros((1, hidden_dim))
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2. / hidden_dim)
        self.b2 = np.zeros((1, output_dim))

    def relu(self, z):
        return np.maximum(0, z)

    def relu_deriv(self, z):
        return (z > 0).astype(float)

    def softmax(self, z):
        # Numerically stable softmax
        exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)

    def forward(self, X):
        """
        Forward pass.
        Returns:
            probs: Class probabilities
            cache: Tuple of intermediate values for backprop
        """
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.relu(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.probs = self.softmax(self.z2)
        return self.probs

    def backward(self, X, y_one_hot):
        """
        Backward pass and weight update.
        """
        m = X.shape[0]

        # Output layer error (dZ2) = probs - y_one_hot
        dZ2 = self.probs - y_one_hot
        
        # Gradients for W2, b2
        dW2 = (1 / m) * np.dot(self.a1.T, dZ2)
        db2 = (1 / m) * np.sum(dZ2, axis=0, keepdims=True)

        # Hidden layer error
        dA1 = np.dot(dZ2, self.W2.T)
        dZ1 = dA1 * self.relu_deriv(self.z1)

        # Gradients for W1, b1
        dW1 = (1 / m) * np.dot(X.T, dZ1)
        db1 = (1 / m) * np.sum(dZ1, axis=0, keepdims=True)

        # Update weights
        self.W1 -= self.lr * dW1
        self.b1 -= self.lr * db1
        self.W2 -= self.lr * dW2
        self.b2 -= self.lr * db2

    def train(self, X, y, epochs=100):
        """
        Train the model.
        """
        # Convert y to one-hot
        num_classes = self.output_dim
        y_one_hot = np.zeros((X.shape[0], num_classes))
        y_one_hot[np.arange(X.shape[0]), y] = 1

        for i in range(epochs):
            self.forward(X)
            self.backward(X, y_one_hot)
            
            if i % 10 == 0:
                loss = -np.mean(np.sum(y_one_hot * np.log(self.probs + 1e-9), axis=1))
                print(f"Epoch {i}: Loss = {loss:.4f}")

    def predict(self, X):
        probs = self.forward(X)
        return np.argmax(probs, axis=1)
