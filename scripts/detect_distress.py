import re
import os
import sys
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

    # Check if distress detected by emotion (fearful, angry, sad -> distress)
    emotion_distress = emotion_state in ["distressed", "fearful", "angry", "sad"]
    
    # Combine keyword and emotion detection
    distress_detected = keyword_result.get("distress_detected", False) or emotion_distress
    
    # Adjust confidence based on both sources
    confidence = keyword_result.get("confidence", 0.2)
    if emotion_distress and not keyword_result.get("distress_detected", False):
        confidence = 0.7  # Emotion-based detection has moderate confidence
        keyword_result["reason"] = f"emotion: '{emotion_state}'"
    
    result = {
        "transcript": transcript,
        "emotion": emotion_state,
        "distress_detected": distress_detected,
        "confidence": confidence,
        **keyword_result
    }
    
    return result
if __name__ == "__main__":
    example_data = {"transcript": "help me please", "volume": 0.8, "pitch": 230}

    result = analyze_distress(**example_data)
    print("Detection Result:", result)
