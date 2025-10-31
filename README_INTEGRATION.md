# Complete Integration Guide

## 🎯 Full Workflow

The system is now fully integrated end-to-end:

1. **Audio Capture** → Frontend captures audio via Web Speech API
2. **Analysis** → Audio sent to Flask API → Python detects distress
3. **Alert Trigger** → If distress detected, alert dialog appears in frontend
4. **User Confirmation** → 10-second window to cancel (false positive) or confirm
5. **Emergency Response** → If confirmed:
   - Alarm sound plays
   - Location retrieved
   - Email sent to emergency contacts

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Email Alerts

```bash
python scripts/configure_alerts.py
```

Or manually edit `scripts/alert_config.json` with:
- SMTP server (e.g., `smtp.gmail.com`)
- Email credentials
- Emergency contact emails

### 3. Start Backend Server

```bash
python app.py
```

Server runs on: `http://localhost:5000`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:8080`

## 📡 API Endpoints

### Analysis
- `POST /api/analyze` - Analyze text for distress
  ```json
  {
    "transcript": "help me please",
    "volume": 0.8,
    "pitch": 230
  }
  ```

### Alerts
- `POST /api/alert/cancel/<alert_id>` - Cancel alert (false positive)
- `POST /api/alert/confirm/<alert_id>` - Confirm alert (trigger emergency)
- `GET /api/alerts/active` - Get active alerts
- `GET /api/alerts/history` - Get alert history

### Contacts
- `GET /api/config/contacts` - Get emergency contacts
- `POST /api/config/contacts` - Add emergency contact

## 🔄 Complete Flow

```
User speaks → Web Speech API → Frontend
                                  ↓
                          POST /api/analyze
                                  ↓
                      detect_distress.py analyzes
                                  ↓
                    Distress detected? → YES
                                  ↓
                    Alert dialog appears (10s countdown)
                                  ↓
              User cancels? → YES → Alert cancelled, log event
                    NO
                  ↓
        Emergency response triggered
                  ↓
    ┌─────────────────────────────────────┐
    │ 1. Alarm sound plays                │
    │ 2. Location retrieved                │
    │ 3. Email sent to all contacts        │
    └─────────────────────────────────────┘
```

## 🎨 Frontend Features

- **Dashboard**: Real-time audio monitoring with distress detection
- **Alert Dialog**: Auto-appears when distress detected (10s countdown)
- **Contacts**: Manage emergency contacts (email-based)
- **Alert History**: View past alerts with status tracking

## ⚙️ Configuration

Edit `scripts/alert_config.json`:
```json
{
  "email_smtp_server": "smtp.gmail.com",
  "email_smtp_port": 587,
  "email_username": "your-email@gmail.com",
  "email_password": "your-app-password",
  "email_from": "your-email@gmail.com",
  "emergency_contacts": [
    { "name": "Contact Name", "email": "contact@email.com" }
  ],
  "alert_window_seconds": 10,
  "use_location": true
}
```

## 🔧 Testing

1. Start both servers (backend + frontend)
2. Open Dashboard
3. Click "Start" on Audio Monitor
4. Say: "help me" or "emergency"
5. Alert dialog should appear
6. Test cancel (false positive) or confirm (triggers email)

## 📝 Notes

- Web Speech API requires HTTPS in production (or localhost)
- Email requires SMTP credentials (Gmail App Password recommended)
- Alarm sound requires `data/alarm.mp3` or `data/alarm.wav`
- Location uses free IP geolocation (works without API keys)

