"""
Configuration script for the Alert & Response System.
Helps users set up email credentials and emergency contacts.
"""

import json
import os
from alert_system import configure_alert_system, load_config

def main():
    print("="*60)
    print("Alert System Configuration")
    print("="*60)
    print()
    
    config = load_config()
    
    print("Current Configuration:")
    print(f"  Alert Window: {config.get('alert_window_seconds', 10)} seconds")
    print(f"  Emergency Contacts: {len(config.get('emergency_contacts', []))}")
    print()
    
    # Email Configuration
    print("Email Configuration (required for alerts):")
    print("  Supports Gmail, Outlook, Yahoo, and other SMTP providers")
    print("  For Gmail: Use an App Password (not your regular password)")
    print("  Create App Password: https://myaccount.google.com/apppasswords")
    print()
    
    configure_email = input("Configure Email? (y/n): ").strip().lower() == 'y'
    
    email_smtp_server = ""
    email_smtp_port = 587
    email_username = ""
    email_password = ""
    email_from = ""
    
    if configure_email:
        print("\nSMTP Server Configuration:")
        print("  Common servers:")
        print("  - Gmail: smtp.gmail.com (port 587)")
        print("  - Outlook: smtp-mail.outlook.com (port 587)")
        print("  - Yahoo: smtp.mail.yahoo.com (port 587)")
        
        email_smtp_server = input("  SMTP Server (e.g., smtp.gmail.com): ").strip() or "smtp.gmail.com"
        port_input = input("  SMTP Port (default: 587): ").strip()
        email_smtp_port = int(port_input) if port_input.isdigit() else 587
        
        email_username = input("  Email username/login: ").strip()
        email_password = input("  Email password (App Password for Gmail): ").strip()
        email_from = input("  From email address (leave empty to use username): ").strip() or email_username
    
    # Emergency Contacts
    print("\nEmergency Contacts:")
    print("  Add contacts who should receive email alerts")
    contacts = []
    
    while True:
        print(f"\nContact #{len(contacts) + 1}:")
        name = input("  Name (or 'done' to finish): ").strip()
        
        if name.lower() == 'done':
            break
        
        email = input("  Email address (e.g., contact@example.com): ").strip()
        
        if name and email:
            contacts.append({"name": name, "email": email})
            print(f"  ✅ Added {name}")
        else:
            print("  ⚠️  Both name and email are required")
    
    # Save configuration
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
    
    if config_updates:
        current_config = config.copy()
        current_config.update(config_updates)
        configure_alert_system(
            email_smtp_server=current_config.get("email_smtp_server", ""),
            email_smtp_port=current_config.get("email_smtp_port", 587),
            email_username=current_config.get("email_username", ""),
            email_password=current_config.get("email_password", ""),
            email_from=current_config.get("email_from", ""),
            contacts=current_config.get("emergency_contacts", [])
        )
        print("\n✅ Configuration saved successfully!")
    else:
        print("\n⚠️  No changes made.")
    
    print("\nNote: Even without email configured, the alert system will:")
    print("  - Show alert messages")
    print("  - Allow false positive confirmation")
    print("  - Play alarm sounds")
    print("  - Log email messages (but not send them)")

if __name__ == "__main__":
    main()
