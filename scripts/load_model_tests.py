import pickle
import numpy as np
import librosa
import os

model_path = r"C:\Users\san-s\OneDrive\Desktop\Rasmalai\models\emotion_model.pkl"
with open(model_path, "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully")

def extract_features(file):
    y, sr = librosa.load(file, sr=None)
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    chroma = np.mean(librosa.feature.chroma_stft(S=np.abs(librosa.stft(y)), sr=sr).T, axis=0)
    rms = np.mean(librosa.feature.rms(y=y))
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))
    return np.hstack([mfcc, chroma, rms, zcr])

file_path = r"C:\Users\san-s\OneDrive\Desktop\Rasmalai\data\sample.wav"  
features = extract_features(file_path).reshape(1, -1)

pred = model.predict(features)
print("Predicted Emotion:", pred[0])
