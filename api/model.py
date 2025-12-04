import numpy as np
import tensorflow as tf
import joblib
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent
model_path = BASE_DIR / "models" / "lstm_cnn.keras"
scaler_path = BASE_DIR / "models" / "scalar_2d.pkl"

# Load model and scaler once
model = tf.keras.models.load_model(model_path)
scaler = joblib.load(scaler_path)

def predict(eeg_data):  # ✅ Accept raw list, not EEGInput
    try:
        X = np.array(eeg_data)
        if X.shape != (6, 320):
            raise ValueError(f"Expected shape (6, 320), got {X.shape}")

        # Scale and reshape
        X_flat = X.reshape(-1, 320)
        X_scaled = scaler.transform(X_flat)
        X_scaled = X_scaled.reshape(6, 320)
        X_scaled = np.expand_dims(X_scaled, axis=0)  # (1, 6, 320)

        prediction = model.predict(X_scaled)
        result = "focused" if prediction[0][0] > 0.5 else "unfocused"

        return result

    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")
