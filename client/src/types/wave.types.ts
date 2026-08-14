export interface IcebreakerItem {
  id?: string;
  _id?: string;
  text: string;
  category?: string;
}

export interface WaveFromUser {
  id: string;
  username: string;
  echoId: string;
  mood: string | null;
  presence: string;
  locationLabel: string;
}

export interface PendingWave {
  id: string;
  fromUser: WaveFromUser;
  icebreaker: string | null;
  createdAt: string;
}
