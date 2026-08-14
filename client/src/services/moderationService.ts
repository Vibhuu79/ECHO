import { api } from './api';

export interface BlockedUserDTO {
  id: string;
  username: string;
  echoId: string;
}

export interface MutedUserDTO {
  id: string;
  username: string;
  echoId: string;
}

export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'fake_identity'
  | 'other';

export const moderationService = {
  submitReport: async (targetEchoId: string, category: ReportCategory, context?: string) => {
    return await api.submitReport(targetEchoId, category, context);
  },

  blockUser: async (targetEchoId: string) => {
    return await api.blockUser(targetEchoId);
  },

  unblockUser: async (echoId: string) => {
    return await api.unblockUser(echoId);
  },

  getBlockedUsers: async (): Promise<BlockedUserDTO[]> => {
    const res = await api.getBlockedUsers();
    return res.blockedUsers;
  },

  muteUser: async (targetEchoId: string) => {
    return await api.muteUser(targetEchoId);
  },

  unmuteUser: async (echoId: string) => {
    return await api.unmuteUser(echoId);
  },

  getMutedUsers: async (): Promise<MutedUserDTO[]> => {
    const res = await api.getMutedUsers();
    return res.mutedUsers;
  }
};
