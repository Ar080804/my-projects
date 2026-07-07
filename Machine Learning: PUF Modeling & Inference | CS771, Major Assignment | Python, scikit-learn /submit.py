import numpy as np
import sklearn
from sklearn.svm import LinearSVC
# You are allowed to import any submodules of numpy or sklearn e.g. sklearn.metrics.accuracy_score to calculate accuracy of a learnt model
# You are not allowed to use other libraries such as scipy, keras, tensorflow etc
# SUBMIT YOUR CODE AS A SINGLE PYTHON (.PY) FILE INSIDE A ZIP ARCHIVE
# THE NAME OF THE PYTHON FILE MUST BE submit.py
# DO NOT CHANGE THE NAME OF THE METHODS my_map, my_params etc BELOW
# THESE WILL BE INVOKED BY THE EVALUATION SCRIPT. CHANGING THESE NAMES WILL CAUSE EVALUATION FAILURE
# You may define any new functions, variables, classes here
################################
# Non Editable Region Starting #
################################
def my_map( X ):
################################
#  Non Editable Region Ending  #
################################
    # Use this method to map raw 32-bit challenges to a 288-dimensional feature space
    # that linearizes the Hamming PUF decision boundary.
    #
    # The Hamming PUF computes: response = 1 if h_e * h_o >= t, else 0
    # where h_e = Hamming weight of even-indexed bits of (challenge XOR secret)
    #       h_o = Hamming weight of odd-indexed bits of (challenge XOR secret)
    #
    # Expanding the product h_e * h_o yields:
    #   - 256 cross-product terms: c_{2i} * c_{2j+1} for all i,j in {0..15}
    #   - 32 linear terms in challenge bits c_k
    #   - a constant (absorbed into the bias)
    #
    # Therefore, the map phi(c) = [c_0, ..., c_31, c_0*c_1, c_0*c_3, ..., c_30*c_31]
    # has dimensionality D = 32 + 16*16 = 288.
    
    # 1. Isolate even-indexed bits (indices 0, 2, 4, ..., 30) -> Shape: (N, 16)
    evens = X[:, 0::2]
    
    # 2. Isolate odd-indexed bits (indices 1, 3, 5, ..., 31) -> Shape: (N, 16)
    odds = X[:, 1::2]
    
    # 3. Compute cross-products of every even bit with every odd bit
    #    (N, 16, 1) * (N, 1, 16) -> (N, 16, 16) via broadcasting
    cross_prods = evens[:, :, np.newaxis] * odds[:, np.newaxis, :]
    
    # 4. Flatten the 16x16 cross-product matrix per sample -> (N, 256)
    cross_prods_flat = cross_prods.reshape(X.shape[0], -1)
    
    # 5. Concatenate original 32 linear features with 256 cross-product features
    #    Final shape: (N, 288)
    X_map = np.hstack((X, cross_prods_flat))
    
    return X_map
################################
# Non Editable Region Starting #
################################
def my_params( X_map, X_raw, y ):
################################
#  Non Editable Region Ending  #
################################
    # Use this method to return your preferred hyperparameters for LinearSVC.
    #
    # Key choices:
    # - dual=False: Since n_samples (7500) >> n_features (288), the primal
    #   formulation is significantly faster than the dual.
    # - squared_hinge: Differentiable loss converges faster than hinge.
    # - C=1.0: Standard regularization; data is linearly separable in 288-D
    #   so moderate C suffices for perfect accuracy.
    # - max_iter=3000: Sufficient for convergence with squared_hinge + primal.
    
    params = {
        'C': 1.0,
        'loss': 'squared_hinge',
        'dual': False,
        'tol': 1e-4,
        'max_iter': 3000
    }
    
    return params