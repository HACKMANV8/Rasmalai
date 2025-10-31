"""
Alert & Response System
Triggers immediate response when distress is detected.
Includes false positive confirmation, alarm sound, and email notifications.
"""

import threading
import time
import sys
from datetime import datetime
from typing import Optional, Dict, List
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

try:
    import playsound
    HAS_PLAYSOUND = True
except ImportError:
    HAS_PLAYSOUND = False

try:
    import pygame
    HAS_PYGAME = True
except ImportError:
    HAS_PYGAME = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    print("Warning: requests not installed. Location services will be disabled.")


# Configuration
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "alert_config.json")
# Try multiple audio formats
ALARM_SOUND_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "data", "alarm.mp3"),
    os.path.join(os.path.dirname(__file__), "..", "data", "alarm.wav"),
]

# Load or create default config
def load_config() -> Dict:
    """Load configuration from file or return defaults."""
    default_config = {
        "email_smtp_server": "smtp.gmail.com",
        "email_smtp_port": 587,
        "email_username": "",
        "email_password": "",  # For Gmail, use App Password
        "email_from": "",
        "emergency_contacts": [],
        "alert_window_seconds": 10,
        "use_location": True
    }
    
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                config = json.load(f)
                return {**default_config, **config}
        except Exception as e:
            print(f"Error loading config: {e}")
    
    return default_config

# Global alert state
_alert_cancelled = False
_config = load_config()


def get_location() -> Dict[str, str]:
    """
    Get current location using IP geolocation.
    Returns dict with 'latitude', 'longitude', and 'address'.
    """
    if not HAS_REQUESTS:
        return {
            "latitude": "Unknown",
            "longitude": "Unknown",
            "address": "Location service unavailable"
        }
    
    # Try multiple geolocation services as fallbacks
    services = [
        "http://ip-api.com/json/",
        "https://ipapi.co/json/",
        "http://ipinfo.io/json"
    ]
    
    for service_url in services:
        try:
            response = requests.get(service_url, timeout=3)
            if response.status_code == 200:
                data = response.json()
                
                # Handle different response formats
                if "ip-api.com" in service_url:
                    return {
                        "latitude": str(data.get("lat", "Unknown")),
                        "longitude": str(data.get("lon", "Unknown")),
                        "address": f"{data.get('city', '')}, {data.get('regionName', '')}, {data.get('country', '')}"
                    }
                elif "ipapi.co" in service_url:
                    return {
                        "latitude": str(data.get("latitude", "Unknown")),
                        "longitude": str(data.get("longitude", "Unknown")),
                        "address": f"{data.get('city', '')}, {data.get('region', '')}, {data.get('country_name', '')}"
                    }
                elif "ipinfo.io" in service_url:
                    loc = data.get("loc", "").split(",")
                    return {
                        "latitude": loc[0] if len(loc) > 0 else "Unknown",
                        "longitude": loc[1] if len(loc) > 1 else "Unknown",
                        "address": data.get("city", "") + ", " + data.get("region", "") + ", " + data.get("country", "")
                    }
        except requests.exceptions.RequestException as e:
            # Try next service
            continue
        except Exception as e:
            # Unexpected error, try next service
            continue
    
    # All services failed
    print("⚠️  Could not fetch location from any service (network may be unavailable)")
    return {
        "latitude": "Unknown",
        "longitude": "Unknown",
        "address": "Location unavailable (network error)"
    }


def play_alarm_sound():
    """Play alarm sound if available."""
    # Try to find an available alarm sound file
    alarm_file = None
    for path in ALARM_SOUND_PATHS:
        abs_path = os.path.abspath(path)
        # Also try relative to project root if running from scripts folder
        if not os.path.exists(abs_path):
            # Try path relative to project root (one level up from scripts)
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(script_dir)
            rel_path = os.path.join(project_root, "data", os.path.basename(path))
            if os.path.exists(rel_path):
                abs_path = os.path.abspath(rel_path)
        
        if os.path.exists(abs_path):
            alarm_file = abs_path
            print(f"🔊 Found alarm file: {alarm_file}")
            break
    
    if alarm_file:
        # Try pygame first (most reliable, supports MP3/WAV)
        if HAS_PYGAME:
            try:
                pygame.mixer.init()
                pygame.mixer.music.load(alarm_file)
                pygame.mixer.music.play()
                print(f"🔊 Playing alarm sound with pygame: {alarm_file}")
                # Wait a bit for sound to start, then return (sound plays in background)
                time.sleep(0.5)
                return
            except Exception as e:
                print(f"⚠️  Error playing with pygame: {e}")
        
        # Try playsound (works on Windows, Mac, Linux)
        if HAS_PLAYSOUND:
            try:
                # Use block=True in a thread to ensure sound plays
                import threading
                def play_in_thread():
                    try:
                        playsound.playsound(alarm_file, block=True)
                    except:
                        # Some versions need different call
                        playsound.playsound(alarm_file)
                thread = threading.Thread(target=play_in_thread, daemon=True)
                thread.start()
                print(f"🔊 Playing alarm sound with playsound: {alarm_file}")
                time.sleep(0.5)  # Give it time to start
                return
            except Exception as e:
                print(f"⚠️  Error playing with playsound: {e}")
        
        # Fallback: Try Windows winsound (WAV only)
        try:
            import winsound
            # winsound can play WAV files directly
            if alarm_file.lower().endswith('.wav'):
                winsound.PlaySound(alarm_file, winsound.SND_FILENAME | winsound.SND_ASYNC)
                print("🔊 Playing alarm with winsound")
                return
            else:
                # For MP3, use beep as fallback
                for _ in range(3):
                    winsound.Beep(1000, 500)
                    time.sleep(0.2)
                print("🔊 Playing alarm beep (MP3 format not supported by winsound)")
                return
        except Exception as e:
            print(f"⚠️  Error with winsound: {e}")
    
    # Final fallback: system beep
    try:
        import winsound  # Windows
        for _ in range(3):
            winsound.Beep(1000, 500)
            time.sleep(0.2)
        print("🔊 Playing system beep (fallback)")
    except:
        try:
            # Use module-level os import for system bell (Linux/Mac)
            os.system("printf '\a'")
            print("🔊 Playing system bell (fallback)")
        except:
            print("🔊 [ALARM SOUND] (could not play audio - no audio file or library available)")


def send_email(to_email: str, subject: str, message: str) -> bool:
    """
    Send email notification using SMTP.
    Returns True if successful, False otherwise.
    """
    smtp_server = _config.get("email_smtp_server", "").strip()
    smtp_port = _config.get("email_smtp_port", 587)
    email_username = _config.get("email_username", "").strip()
    email_password = _config.get("email_password", "").strip()
    email_from = _config.get("email_from", email_username).strip()
    
    if not all([smtp_server, email_username, email_password, email_from]):
        print(f"📧 [Email] Email not configured. Would send to {to_email}: {subject}")
        return False
    
    try:
        # Validate email format
        if "@" not in to_email or "@" not in email_from:
            print(f"⚠️  Invalid email format: {to_email}")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = email_from
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body to email
        msg.attach(MIMEText(message, 'plain'))
        
        # Create SMTP connection
        print(f"📧 Connecting to {smtp_server}:{smtp_port}...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable encryption
        server.login(email_username, email_password)
        
        # Send email
        text = msg.as_string()
        server.sendmail(email_from, to_email, text)
        server.quit()
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Email authentication error: Invalid username or password")
        print(f"   For Gmail: Use an App Password, not your regular password")
        print(f"   Create one at: https://myaccount.google.com/apppasswords")
        return False
    except smtplib.SMTPRecipientsRefused as e:
        print(f"❌ Email rejected: Invalid recipient address {to_email}")
        return False
    except smtplib.SMTPServerDisconnected as e:
        print(f"❌ Email connection error: Server disconnected")
        return False
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Email error to {to_email}: {error_msg}")
        return False


def send_notifications_to_contacts(location: Dict[str, str], timestamp: str, 
                                   source: str, confidence: float, message: str):
    """Send email notifications to all emergency contacts."""
    contacts = _config.get("emergency_contacts", [])
    
    if not contacts:
        print("⚠️  No emergency contacts configured. Skipping email notifications.")
        return
    
    subject = "🚨 EMERGENCY ALERT - Distress Detected"
    
    email_body = f"""🚨 EMERGENCY ALERT 🚨

Distress has been detected from the monitoring system.

DETECTION DETAILS:
• Source: {source}
• Confidence: {confidence:.1%}
• Details: {message}

LOCATION:
• Address: {location['address']}
• Coordinates: {location['latitude']}, {location['longitude']}

TIME:
• Detected at: {timestamp}

⚠️  Please respond immediately!

This is an automated alert from the distress detection system.
"""
    
    print(f"\n📤 Sending email alerts to {len(contacts)} contact(s)...")
    for contact in contacts:
        email = contact.get("email", "")
        if not email:
            print(f"⚠️  Skipping contact '{contact.get('name', 'Unknown')}' - no email address")
            continue
        
        send_email(email, subject, email_body)


def wait_for_user_input(timeout: float) -> bool:
    """
    Wait for user input with timeout.
    Returns True if user confirms false positive, False if timeout.
    """
    global _alert_cancelled
    
    def input_thread():
        global _alert_cancelled
        try:
            user_input = input().strip().lower()
            if user_input in ['yes', 'y', 'confirm', 'false positive']:
                _alert_cancelled = True
        except EOFError:
            pass  # Handle case where stdin is not available
    
    input_handler = threading.Thread(target=input_thread, daemon=True)
    input_handler.start()
    input_handler.join(timeout=timeout)
    
    return _alert_cancelled


def trigger_alert(source: str, confidence: float, message: str = ""):
    """
    Main alert trigger function.
    
    Args:
        source: Source of detection (e.g., "keyword_detection", "emotion_model")
        confidence: Confidence level of distress detection (0.0 to 1.0)
        message: Additional message/details about the detection
    
    Flow:
        1. Print alert asking if false positive
        2. Wait 10 seconds for user confirmation
        3. If confirmed false positive, cancel alert
        4. Otherwise, play alarm and send email notifications
    """
    global _alert_cancelled
    _alert_cancelled = False
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    print("\n" + "="*60)
    print("🚨 DISTRESS ALERT TRIGGERED 🚨")
    print("="*60)
    print(f"Source: {source}")
    print(f"Confidence: {confidence:.1%}")
    print(f"Message: {message}")
    print(f"Time: {timestamp}")
    print("-"*60)
    print("\n⚠️  Is this a FALSE POSITIVE?")
    print("Type 'yes' or 'y' within 10 seconds to cancel the alert...")
    print("(Otherwise, alarm will sound and emergency contacts will be notified)")
    print("\n> ", end="", flush=True)
    
    # Wait for user confirmation (10 second window)
    alert_window = _config.get("alert_window_seconds", 10)
    is_false_positive = wait_for_user_input(alert_window)
    
    if is_false_positive:
        print("\n✅ Alert CANCELLED - False positive confirmed")
        print("="*60 + "\n")
        return
    
    print(f"\n⏱️  {alert_window} seconds elapsed. Proceeding with emergency response...")
    print("="*60)
    
    # Get location
    location = {}
    if _config.get("use_location", True):
        print("\n📍 Getting location...")
        location = get_location()
        print(f"   Location: {location['address']}")
        print(f"   Coordinates: {location['latitude']}, {location['longitude']}")
    
    # Play alarm sound
    print("\n🔊 Playing alarm sound...")
    play_alarm_sound()
    
    # Send email notifications
    print("\n📧 Sending emergency email notifications...")
    send_notifications_to_contacts(location, timestamp, source, confidence, message)
    
    print("\n" + "="*60)
    print("✅ Emergency alert response completed")
    print("="*60 + "\n")


def configure_alert_system(email_smtp_server: str = "", email_smtp_port: int = 587,
                           email_username: str = "", email_password: str = "",
                           email_from: str = "", contacts: List[Dict] = None):
    """
    Configure the alert system with email credentials and emergency contacts.
    
    Args:
        email_smtp_server: SMTP server (e.g., 'smtp.gmail.com')
        email_smtp_port: SMTP port (587 for TLS, 465 for SSL)
        email_username: Email username/login
        email_password: Email password (use App Password for Gmail)
        email_from: From email address
        contacts: List of dicts with 'name' and 'email' keys
    """
    global _config
    
    config_updates = {}
    
    if email_smtp_server:
        config_updates["email_smtp_server"] = email_smtp_server
    if email_smtp_port:
        config_updates["email_smtp_port"] = email_smtp_port
    if email_username:
        config_updates["email_username"] = email_username
    if email_password:
        config_updates["email_password"] = email_password
    if email_from:
        config_updates["email_from"] = email_from
    if contacts:
        config_updates["emergency_contacts"] = contacts
    
    _config.update(config_updates)
    
    # Save to file
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(_config, f, indent=2)
        print("✅ Alert system configuration saved")
    except Exception as e:
        print(f"⚠️  Could not save config: {e}")
    
    return _config


# Example usage and integration
if __name__ == "__main__":
    # Test the alert system
    print("Testing Alert System...\n")
    
    # Example: Configure contacts (normally done separately)
    test_contacts = [
        {"name": "Emergency Services", "email": "emergency@example.com"},
        {"name": "John Doe", "email": "john@example.com"}
    ]
    
    # Uncomment to configure (requires email credentials):
    # configure_alert_system(
    #     email_smtp_server="smtp.gmail.com",
    #     email_smtp_port=587,
    #     email_username="your-email@gmail.com",
    #     email_password="your-app-password",
    #     email_from="your-email@gmail.com",
    #     contacts=test_contacts
    # )
    
    # Trigger a test alert
    print("\nTriggering test alert...")
    trigger_alert(
        source="test",
        confidence=0.95,
        message="This is a test alert"
    )
