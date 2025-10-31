import pickle
import numpy as np
import librosa

model_path = r"C:\Users\HP\OneDrive\Desktop\Rasmalai\models\emotion_model_ravdess.pkl"
with open(model_path, "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully")

def extract_features(file):
    y, sr = librosa.load(file, sr=None)
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    return mfcc  # Only MFCCs (40 features)

file_path = r"C:\Users\HP\OneDrive\Desktop\Rasmalai\data\sample.wav"
features = extract_features(file_path).reshape(1, -1)

pred = model.predict(features)
print("Predicted Emotion:", pred[0])
