# CS771 — Machine Learning Assignment 1: Hamming PUF Linearization

## Overview

This project implements a **feature mapping and SVM-based classifier** for a **Hamming Physical Unclonable Function (PUF)** as part of the CS771 (Introduction to Machine Learning) course at IIT Kanpur.

The goal is to learn the secret behavior of a Hamming PUF by mapping raw 32-bit binary challenges into a higher-dimensional feature space where the decision boundary becomes **linearly separable**, and then training a **Linear SVM** to predict PUF responses.

## How It Works

### Hamming PUF Model

A Hamming PUF computes its response as:

```
response = 1  if  h_even × h_odd >= threshold
           0  otherwise
```

Where:
- `h_even` = Hamming weight of even-indexed bits of `(challenge ⊕ secret)`
- `h_odd` = Hamming weight of odd-indexed bits of `(challenge ⊕ secret)`

### Feature Mapping (`my_map`)

The raw 32-bit challenge vector is mapped to a **288-dimensional** feature space:

| Feature Type       | Count | Description                                             |
|--------------------|-------|---------------------------------------------------------|
| Linear features    | 32    | Original challenge bits `c_0, c_1, ..., c_31`           |
| Cross-product terms| 256   | `c_{2i} × c_{2j+1}` for all `i, j ∈ {0..15}`          |
| **Total**          | **288** | Linearizes the quadratic PUF decision boundary        |

### Classifier (`my_params`)

A `LinearSVC` from scikit-learn is used with the following hyperparameters:

| Parameter   | Value           | Rationale                                                |
|-------------|-----------------|----------------------------------------------------------|
| `C`         | 1.0             | Standard regularization; data is separable in 288-D      |
| `loss`      | `squared_hinge` | Differentiable loss for faster convergence               |
| `dual`      | `False`         | Primal formulation is faster when `n_samples >> n_features` |
| `tol`       | 1e-4            | Default convergence tolerance                            |
| `max_iter`  | 3000            | Sufficient iterations for convergence                    |

## Project Structure

```
cs771/
├── README.md                      # This file
├── submit.py                      # Feature mapping + SVM hyperparameters
└── cs771 assignment1.pdf          # Assignment problem statement
```

## Tech Stack

- **Python 3**
- **NumPy** — Vectorized feature mapping
- **scikit-learn** — `LinearSVC` classifier

## Usage

The `submit.py` file exposes two functions used by the evaluation script:

```python
from submit import my_map, my_params

# Map raw challenges to 288-D feature space
X_mapped = my_map(X_raw)

# Get SVM hyperparameters
params = my_params(X_mapped, X_raw, y)

# Train the classifier
clf = LinearSVC(**params)
clf.fit(X_mapped, y)
```

## Key Insight

The product `h_even × h_odd` is a **quadratic function** of the challenge bits. By explicitly computing all 256 cross-product terms between even-indexed and odd-indexed bits, the decision boundary becomes a **linear hyperplane** in the 288-dimensional space — making it perfectly separable by a linear SVM.

## Course

**CS771 — Introduction to Machine Learning**  
IIT Kanpur
