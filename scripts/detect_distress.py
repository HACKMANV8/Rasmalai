import re
import os
import pickle
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/emotion_model.pkl")

if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        emotion_model = pickle.load(f)
else:
    emotion_model = None
def detect_keywords(transcript: str):
    distress_words = ["help", "fire", "stop", "danger", "emergency", "hurt", "attack"]
    transcript = transcript.lower()

    for word in distress_words:
        if re.search(rf"\b{word}\b", transcript):
            return {
                "distress_detected": True,
                "confidence": 0.9,
                "reason": f"keyword: '{word}'"
            }

    return {"distress_detected": False, "confidence": 0.2, "reason": "no keyword"}
def detect_emotion(transcript: str, volume=None, pitch=None):
    if emotion_model:
        try:
            prediction = emotion_model.predict([transcript])[0]
            return prediction
        except Exception:
            pass
    if (volume and volume > 0.7) or (pitch and pitch > 250):
        return "distressed"
    return "calm"
def analyze_distress(transcript: str, volume=None, pitch=None):
    keyword_result = detect_keywords(transcript)
    emotion_state = detect_emotion(transcript, volume, pitch)

    return {
        "transcript": transcript,
        "emotion": emotion_state,
        **keyword_result
    }
if __name__ == "__main__":
    example_data = {"transcript": "help me please", "volume": 0.8, "pitch": 230}

    result = analyze_distress(**example_data)
    print("Detection Result:", result)
