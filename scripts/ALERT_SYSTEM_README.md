# Alert & Response System

## Overview

The Alert & Response System automatically triggers an emergency response when distress is detected. It provides a 10-second false positive confirmation window, plays an alarm sound, and sends SMS notifications to emergency contacts with location and timestamp.

## Features

- ✅ **Automatic Alert Triggering**: Called automatically from detection logic
- ✅ **False Positive Confirmation**: 10-second window to cancel false alarms
- ✅ **Alarm Sound**: Plays audio alert when emergency confirmed
- ✅ **SMS Notifications**: Sends alerts to emergency contacts with:
  - User location (via IP geolocation)
  - Timestamp
  - Detection source and confidence
  - Alert details
- ✅ **Graceful Degradation**: Works even without Twilio (logs instead of sending SMS)

## Setup

### 1. Install Dependencies

```bash
pip install playsound twilio requests
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### 2. Configure the System

Run the configuration script:
```bash
python scripts/configure_alerts.py
```

This will prompt you to:
- Set up Twilio credentials (optional but recommended for SMS)
- Add emergency contacts with phone numbers

### 3. Twilio Setup (for SMS)

1. Sign up at https://www.twilio.com/try-twilio
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number from Twilio
4. Use the configuration script or manually edit `scripts/alert_config.json`

### 4. Optional: Add Alarm Sound

Place an alarm sound file at: `data/alarm.wav`

If no sound file is available, the system will:
- Use Windows `winsound` beep (on Windows)
- Use system bell (on Linux/Mac)
- Display a text message (fallback)

## Usage

### Automatic Integration

The alert system is automatically integrated into `detect_distress.py`. When distress is detected:

```python
from detect_distress import analyze_distress

# This will automatically trigger alerts if distress is detected
result = analyze_distress(
    transcript="help me please",
    volume=0.8,
    pitch=230
)
```

### Manual Trigger

You can also trigger alerts manually:

```python
from alert_system import trigger_alert

trigger_alert(
    source="manual_test",
    confidence=0.95,
    message="Test alert triggered manually"
)
```

### Programmatic Configuration

```python
from alert_system import configure_alert_system

configure_alert_system(
    twilio_sid="your_account_sid",
    twilio_token="your_auth_token",
    twilio_number="+1234567890",
    contacts=[
        {"name": "Emergency Services", "phone": "+1234567890"},
        {"name": "John Doe", "phone": "+0987654321"}
    ]
)
```

## Alert Flow

1. **Detection**: Distress is detected by keyword or emotion analysis
2. **Alert Prompt**: System prints alert message asking if it's a false positive
3. **10-Second Window**: User can type 'yes'/'y' to cancel
4. **Emergency Response** (if not cancelled):
   - Alarm sound plays
   - Location is retrieved
   - SMS notifications sent to all emergency contacts
5. **Completion**: System confirms response completion

## Configuration File

Configuration is stored in `scripts/alert_config.json`:

```json
{
  "twilio_account_sid": "",
  "twilio_auth_token": "",
  "twilio_phone_number": "",
  "emergency_contacts": [
    {"name": "Contact Name", "phone": "+1234567890"}
  ],
  "alert_window_seconds": 10,
  "use_location": true
}
```

## Testing

Test the alert system:

```bash
python scripts/alert_system.py
```

This will trigger a test alert where you can:
- Test the false positive confirmation
- Verify alarm sound (if configured)
- See SMS format (without sending, if Twilio not configured)

## Integration Points

The `trigger_alert()` function can be called from:

- ✅ `detect_distress.py` - Already integrated
- ✅ `keyword_detection.py` - Can be added
- ✅ `realtime_audio.py` - Can be added
- ✅ Any custom detection logic

## Requirements

### Required
- Python 3.7+
- `requests` - For location services

### Optional (but recommended)
- `playsound` - For alarm sound playback
- `twilio` - For SMS notifications
- `winsound` (Windows built-in) - Fallback alarm on Windows

## Notes

- Location services use free IP geolocation (no API key needed)
- SMS requires Twilio account and credentials
- System works in "demo mode" without Twilio (logs messages instead)
- Alarm sound file is optional - system has fallbacks
- All alerts are logged with timestamps

## Troubleshooting

**Alert not triggering:**
- Check that `alert_system.py` is in the same directory
- Verify distress detection is actually returning `distress_detected: True`

**SMS not sending:**
- Verify Twilio credentials in config file
- Check that phone numbers are in E.164 format (+1234567890)
- Verify Twilio account has sufficient credits

**No alarm sound:**
- Check if `data/alarm.wav` exists
- On Windows, system beep should work as fallback
- Install `playsound` if missing

**Location unavailable:**
- Check internet connection
- IP geolocation service may be temporarily unavailable
- System will continue without location if needed
