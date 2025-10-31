# Combined Pipeline Integration

## Overview

The combined pipeline has been successfully integrated into the backend API. This provides advanced emotion detection using multiple models (CREMA, RAVDESS, and HuggingFace) with voting-based ensemble prediction.

## New API Endpoint

### `POST /api/analyze-audio`

Analyzes audio files using the combined pipeline for advanced emotion detection.

**Request Options:**

1. **Multipart Form Data** (recommended):
   ```javascript
   const formData = new FormData();
   formData.append('audio', audioFile);
   
   fetch('/api/analyze-audio', {
     method: 'POST',
     body: formData
   })
   ```

2. **Base64 JSON**:
   ```json
   {
     "audio": "base64_encoded_audio_data",
     "sample_rate": 16000
   }
   ```

**Response:**
```json
{
  "success": true,
  "result": {
    "transcript": "transcribed text",
    "emotion": "distressed",
    "emotions": {
      "crema": "distressed",
      "ravdess": "distressed",
      "huggingface": "neutral",
      "final": "distressed"
    },
    "distress_detected": true,
    "confidence": 0.9,
    "reason": "keyword: 'help'"
  },
  "distress_detected": true,
  "timestamp": "2025-01-01T12:00:00",
  "alert_id": "alert_1234567890",
  "alert_triggered": true
}
```

## Features

### 1. **Multi-Model Emotion Detection**
- **CREMA Model**: Uses MFCC, chroma, RMS, and ZCR features
- **RAVDESS Model**: Uses MFCC and delta-MFCC features
- **HuggingFace Wav2Vec2**: Deep learning emotion recognition
- **Voting System**: Combines all three predictions via majority vote

### 2. **Advanced Audio Processing**
- Automatic transcription using Google Speech Recognition
- Supports WAV, MP3, and other formats (via librosa)
- Handles various sample rates (auto-resampled if needed)

### 3. **Integration with Alert System**
- Automatically triggers alerts if distress detected
- Uses combined emotion + keyword detection
- Same 10-second confirmation window as text analysis

## Usage Examples

### Frontend Integration

```typescript
import { api } from '@/lib/api';

// Analyze uploaded audio file
const handleAudioUpload = async (file: File) => {
  try {
    const result = await api.analyzeAudio(file);
    
    if (result.distress_detected) {
      console.log('Distress detected!');
      console.log('Emotions:', result.result.emotions);
      console.log('Alert ID:', result.alert_id);
    }
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

### Python Client

```python
import requests

# Upload audio file
with open('audio.wav', 'rb') as f:
    files = {'audio': f}
    response = requests.post('http://localhost:5000/api/analyze-audio', files=files)
    print(response.json())
```

## Model Loading

The pipeline gracefully handles missing models:
- If CREMA model missing: Falls back to RAVDESS + HuggingFace
- If RAVDESS model missing: Falls back to CREMA + HuggingFace
- If both missing: Uses only HuggingFace model
- Always works even if models are not available (with reduced accuracy)

## Dependencies

New dependencies added to `requirements.txt`:
- `librosa` - Audio processing
- `sounddevice` - Audio recording
- `speech-recognition` - Speech-to-text
- `soundfile` - Audio file I/O
- `torch` - PyTorch (for HuggingFace models)
- `transformers` - HuggingFace transformers

Install with:
```bash
pip install -r requirements.txt
```

## Backward Compatibility

The existing `/api/analyze` endpoint (text-based) still works as before. The new `/api/analyze-audio` endpoint provides enhanced emotion detection for audio files.

## Error Handling

The pipeline includes comprehensive error handling:
- Missing model files: Falls back to available models
- Audio loading errors: Returns clear error messages
- Transcription failures: Still performs emotion detection
- Network issues: Handles gracefully

## Performance

- **Model Loading**: Models loaded once at startup
- **Processing Time**: ~1-3 seconds per audio file (depends on length)
- **Memory**: Models kept in memory for fast inference

