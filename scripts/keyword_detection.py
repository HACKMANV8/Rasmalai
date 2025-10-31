import speech_recognition as sr

DISTRESS_KEYWORDS = ["help", "stuck", "save me", "please help", "emergency"]
NEUTRAL_KEYWORDS = ["hello", "how are you", "good morning"]
POSITIVE_KEYWORDS = ["thank you", "great", "awesome", "nice"]

def detect_emotion_from_text(text: str):
    text_lower = text.lower()
    if any(word in text_lower for word in DISTRESS_KEYWORDS):
        return "distress"
    elif any(word in text_lower for word in POSITIVE_KEYWORDS):
        return "positive"
    elif any(word in text_lower for word in NEUTRAL_KEYWORDS):
        return "neutral"
    else:
        return "neutral"

def analyze_audio_from_mic():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎙️ Listening... Speak something (Ctrl+C to stop)...")
        audio = recognizer.listen(source)
        try:
            text = recognizer.recognize_google(audio)
            print(f"You said: {text}")
            emotion = detect_emotion_from_text(text)
            print(f"Detected emotion: {emotion}")
        except sr.UnknownValueError:
            print("Could not understand audio")
        except sr.RequestError as e:
            print(f"Error: {e}")

def analyze_audio_file(file_path):
    recognizer = sr.Recognizer()
    with sr.AudioFile(file_path) as source:
        print(f"🔍 Analyzing file: {file_path}")
        audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio)
            print(f"Transcribed text: {text}")
            emotion = detect_emotion_from_text(text)
            print(f"Detected emotion: {emotion}")
        except sr.UnknownValueError:
            print("Could not understand audio file")
        except sr.RequestError as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    print("🎧 Keyword Detection Started")
    choice = input("Type 'mic' for live detection or 'file' for audio file: ").strip().lower()
    if choice == "mic":
        analyze_audio_from_mic()
    elif choice == "file":
        path = input("Enter path to audio file (.wav): ").strip()
        analyze_audio_file(path)
    else:
        print("Invalid choice. Please type 'mic' or 'file'.")
