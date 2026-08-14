import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ComplimentTemplate {
  id: string;
  category: 'Vibe' | 'Focus' | 'Creativity' | 'Kindness' | 'General';
  text: string;
}

export interface ComplimentStatus {
  available: boolean;
  resetInSeconds: number;
  dateKey: string;
}

export interface ReceivedCompliment {
  id: string;
  category: string;
  text: string;
  receivedAt: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  let token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() })
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      headers['Authorization'] = `Bearer ${data.accessToken}`;
      res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.reload();
      throw new Error('Session expired. Please log in again.');
    }
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.message || 'Request failed');
  }

  return json;
}

export const complimentService = {
  getTemplates: async (): Promise<ComplimentTemplate[]> => {
    const data = await fetchWithAuth('/compliments/templates');
    return data.templates;
  },

  getStatus: async (): Promise<ComplimentStatus> => {
    const data = await fetchWithAuth('/compliments/status');
    return data.status;
  },

  sendCompliment: async (targetEchoId: string, templateId: string): Promise<{ complimentId: string; message: string }> => {
    return await fetchWithAuth('/compliments/send', {
      method: 'POST',
      body: JSON.stringify({ targetEchoId, templateId })
    });
  },

  getReceivedCompliments: async (): Promise<ReceivedCompliment[]> => {
    const data = await fetchWithAuth('/compliments/received');
    return data.compliments;
  }
};
