# 🚀 Complete Integration - Quick Start Guide

## System Overview

The distress detection and alert system is now **fully integrated** end-to-end:

1. **Frontend** (React + TypeScript) → Real-time audio monitoring
2. **Backend** (Flask API) → Distress detection & alert management  
3. **Python Scripts** → Detection logic & email notifications

## ✅ Complete Workflow

```
🎤 Audio Input (Browser)
    ↓
📡 POST /api/analyze (Flask API)
    ↓
🔍 detect_distress.py analyzes
    ↓
🚨 Distress Detected?
    ├─ YES → Alert Dialog (10s countdown)
    │         ├─ Cancel → Alert cancelled, logged
    │         └─ Confirm/Auto → Emergency Response
    │                             ├─ 🔊 Alarm Sound
    │                             ├─ 📍 Get Location  
    │                             └─ 📧 Send Emails
    └─ NO → Continue monitoring
```

## 🛠️ Setup Instructions

### Step 1: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Configure Email

```bash
python scripts/configure_alerts.py
```

Or edit `scripts/alert_config.json` manually:
```json
{
  "email_smtp_server": "smtp.gmail.com",
  "email_smtp_port": 587,
  "email_username": "your-email@gmail.com",
  "email_password": "your-app-password",
  "email_from": "your-email@gmail.com",
  "emergency_contacts": [
    { "name": "Contact Name", "email": "contact@email.com" }
  ]
}
```

**For Gmail**: Create an App Password at https://myaccount.google.com/apppasswords

### Step 3: Start Backend Server

```bash
python app.py
```

✅ Backend running on: `http://localhost:5000`

### Step 4: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running on: `http://localhost:8080`

## 🧪 Testing the Complete System

1. **Open Dashboard**: Navigate to `http://localhost:8080`

2. **Start Audio Monitor**: Click "Start" button on Audio Monitor

3. **Trigger Test Alert**: Say one of these keywords:
   - "help"
   - "emergency"  
   - "danger"
   - "fire"

4. **Alert Dialog Appears**: 
   - Shows 10-second countdown
   - Option to cancel (false positive)
   - Auto-confirms if no action taken

5. **Emergency Response** (if confirmed):
   - Alarm sound plays
   - Location retrieved
   - Email sent to all emergency contacts

## 📡 API Endpoints

- `POST /api/analyze` - Analyze text for distress
- `POST /api/alert/cancel/<id>` - Cancel alert
- `POST /api/alert/confirm/<id>` - Confirm alert
- `GET /api/alerts/active` - Get active alerts
- `GET /api/alerts/history` - Get alert history
- `GET /api/config/contacts` - Get contacts
- `POST /api/config/contacts` - Add contact

## 🎨 Frontend Features

- **Dashboard**: Real-time audio monitoring with live distress detection
- **Alert Dialog**: Auto-appears on distress with 10s countdown
- **Contacts**: Add/delete emergency contacts (email-based)
- **Alert History**: View all past alerts with status

## ⚠️ Important Notes

- **Web Speech API**: Requires HTTPS in production (localhost works for development)
- **Browser Permissions**: Must allow microphone access
- **Email Setup**: Gmail App Password required (not regular password)
- **Alarm Sound**: Place `alarm.mp3` or `alarm.wav` in `data/` folder

## 🐛 Troubleshooting

**Backend not starting:**
- Check Python dependencies: `pip install -r requirements.txt`
- Verify Flask is installed: `pip install flask flask-cors`

**Frontend can't connect:**
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS is enabled in `app.py`

**No audio detection:**
- Allow microphone permissions in browser
- Check browser console for Web Speech API errors
- Try Chrome/Edge (best Web Speech API support)

**Email not sending:**
- Verify SMTP credentials in `alert_config.json`
- For Gmail: Use App Password, not regular password
- Check email password format (no spaces)

## 🎉 You're All Set!

The complete system is integrated and ready to use. Start both servers and test the full workflow!

