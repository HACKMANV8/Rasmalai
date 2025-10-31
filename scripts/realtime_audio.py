import sounddevice as sd
import librosa
import numpy as np
import pickle


model_path = r"C:\Users\san-s\OneDrive\Desktop\Rasmalai\models\emotion_model.pkl"
with open(model_path, "rb") as f:
    model = pickle.load(f)

print(" Model loaded successfully")


def extract_features_from_audio(y, sr):
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    chroma = np.mean(librosa.feature.chroma_stft(S=np.abs(librosa.stft(y)), sr=sr).T, axis=0)
    rms = np.mean(librosa.feature.rms(y=y))
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))
    return np.hstack([mfcc, chroma, rms, zcr])

def record_audio(duration=3, fs=16000):
    print("Recording...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1)
    sd.wait()
    print("Recording complete")
    y = np.squeeze(audio)
    return y, fs


y, sr = record_audio(3)
features = extract_features_from_audio(y, sr).reshape(1, -1)
emotion = model.predict(features)[0]

print("Predicted Emotion:", emotion)
