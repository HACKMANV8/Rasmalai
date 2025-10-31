import sounddevice as sd
import torch
import torch.nn.functional as F
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
from torchaudio.transforms import Resample

# Load pretrained model
model_name = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
extractor = Wav2Vec2FeatureExtractor.from_pretrained(model_name)
model = Wav2Vec2ForSequenceClassification.from_pretrained(model_name)

def record_audio(duration=4, fs=16000):
    print("🎙️ Recording audio...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1)
    sd.wait()
    print("✅ Done recording!")
    return torch.tensor(audio.T)

def predict_emotion(y, rate=16000):
    if rate != 16000:
        y = Resample(orig_freq=rate, new_freq=16000)(y)

    inputs = extractor(y.squeeze().numpy(), sampling_rate=16000, return_tensors="pt", padding=True)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = F.softmax(logits, dim=-1)

    label_map = ['angry', 'calm', 'disgust', 'fearful', 'happy', 'neutral', 'sad', 'surprised']
    pred_idx = torch.argmax(probs)
    base_emotion = label_map[pred_idx]
    confidence = probs[0, pred_idx].item()

    # emotion grouping: fear → distress (always)
    emotion_map = {
        "angry": "distress",
        "disgust": "distress",
        "fearful": "distress",   # 👈 fear now maps to distress always
        "sad": "distress",
        "calm": "neutral",
        "neutral": "neutral",
        "happy": "positive",
        "surprised": "positive"
    }

    # low-confidence override (optional)
    if confidence < 0.14:
        final_emotion = "neutral"
    else:
        final_emotion = emotion_map.get(base_emotion, "neutral")

    print(f"Predicted Emotion: {final_emotion.upper()} (base: {base_emotion}, confidence: {confidence:.2f})")


audio_tensor = record_audio()
predict_emotion(audio_tensor)
