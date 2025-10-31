/**
 * API Client for backend communication
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface DistressAnalysis {
  transcript: string;
  emotion: string;
  distress_detected: boolean;
  confidence: number;
  reason: string;
}

export interface Alert {
  id: string;
  source: string;
  confidence: number;
  message: string;
  timestamp: string;
  status: 'pending' | 'pending_confirmation' | 'confirmed' | 'cancelled' | 'responded' | 'error';
  cancelled?: boolean;
}

export interface AnalyzeResponse {
  success: boolean;
  result: DistressAnalysis;
  distress_detected: boolean;
  timestamp: string;
  alert_id?: string;
  alert_triggered?: boolean;
}

export const api = {
  /**
   * Analyze text/audio for distress signals
   */
  async analyze(transcript: string, volume?: number, pitch?: number): Promise<AnalyzeResponse> {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, volume, pitch }),
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  },

  /**
   * Analyze audio file using combined pipeline (advanced emotion detection)
   */
  async analyzeAudio(audioFile: File): Promise<AnalyzeResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    const response = await fetch(`${API_BASE}/analyze-audio`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Audio analysis failed');
    return response.json();
  },

  /**
   * Cancel an alert (false positive)
   */
  async cancelAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/alert/cancel/${alertId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cancel alert');
    return response.json();
  },

  /**
   * Confirm an alert (proceed with emergency)
   */
  async confirmAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/alert/confirm/${alertId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to confirm alert');
    return response.json();
  },

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_BASE}/alerts/active`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    const data = await response.json();
    return data.alerts || [];
  },

  /**
   * Get alert history
   */
  async getAlertHistory(limit: number = 50): Promise<Alert[]> {
    const response = await fetch(`${API_BASE}/alerts/history?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    return data.alerts || [];
  },

  /**
   * Get emergency contacts
   */
  async getContacts(): Promise<Array<{ name: string; email: string }>> {
    const response = await fetch(`${API_BASE}/config/contacts`);
    if (!response.ok) throw new Error('Failed to fetch contacts');
    const data = await response.json();
    return data.contacts || [];
  },

  /**
   * Add emergency contact
   */
  async addContact(name: string, email: string): Promise<{ success: boolean; contacts: any[] }> {
    const response = await fetch(`${API_BASE}/config/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (!response.ok) throw new Error('Failed to add contact');
    return response.json();
  },
};

