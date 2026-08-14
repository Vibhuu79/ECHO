import { SendOtpResponse, VerifyOtpResponse, RegisterResponse, LoginPasswordResponse, MessageResponse, User } from '../types/auth';
import { GetNearbyResponse, MoodType } from '../types/discovery';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

export const getAccessToken = (): string | null => localStorage.getItem('echo_access_token');
export const setAccessToken = (token: string): void => localStorage.setItem('echo_access_token', token);
export const getRefreshToken = (): string | null => localStorage.getItem('echo_refresh_token');
export const setRefreshToken = (token: string): void => localStorage.setItem('echo_refresh_token', token);
export const clearTokens = (): void => {
  localStorage.removeItem('echo_access_token');
  localStorage.removeItem('echo_refresh_token');
  sessionStorage.removeItem('echo_registration_token');
};

async function safeParseJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text || !text.trim()) {
    if (!res.ok) {
      throw new Error(`Server request failed (${res.status} ${res.statusText || 'No Content'})`);
    }
    return { success: true };
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Server Error (${res.status}): ${text.slice(0, 120)}`);
    }
    throw new Error('Invalid response received from server.');
  }
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

  // Handle Token Expiry & Automatic Refresh
  if (res.status === 401 && getRefreshToken()) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() })
    });

    if (refreshRes.ok) {
      const data = await safeParseJson(refreshRes);
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

  const json = await safeParseJson(res);
  if (!res.ok) {
    throw new Error(json.error?.message || json.message || `Request failed (${res.status})`);
  }

  return json;
}

export const api = {
  sendOtp: async (email: string): Promise<SendOtpResponse> => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await safeParseJson(res);
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Failed to send OTP');
    }
    return json;
  },

  verifyOtp: async (email: string, otp: string): Promise<VerifyOtpResponse> => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const json = await safeParseJson(res);
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Verification failed');
    }
    return json;
  },

  loginWithPassword: async (email: string, password: string): Promise<LoginPasswordResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await safeParseJson(res);
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Login failed');
    }
    return json;
  },

  register: async (username: string, password?: string, registrationToken?: string): Promise<RegisterResponse> => {
    const token = registrationToken || sessionStorage.getItem('echo_registration_token');
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ username, password, registrationToken: token })
    });
    const json = await safeParseJson(res);
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Registration failed');
    }
    return json;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<MessageResponse> => {
    return await fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  resetPasswordWithOtp: async (email: string, otp: string, newPassword: string): Promise<MessageResponse> => {
    const res = await fetch(`${API_BASE}/auth/reset-password-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const json = await safeParseJson(res);
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Failed to reset password');
    }
    return json;
  },

  getMe: async (): Promise<User> => {
    const json = await fetchWithAuth('/users/me');
    return json.user;
  },

  updateProfile: async (data: {
    username?: string;
    auraTheme?: string;
    avatarIcon?: string;
    vibeStatusNote?: string;
    vibeStatusDurationHours?: number;
    allowGlobalIdSearch?: boolean;
    isGhostMode?: boolean;
  }): Promise<User> => {
    const json = await fetchWithAuth('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return json.user;
  },

  getRandomUsername: async (): Promise<string> => {
    const json = await fetchWithAuth('/users/random-username');
    return json.username;
  },

  searchByEchoId: async (echoId: string): Promise<{
    found: boolean;
    inRange: boolean;
    user?: {
      id: string;
      username: string;
      echoId: string;
      mood: string | null;
      presenceStatus: string;
      auraTheme: string;
      avatarIcon: string;
      vibeStatusNote?: string;
      distance?: string;
      contextLabel?: string;
    };
    message?: string;
  }> => {
    const params = new URLSearchParams({ echoId });
    return await fetchWithAuth(`/users/search-id?${params.toString()}`);
  },

  updateUsername: async (username: string): Promise<{ username: string; echoId: string }> => {
    return await fetchWithAuth('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username })
    });
  },

  getNearbyUsers: async (
    lat?: number,
    lng?: number,
    radius: number = 500,
    limit: number = 20,
    offset: number = 0
  ): Promise<GetNearbyResponse> => {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('latitude', lat.toString());
    if (lng !== undefined) params.append('longitude', lng.toString());
    params.append('radius', radius.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return await fetchWithAuth(`/discover/nearby?${params.toString()}`);
  },

  updateLocation: async (latitude: number, longitude: number): Promise<{ message: string; contextLabel: string }> => {
    return await fetchWithAuth('/users/me/location', {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude })
    });
  },

  updateMood: async (mood: MoodType): Promise<{ message: string; mood: MoodType }> => {
    return await fetchWithAuth('/users/me/mood', {
      method: 'PATCH',
      body: JSON.stringify({ mood })
    });
  },

  logout: async (): Promise<void> => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearTokens();
    }
  },

  // Wave Module API
  getIcebreakers: async (): Promise<{ icebreakers: any[] }> => {
    return await fetchWithAuth('/icebreakers');
  },

  sendWave: async (
    targetEchoId: string,
    iceBreakerId?: string,
    iceBreakerText?: string
  ): Promise<{ waveId: string; status: string; targetUserId: string; message: string }> => {
    return await fetchWithAuth('/waves', {
      method: 'POST',
      body: JSON.stringify({ targetEchoId, iceBreakerId, iceBreakerText })
    });
  },

  getPendingWaves: async (): Promise<{ waves: any[] }> => {
    return await fetchWithAuth('/waves/pending');
  },

  acceptWave: async (waveId: string): Promise<{ conversationId: string; message: string }> => {
    return await fetchWithAuth(`/waves/${waveId}/accept`, {
      method: 'PATCH'
    });
  },

  ignoreWave: async (waveId: string): Promise<{ message: string }> => {
    return await fetchWithAuth(`/waves/${waveId}/ignore`, {
      method: 'PATCH'
    });
  },

  blockUserViaWave: async (waveId: string): Promise<{ message: string }> => {
    return await fetchWithAuth(`/waves/${waveId}/block`, {
      method: 'PATCH'
    });
  },

  // Chat Module API
  getConversations: async (): Promise<{ active: any[]; saved: any[]; archived: any[] }> => {
    return await fetchWithAuth('/conversations');
  },

  getConversationDetails: async (conversationId: string): Promise<any> => {
    return await fetchWithAuth(`/conversations/${conversationId}`);
  },

  getMessages: async (
    conversationId: string,
    limit: number = 50,
    before?: string
  ): Promise<{ messages: any[]; hasMore: boolean }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);

    return await fetchWithAuth(`/conversations/${conversationId}/messages?${params.toString()}`);
  },

  sendMessage: async (conversationId: string, content: string, type: string = 'text'): Promise<{ message: any }> => {
    return await fetchWithAuth(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type })
    });
  },

  continueConversation: async (conversationId: string): Promise<{ conversationId: string; status: string; message: string }> => {
    return await fetchWithAuth(`/conversations/${conversationId}/continue`, {
      method: 'PATCH'
    });
  },

  saveConversation: async (conversationId: string): Promise<{ isSaved: boolean; saveRequestsCount: number; message: string }> => {
    return await fetchWithAuth(`/conversations/${conversationId}/save`, {
      method: 'PATCH'
    });
  },

  deleteConversation: async (conversationId: string): Promise<{ conversationId: string; message: string }> => {
    return await fetchWithAuth(`/conversations/${conversationId}`, {
      method: 'DELETE'
    });
  },

  // Spark Module API
  createSpark: async (
    text: string,
    durationMinutes: number,
    latitude: number,
    longitude: number,
    radius: number = 200,
    placeName?: string,
    accessType: 'public' | 'private' = 'public',
    passkey?: string
  ): Promise<any> => {
    return await fetchWithAuth('/sparks', {
      method: 'POST',
      body: JSON.stringify({ text, durationMinutes, latitude, longitude, radius, placeName, accessType, passkey })
    });
  },

  getNearbySparks: async (
    lat: number,
    lng: number,
    radius: number = 200,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ success: boolean; data: { sparks: any[]; hasMore: boolean } }> => {
    const params = new URLSearchParams();
    params.append('latitude', lat.toString());
    params.append('longitude', lng.toString());
    params.append('radius', radius.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return await fetchWithAuth(`/sparks/nearby?${params.toString()}`);
  },

  getSparkById: async (sparkId: string): Promise<{ success: boolean; data: { spark: any; members: any[] } }> => {
    return await fetchWithAuth(`/sparks/${sparkId}`);
  },

  joinSpark: async (sparkId: string, passkey?: string): Promise<{ success: boolean; data: { spark: any; members: any[] } }> => {
    return await fetchWithAuth(`/sparks/${sparkId}/join`, {
      method: 'POST',
      body: JSON.stringify({ passkey })
    });
  },

  kickSparkMember: async (sparkId: string, targetUserId: string): Promise<{ success: boolean; data: { targetUserId: string } }> => {
    return await fetchWithAuth(`/sparks/${sparkId}/kick`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  },

  leaveSpark: async (sparkId: string): Promise<{ success: boolean; data: { message: string } }> => {
    return await fetchWithAuth(`/sparks/${sparkId}/leave`, {
      method: 'POST'
    });
  },

  deleteSpark: async (sparkId: string): Promise<{ success: boolean; data: { message: string } }> => {
    return await fetchWithAuth(`/sparks/${sparkId}`, {
      method: 'DELETE'
    });
  },

  getSparkMessages: async (
    sparkId: string,
    limit: number = 50,
    before?: string
  ): Promise<{ success: boolean; data: { messages: any[]; hasMore: boolean } }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);

    return await fetchWithAuth(`/sparks/${sparkId}/messages?${params.toString()}`);
  },

  // Moderation Module API
  submitReport: async (targetEchoId: string, category: string, context?: string): Promise<{ message: string }> => {
    return await fetchWithAuth('/reports', {
      method: 'POST',
      body: JSON.stringify({ targetEchoId, category, context })
    });
  },

  blockUser: async (targetEchoId: string): Promise<{ message: string }> => {
    return await fetchWithAuth('/blocks', {
      method: 'POST',
      body: JSON.stringify({ targetEchoId })
    });
  },

  unblockUser: async (echoId: string): Promise<{ message: string }> => {
    return await fetchWithAuth(`/blocks/${encodeURIComponent(echoId)}`, {
      method: 'DELETE'
    });
  },

  getBlockedUsers: async (): Promise<{ blockedUsers: any[] }> => {
    return await fetchWithAuth('/blocks');
  },

  muteUser: async (targetEchoId: string): Promise<{ message: string }> => {
    return await fetchWithAuth('/mutes', {
      method: 'POST',
      body: JSON.stringify({ targetEchoId })
    });
  },

  unmuteUser: async (echoId: string): Promise<{ message: string }> => {
    return await fetchWithAuth(`/mutes/${encodeURIComponent(echoId)}`, {
      method: 'DELETE'
    });
  },

  getMutedUsers: async (): Promise<{ mutedUsers: any[] }> => {
    return await fetchWithAuth('/mutes');
  }
};

