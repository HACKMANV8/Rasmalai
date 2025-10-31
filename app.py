"""
Flask API Server for Distress Detection & Alert System
Connects frontend to backend Python scripts
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import json
from datetime import datetime
from typing import Dict, List

# Add scripts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'scripts'))

# Import backend modules
try:
    from detect_distress import analyze_distress
    from alert_system import trigger_alert, send_email, load_config
    from keyword_detection import detect_emotion_from_text
except ImportError as e:
    print(f"Warning: Could not import backend modules: {e}")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Store active alerts (in production, use Redis or database)
active_alerts = {}
alert_history = []


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "API is running"})


@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    """
    Analyze text for distress signals
    Expected JSON: {"transcript": "text", "volume": 0.8, "pitch": 230}
    """
    try:
        data = request.json
        transcript = data.get('transcript', '')
        volume = data.get('volume', None)
        pitch = data.get('pitch', None)
        
        if not transcript:
            return jsonify({"error": "Transcript is required"}), 400
        
        # Analyze for distress (includes emotion inference)
        result = analyze_distress(transcript=transcript, volume=volume, pitch=pitch)
        
        # Check if distress detected (from keywords or emotion)
        distress_detected = result.get('distress_detected', False)
        emotion = result.get('emotion', 'neutral')
        
        response = {
            "success": True,
            "result": result,
            "distress_detected": distress_detected,
            "timestamp": datetime.now().isoformat()
        }
        
        # If distress detected (by keyword or emotion), trigger alert
        if distress_detected:
            alert_id = f"alert_{int(datetime.now().timestamp() * 1000)}"
            confidence = result.get('confidence', 0.9)
            reason = result.get('reason', 'unknown')
            
            # Determine source based on detection method
            if 'emotion' in reason.lower():
                source = f"emotion_detection ({emotion})"
            else:
                source = reason.replace('keyword: ', '').strip("'")
            
            # Store alert info
            active_alerts[alert_id] = {
                "id": alert_id,
                "source": source,
                "confidence": confidence,
                "emotion": emotion,
                "message": f"Distress detected: {transcript}",
                "timestamp": datetime.now().isoformat(),
                "status": "pending_confirmation",
                "cancelled": False,
                "expires_at": (datetime.now().timestamp() + 10)  # 10 second window
            }
            
            response["alert_id"] = alert_id
            response["alert_triggered"] = True
            
            # Start 10-second countdown - auto-trigger if not cancelled
            start_alert_countdown(alert_id)
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/alert/cancel/<alert_id>', methods=['POST'])
def cancel_alert(alert_id):
    """Cancel an active alert (false positive)"""
    try:
        if alert_id in active_alerts:
            active_alerts[alert_id]['cancelled'] = True
            active_alerts[alert_id]['status'] = 'cancelled'
            
            # Add to history
            alert_history.append({
                **active_alerts[alert_id],
                "resolved_at": datetime.now().isoformat()
            })
            
            return jsonify({
                "success": True,
                "message": "Alert cancelled",
                "alert_id": alert_id
            })
        else:
            return jsonify({"error": "Alert not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/alert/confirm/<alert_id>', methods=['POST'])
def confirm_alert(alert_id):
    """Confirm an alert (proceed with emergency response)"""
    try:
        if alert_id in active_alerts:
            alert = active_alerts[alert_id]
            
            # Prevent duplicate triggers
            if alert.get('status') == 'confirmed' or alert.get('status') == 'responded':
                return jsonify({
                    "success": True,
                    "message": "Alert already confirmed",
                    "alert_id": alert_id
                })
            
            alert['status'] = 'confirmed'
            alert['confirmed_at'] = datetime.now().isoformat()
            
            # Trigger actual emergency response (alarm + location + emails)
            trigger_emergency_response(alert_id, alert)
            
            return jsonify({
                "success": True,
                "message": "Emergency response triggered",
                "alert_id": alert_id
            })
        else:
            return jsonify({"error": "Alert not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/alerts/active', methods=['GET'])
def get_active_alerts():
    """Get all active alerts"""
    active = {k: v for k, v in active_alerts.items() if v['status'] == 'pending'}
    return jsonify({"alerts": list(active.values())})


@app.route('/api/alerts/history', methods=['GET'])
def get_alert_history():
    """Get alert history"""
    limit = request.args.get('limit', 50, type=int)
    history = alert_history[-limit:]
    return jsonify({"alerts": history, "total": len(alert_history)})


@app.route('/api/config/contacts', methods=['GET'])
def get_contacts():
    """Get emergency contacts from config"""
    try:
        config = load_config()
        contacts = config.get('emergency_contacts', [])
        return jsonify({"contacts": contacts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/config/contacts', methods=['POST'])
def add_contact():
    """Add emergency contact"""
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        
        if not name or not email:
            return jsonify({"error": "Name and email required"}), 400
        
        config = load_config()
        contacts = config.get('emergency_contacts', [])
        contacts.append({"name": name, "email": email})
        
        # Save config
        config['emergency_contacts'] = contacts
        config_path = os.path.join(os.path.dirname(__file__), 'scripts', 'alert_config.json')
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        return jsonify({"success": True, "contacts": contacts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def start_alert_countdown(alert_id: str):
    """Start 10-second countdown. Auto-triggers emergency if not cancelled."""
    import threading
    import time
    
    def countdown():
        try:
            time.sleep(10)  # Wait 10 seconds
            # Check if alert still exists and wasn't cancelled
            if alert_id in active_alerts:
                alert = active_alerts[alert_id]
                if alert.get('status') == 'pending_confirmation' and not alert.get('cancelled', False):
                    # Auto-confirm and trigger emergency
                    print(f"⏱️  Alert {alert_id}: 10-second window expired. Auto-triggering emergency...")
                    alert['status'] = 'confirmed'
                    alert['confirmed_at'] = datetime.now().isoformat()
                    trigger_emergency_response(alert_id, alert)
        except Exception as e:
            print(f"Error in alert countdown: {e}")
    
    thread = threading.Thread(target=countdown, daemon=True)
    thread.start()


def trigger_emergency_response(alert_id: str, alert: Dict):
    """Trigger actual emergency response (alarm + email)"""
    import threading
    
    def run_response():
        try:
            from alert_system import send_notifications_to_contacts, get_location, play_alarm_sound
            import time
            
            # Get location
            location = get_location()
            
            # Play alarm sound
            play_alarm_sound()
            
            # Send emails
            timestamp = alert.get('timestamp', datetime.now().isoformat())
            send_notifications_to_contacts(
                location=location,
                timestamp=timestamp,
                source=alert.get('source', 'unknown'),
                confidence=alert.get('confidence', 0.9),
                message=alert.get('message', '')
            )
            
            # Update alert status
            alert['status'] = 'responded'
            alert['response_sent_at'] = datetime.now().isoformat()
            
            # Move to history
            alert_history.append(alert.copy())
            
        except Exception as e:
            print(f"Error in emergency response: {e}")
            alert['status'] = 'error'
            alert['error'] = str(e)
    
    thread = threading.Thread(target=run_response, daemon=True)
    thread.start()


# Serve frontend static files in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve frontend files"""
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')
    if os.path.exists(frontend_dir):
        if path and os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, 'index.html')
    return jsonify({"message": "Frontend not built. Run 'npm run build' in frontend directory"})


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Distress Detection API Server")
    print("=" * 60)
    print("API will be available at: http://localhost:5000")
    print("Frontend should proxy to: http://localhost:5000/api")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)

