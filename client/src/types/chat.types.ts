export type ConversationStatus = 'active' | 'sleeping' | 'archived' | 'saved' | 'deleted';
export type MessageType = 'text' | 'emoji' | 'icebreaker' | 'system';

export interface PeerUser {
  id: string;
  username: string;
  echoId: string;
  mood: string | null;
  presence: string;
  locationLabel?: string;
}

export interface LastMessageInfo {
  text: string;
  senderId: string;
  timestamp: string;
}

export interface ConversationItem {
  id: string;
  peer: PeerUser | null;
  status: ConversationStatus;
  isSaved: boolean;
  saveRequests?: string[];
  lastMessage: LastMessageInfo | null;
  lastActivityAt: string;
  sleepingSince?: string | null;
  createdAt: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    username: string;
    echoId: string;
  };
  content: string;
  type: MessageType;
  readBy: string[];
  createdAt: string;
}
