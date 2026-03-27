export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  uri?: string;
  source?: 'spotify' | 'youtube' | 'local' | 'ai';
  isLibrary?: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  reason: string;
  feedback?: 'up' | 'down' | null;
  source?: 'spotify' | 'youtube' | 'ai';
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: string;
  isDynamic?: boolean;
  refreshInterval?: 'daily' | 'weekly' | 'monthly';
  lastRefreshed?: string;
  type?: 'playlist' | 'radio';
  artistName?: string; // For artist radio
  isPublic?: boolean;
}

export interface PlaybackEvent {
  id: string;
  uid: string;
  songId: string;
  songTitle: string;
  artist: string;
  genre?: string;
  duration?: number;
  source?: 'spotify' | 'youtube' | 'local' | 'ai';
  timestamp: any;
}
