import os
import pickle
import warnings
import time
import shutil
import numpy as np
import librosa
import sounddevice as sd
import torch
import speech_recognition as sr
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForSequenceClassification
import soundfile as sf
import tempfile

warnings.filterwarnings("ignore", category=UserWarning)

model_name = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
extractor = Wav2Vec2FeatureExtractor.from_pretrained(model_name)
hf_model = Wav2Vec2ForSequenceClassification.from_pretrained(model_name)
hf_model.eval()

hf_label_map = {
    0: "neutral",
    1: "positive",
    2: "distressed",
    3: "distressed",
    4: "distressed",
    5: "distressed",
    6: "positive",
}

CREMA_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "emotion_model.pkl")
RAVDESS_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "emotion_model_ravdess.pkl")

# Load models with error handling (graceful degradation)
crema_model = None
ravdess_model = None

try:
    if os.path.exists(CREMA_PATH):
        crema_model = pickle.load(open(CREMA_PATH, "rb"))
        print(f"✅ Loaded CREMA model from {CREMA_PATH}")
    else:
        print(f"⚠️  CREMA model not found at {CREMA_PATH}")
except Exception as e:
    print(f"⚠️  Could not load CREMA model: {e}")

try:
    if os.path.exists(RAVDESS_PATH):
        ravdess_model = pickle.load(open(RAVDESS_PATH, "rb"))
        print(f"✅ Loaded RAVDESS model from {RAVDESS_PATH}")
    else:
        print(f"⚠️  RAVDESS model not found at {RAVDESS_PATH}")
except Exception as e:
    print(f"⚠️  Could not load RAVDESS model: {e}")

crema_label_map = {
    "neutral": "neutral",
    "happy": "positive",
    "sad": "distressed",
    "angry": "distressed",
    "fear": "distressed",
    "disgust": "distressed",
    "surprise": "positive",
}

ravdess_label_map = {
    "neutral": "neutral",
    "calm": "neutral",
    "happy": "positive",
    "sad": "distressed",
    "angry": "distressed",
    "fear": "distressed",
    "disgust": "distressed",
    "surprise": "positive",
}

DISTRESS_KEYWORDS = ["help", "fire", "stop", "danger", "emergency", "hurt", "attack"]


def detect_keywords(transcript: str):
    if not transcript:
        return {"distress_detected": False, "reason": "no keyword"}
    transcript_lower = transcript.lower()
    for word in DISTRESS_KEYWORDS:
        if word in transcript_lower:
            return {"distress_detected": True, "reason": f"keyword: '{word}'"}
    return {"distress_detected": False, "reason": "no keyword"}



def extract_features_crema(y, sample_rate):

    mfcc = librosa.feature.mfcc(y=y, sr=sample_rate, n_mfcc=20)
    mfcc_mean = np.mean(mfcc, axis=1)
    delta_mfcc = np.mean(librosa.feature.delta(mfcc), axis=1)
    chroma = np.mean(librosa.feature.chroma_stft(S=np.abs(librosa.stft(y)), sr=sample_rate), axis=1)
    rms = np.mean(librosa.feature.rms(y=y))
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))
    features = np.hstack([mfcc_mean, delta_mfcc, chroma, rms, zcr])
    return features.reshape(1, -1)


def extract_features_ravdess(y, sample_rate):

    mfcc = librosa.feature.mfcc(y=y, sr=sample_rate, n_mfcc=20)
    mfcc_mean = np.mean(mfcc, axis=1)
    delta_mfcc = np.mean(librosa.feature.delta(mfcc), axis=1)
    features = np.hstack([mfcc_mean, delta_mfcc])
    return features.reshape(1, -1)

def predict_hf(waveform, sample_rate):

    try:
        inputs = extractor(waveform, sampling_rate=sample_rate, return_tensors="pt", padding=True)
        with torch.no_grad():
            logits = hf_model(**inputs).logits
            pred_idx = int(torch.argmax(logits, dim=-1).item())
        return hf_label_map.get(pred_idx, "neutral")
    except Exception:
        return "neutral"

def predict_emotion_combined(y, sample_rate):

    if isinstance(y, np.ndarray) and y.ndim > 1:
        y = y.flatten()
    
    # CREMA model prediction
    if crema_model is not None:
        try:
            feats_crema = extract_features_crema(y, sample_rate)
            if feats_crema.shape[1] != getattr(crema_model, "n_features_in_", feats_crema.shape[1]):
                required = getattr(crema_model, "n_features_in_", feats_crema.shape[1])
                feats_crema = np.resize(feats_crema, (1, required))
            crema_pred_raw = crema_model.predict(feats_crema)[0]
            crema_pred = crema_label_map.get(crema_pred_raw, "neutral")
        except Exception:
            crema_pred = "neutral"
    else:
        crema_pred = "neutral"

    # RAVDESS model prediction
    if ravdess_model is not None:
        try:
            feats_ravdess = extract_features_ravdess(y, sample_rate)
            if feats_ravdess.shape[1] != getattr(ravdess_model, "n_features_in_", feats_ravdess.shape[1]):
                required = getattr(ravdess_model, "n_features_in_", feats_ravdess.shape[1])
                feats_ravdess = np.resize(feats_ravdess, (1, required))
            ravdess_pred_raw = ravdess_model.predict(feats_ravdess)[0]
            ravdess_pred = ravdess_label_map.get(ravdess_pred_raw, "neutral")
        except Exception:
            ravdess_pred = "neutral"
    else:
        ravdess_pred = "neutral"

    # HuggingFace model prediction
    hf_pred = predict_hf(y, sample_rate)

    # Combine predictions via voting
    votes = [v for v in [crema_pred, ravdess_pred, hf_pred] if v != "neutral" or len([crema_pred, ravdess_pred, hf_pred]) == 3]
    if not votes:
        votes = [crema_pred, ravdess_pred, hf_pred]
    
    vote_counts = {k: votes.count(k) for k in set(votes)}
    final_pred = max(vote_counts, key=vote_counts.get) if vote_counts else "neutral"
    
    return crema_pred, ravdess_pred, hf_pred, final_pred

def record_audio(duration=4, sample_rate=16000):
    try:
        print(f"Recording {duration}s of audio")
        y = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype="float32")
        sd.wait()
        print("Recording done!")
        return y.flatten(), sample_rate
    except Exception as e:
        raise RuntimeError(f"Audio recording failed: {e}")

def transcribe_audio(y, sample_rate, max_retries=5, retry_delay=0.25):
    """
    Writes y to a temporary wav, transcribes using Google (speech_recognition),
    and safely removes the temp file on Windows (with retries).
    """
    if isinstance(y, np.ndarray) and y.ndim > 1:
        y = y.flatten()

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    temp_path = tmp.name
    tmp.close()

    try:
        
        sf.write(temp_path, y, sample_rate, format="WAV")
    except Exception as e:
     
        try:
            os.remove(temp_path)
        except Exception:
            pass
        return ""

    recognizer = sr.Recognizer()
    text = ""
    try:
        with sr.AudioFile(temp_path) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                text = ""
            except sr.RequestError:
                text = ""
    except Exception:
        text = ""

    for attempt in range(max_retries):
        try:
            if not os.path.exists(temp_path):
                break
            dummy = temp_path + ".deleteme"
            try:
                shutil.move(temp_path, dummy)
                os.remove(dummy)
                break
            except (PermissionError, OSError):
         
                try:
                    os.remove(temp_path)
                    break
                except (PermissionError, OSError):
                    time.sleep(retry_delay)
        except Exception:
            time.sleep(retry_delay)
    else:

        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

    return text

def analyze_audio_pipeline(duration=4):
    y, sample_rate = record_audio(duration)
    transcript = transcribe_audio(y, sample_rate)

    crema_pred, ravdess_pred, hf_pred, final_pred = predict_emotion_combined(y, sample_rate)
    keywords_result = detect_keywords(transcript)

    print("\n--- AUDIO TRANSCRIPTION ---")
    print(transcript or "[Unrecognized speech]")
    print("\n--- KEYWORD DISTRESS CHECK ---")
    print(keywords_result)
    print("\n--- EMOTION PREDICTIONS ---")
    print(f"CREMA-D: {crema_pred} | RAVDESS: {ravdess_pred} | HuggingFace: {hf_pred}")
    print(f"Final Emotion Prediction: {final_pred}")

    print(f"\nSUMMARY: [{final_pred.upper()}] \"{(transcript or '').strip()}\"")


def analyze_audio_from_data(audio_data, sample_rate):
    """
    Analyze audio from numpy array or file data.
    Returns: dict with transcript, emotions, and distress detection.
    """
    if isinstance(audio_data, np.ndarray) and audio_data.ndim > 1:
        audio_data = audio_data.flatten()
    
    # Transcribe audio
    transcript = transcribe_audio(audio_data, sample_rate)
    
    # Predict emotion using combined models
    crema_pred, ravdess_pred, hf_pred, final_pred = predict_emotion_combined(audio_data, sample_rate)
    
    # Detect keywords
    keywords_result = detect_keywords(transcript)
    
    # Determine if distress detected
    distress_detected = keywords_result.get("distress_detected", False) or final_pred == "distressed"
    
    return {
        "transcript": transcript or "[Unrecognized speech]",
        "keywords": keywords_result,
        "emotions": {
            "crema": crema_pred,
            "ravdess": ravdess_pred,
            "huggingface": hf_pred,
            "final": final_pred
        },
        "distress_detected": distress_detected,
        "confidence": 0.9 if keywords_result.get("distress_detected") else (0.7 if final_pred == "distressed" else 0.2),
        "reason": keywords_result.get("reason", f"emotion: '{final_pred}'") if not keywords_result.get("distress_detected") else keywords_result.get("reason")
    }


if __name__ == "__main__":
    analyze_audio_pipeline(duration=4)