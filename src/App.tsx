import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Search, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Music2, 
  Home, 
  Library, 
  Plus, 
  Heart,
  Shuffle as ShuffleIcon,
  Repeat as RepeatIcon,
  Sparkles,
  Menu,
  X,
  Mic2,
  ListMusic,
  Trash2,
  GripVertical,
  ThumbsUp,
  ThumbsDown,
  Sliders,
  User,
  Settings,
  History,
  Clock,
  Music,
  Download,
  CloudOff,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Youtube,
  Timer,
  ArrowRight,
  Users,
  UserPlus,
  Radio,
  ChevronRight,
  Copy,
  MessageSquare,
  Share2,
  RotateCcw,
  RotateCw,
  BarChart2,
  TrendingUp,
  Calendar,
  PieChart as PieChartIcon,
  Bot,
  Send,
  Loader2,
  Waves,
  Import,
  LayoutGrid,
  Wind,
  Zap,
  Target,
  Moon,
  Globe,
  Shield,
  Edit3,
} from 'lucide-react';
import YouTube from 'react-youtube';
import axios from 'axios';
import { GoogleGenAI, Type } from "@google/genai";
import { auth, db, googleProvider, handleFirestoreError, OperationType, orderBy, limit, Timestamp, query, where, getDocs } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, onSnapshot, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { openDB } from 'idb';
import { io } from 'socket.io-client';
import { cn } from './lib/utils';
import { Song, Recommendation, Playlist, PlaybackEvent } from './types';
import { Toaster, toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip
} from 'recharts';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  isWithinInterval, 
  format,
  parseISO,
  eachDayOfInterval,
  isSameDay,
  isSameWeek
} from 'date-fns';

const INITIAL_SONGS: Song[] = [
  { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg' },
  { id: '9bZkp7q19f0', title: 'Gangnam Style', artist: 'PSY', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg' },
  { id: 'fWNaR-rxAic', title: 'Blinding Lights', artist: 'The Weeknd', thumbnail: 'https://i.ytimg.com/vi/fWNaR-rxAic/maxresdefault.jpg' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
  { id: 'kTJfe8uFBgw', title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', thumbnail: 'https://i.ytimg.com/vi/kTJfe8uFBgw/maxresdefault.jpg' },
  { id: 'mRD0-GxqHVo', title: 'Heat Waves', artist: 'Glass Animals', thumbnail: 'https://i.ytimg.com/vi/mRD0-GxqHVo/maxresdefault.jpg' },
  { id: 'XXYlFuWEuKI', title: 'Save Your Tears', artist: 'The Weeknd', thumbnail: 'https://i.ytimg.com/vi/XXYlFuWEuKI/maxresdefault.jpg' },
  { id: 'TUVcVTV8678', title: 'Levitating', artist: 'Dua Lipa', thumbnail: 'https://i.ytimg.com/vi/TUVcVTV8678/maxresdefault.jpg' },
  { id: 'tQ0yjYUFKAE', title: 'Peaches', artist: 'Justin Bieber ft. Daniel Caesar, Giveon', thumbnail: 'https://i.ytimg.com/vi/tQ0yjYUFKAE/maxresdefault.jpg' },
  { id: '6swmTBVI83k', title: 'Montero (Call Me By Your Name)', artist: 'Lil Nas X', thumbnail: 'https://i.ytimg.com/vi/6swmTBVI83k/maxresdefault.jpg' },
  { id: 'gNi_6l5bcig', title: 'Good 4 U', artist: 'Olivia Rodrigo', thumbnail: 'https://i.ytimg.com/vi/gNi_6l5bcig/maxresdefault.jpg' },
  { id: '0EVVKs6DQLo', title: 'Kiss Me More', artist: 'Doja Cat ft. SZA', thumbnail: 'https://i.ytimg.com/vi/0EVVKs6DQLo/maxresdefault.jpg' },
  { id: 'orS-7ig4uMA', title: 'Bad Habits', artist: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/orS-7ig4uMA/maxresdefault.jpg' },
  { id: 'H5v3kku4y6Q', title: 'As It Was', artist: 'Harry Styles', thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/maxresdefault.jpg' },
  { id: 'G7KNmW9a75Y', title: 'Flowers', artist: 'Miley Cyrus', thumbnail: 'https://i.ytimg.com/vi/G7KNmW9a75Y/maxresdefault.jpg' },
  { id: 'b1kbLwvqugk', title: 'Kill Bill', artist: 'SZA', thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/maxresdefault.jpg' },
  { id: 'b7k0a5hYn9g', title: 'Anti-Hero', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b7k0a5hYn9g/maxresdefault.jpg' },
  { id: '7wtfhZwyrcc', title: 'Believer', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/7wtfhZwyrcc/maxresdefault.jpg' },
  { id: 'fHI8X4OXluQ', title: 'Blinding Lights (Remix)', artist: 'The Weeknd', thumbnail: 'https://i.ytimg.com/vi/fHI8X4OXluQ/maxresdefault.jpg' },
  { id: 'L0X03zR0rQk', title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', thumbnail: 'https://i.ytimg.com/vi/L0X03zR0rQk/maxresdefault.jpg' },
  { id: '4NRXx6U8ABQ', title: 'Blame It on Me', artist: 'George Ezra', thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg' },
  { id: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5', thumbnail: 'https://i.ytimg.com/vi/09R8_2nJtjg/maxresdefault.jpg' },
  { id: 'CevxZvSJLk8', title: 'Roar', artist: 'Katy Perry', thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/maxresdefault.jpg' },
  { id: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/maxresdefault.jpg' },
  { id: 'nfWlot6h_JM', title: 'Shake It Off', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/nfWlot6h_JM/maxresdefault.jpg' },
  { id: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa ft. Charlie Puth', thumbnail: 'https://i.ytimg.com/vi/RgKAFK5djSk/maxresdefault.jpg' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/maxresdefault.jpg' },
  { id: 'fKopy74weus', title: 'Thunder', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/fKopy74weus/maxresdefault.jpg' },
  { id: '60ItHLz5WEA', title: 'Faded', artist: 'Alan Walker', thumbnail: 'https://i.ytimg.com/vi/60ItHLz5WEA/maxresdefault.jpg' },
  { id: 'k2qgadSvNyU', title: 'New Rules', artist: 'Dua Lipa', thumbnail: 'https://i.ytimg.com/vi/k2qgadSvNyU/maxresdefault.jpg' },
  { id: 'pB-5XG-DbAA', title: 'Cheap Thrills', artist: 'Sia', thumbnail: 'https://i.ytimg.com/vi/pB-5XG-DbAA/maxresdefault.jpg' },
  { id: 'L_jWHffIx5E', title: 'Smells Like Teen Spirit', artist: 'Nirvana', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/maxresdefault.jpg' },
  { id: 'hTWKbfoikeg', title: 'Numb', artist: 'Linkin Park', thumbnail: 'https://i.ytimg.com/vi/hTWKbfoikeg/maxresdefault.jpg' },
  { id: 'v2AC41dglnM', title: 'Thunderstruck', artist: 'AC/DC', thumbnail: 'https://i.ytimg.com/vi/v2AC41dglnM/maxresdefault.jpg' },
  { id: 'l482T0yNkeo', title: 'Bohemian Rhapsody', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/l482T0yNkeo/maxresdefault.jpg' },
  { id: 'fJ9rUzIMcZQ', title: 'Another One Bites the Dust', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg' },
  { id: 'qMtcWqzGe8M', title: 'Radioactive', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/qMtcWqzGe8M/maxresdefault.jpg' },
  { id: 'MwpMEbgC7DA', title: 'Closer', artist: 'The Chainsmokers', thumbnail: 'https://i.ytimg.com/vi/MwpMEbgC7DA/maxresdefault.jpg' },
  { id: '2Vv-BfVoq4g', title: 'Perfect', artist: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/maxresdefault.jpg' },
  { id: 'lp-EO5I6OHQ', title: 'Thinking Out Loud', artist: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/lp-EO5I6OHQ/maxresdefault.jpg' },
  { id: 'YykjpeuMNEk', title: 'Hymn For The Weekend', artist: 'Coldplay', thumbnail: 'https://i.ytimg.com/vi/YykjpeuMNEk/maxresdefault.jpg' },
];

const GENRES = [
  'All', 'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Classical', 'Lofi', 'Synthwave', 'R&B', 'Country', 'Metal', 'Blues', 'Folk', 
  'Reggae', 'Soul', 'Punk', 'Disco', 'Funk', 'Techno', 'House', 'Ambient', 'Gospel', 'Latin', 'K-Pop', 'J-Pop', 'Indie', 'Alternative', 
  'Trap', 'Drill', 'Grime', 'Dubstep', 'EDM', 'Hardstyle', 'Phonk', 'Eurobeat', 'City Pop', 'Deep House', 'Psytrance', 'Hardcore', 
  'Ska', 'Garage', 'Grindcore', 'Acoustic', 'Orchestral', 'Opera', 'Soundtrack', 'Holiday', 'World', 'New Age',
  '80s', '90s', '2000s', '2010s', '2020s', '70s', '60s', '50s', '40s'
];

const CommunityView = ({ profiles, onProfileClick }: { profiles: any[], onProfileClick: (uid: string) => void }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Community</h2>
          <p className="text-white/40 font-medium">Discover what others are listening to</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {profiles.map((profile) => (
          <motion.div
            key={profile.uid}
            whileHover={{ y: -5 }}
            className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
            onClick={() => onProfileClick(profile.uid)}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={20} className="text-[#2E5BFF]" />
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2E5BFF] to-[#0a1a3a] border-4 border-white/10 shadow-xl flex items-center justify-center overflow-hidden">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={40} className="text-white/20" />
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold truncate w-full px-2">{profile.displayName}</h3>
                <p className="text-sm text-white/40 line-clamp-2 px-2">{profile.bio || 'No bio yet'}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {profile.topGenres?.slice(0, 3).map((genre: string) => (
                  <span key={genre} className="px-2 py-1 bg-[#2E5BFF]/10 border border-[#2E5BFF]/20 rounded-lg text-[10px] font-bold text-[#2E5BFF] uppercase tracking-wider">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        
        {profiles.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <Users size={40} />
            </div>
            <p className="text-white/40">No public profiles found. Be the first to go public!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const UserProfileView = ({ profile, onBack, onPlaySong }: { profile: any, onBack: () => void, onPlaySong: (song: Song) => void }) => {
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [userHistory, setUserHistory] = useState<PlaybackEvent[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    setIsLoadingData(true);
    
    // Fetch Public Playlists
    const playlistsRef = collection(db, 'users', profile.uid, 'playlists');
    const playlistsUnsubscribe = onSnapshot(playlistsRef, (snapshot) => {
      const fetchedPlaylists = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Playlist))
        .filter(p => p.isPublic);
      setUserPlaylists(fetchedPlaylists);
    });

    // Fetch Public History if allowed
    let historyUnsubscribe = () => {};
    if (profile.isHistoryPublic) {
      const historyRef = collection(db, 'users', profile.uid, 'playbackHistory');
      const historyQuery = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
      historyUnsubscribe = onSnapshot(historyQuery, (snapshot) => {
        const fetchedHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaybackEvent));
        setUserHistory(fetchedHistory);
      });
    }

    setIsLoadingData(false);

    return () => {
      playlistsUnsubscribe();
      historyUnsubscribe();
    };
  }, [profile?.uid, profile?.isHistoryPublic]);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
      >
        <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs">Back to Community</span>
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 text-center lg:text-left">
        <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full bg-gradient-to-tr from-[#2E5BFF] to-[#0a1a3a] border-4 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden mx-auto lg:mx-0">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={60} className="text-white/20" />
          )}
        </div>
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">{profile.displayName}</h2>
            <p className="text-white/40 font-medium text-lg max-w-2xl mx-auto lg:mx-0">{profile.bio || 'No bio yet'}</p>
          </div>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
            {profile.topGenres?.map((genre: string) => (
              <div key={genre} className="px-5 py-2 bg-[#2E5BFF]/10 border border-[#2E5BFF]/20 rounded-full text-sm font-bold text-[#2E5BFF]">
                {genre}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Playlists & History */}
        <div className="lg:col-span-2 space-y-12">
          {/* Playlists Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListMusic className="text-[#2E5BFF]" size={24} />
                <h3 className="text-2xl font-bold tracking-tight">Public Playlists</h3>
              </div>
              <span className="text-xs font-bold text-white/20 uppercase tracking-widest">{userPlaylists.length} Playlists</span>
            </div>

            {selectedPlaylist ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between p-6 bg-[#2E5BFF]/10 border border-[#2E5BFF]/20 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedPlaylist(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <ArrowRight size={20} className="rotate-180" />
                    </button>
                    <div>
                      <h4 className="font-bold text-xl">{selectedPlaylist.name}</h4>
                      <p className="text-xs text-white/40 uppercase tracking-widest">{selectedPlaylist.songs.length} Tracks</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => selectedPlaylist.songs[0] && onPlaySong(selectedPlaylist.songs[0])}
                    className="px-6 py-2 bg-[#2E5BFF] rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Play size={16} fill="white" />
                    Play All
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedPlaylist.songs.map((song, idx) => (
                    <div 
                      key={song.id + idx}
                      className="group flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                        <Music size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{song.title}</h4>
                        <p className="text-xs text-white/40 truncate">{song.artist}</p>
                      </div>
                      <button 
                        onClick={() => onPlaySong(song)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#2E5BFF] transition-all"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              userPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userPlaylists.map((playlist) => (
                    <div 
                      key={playlist.id}
                      onClick={() => setSelectedPlaylist(playlist)}
                      className="group p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-[#2E5BFF]/50 transition-all hover:bg-white/[0.08] cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E5BFF] to-[#0a1a3a] flex items-center justify-center shadow-lg">
                          <Music2 className="text-white" size={24} />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            playlist.songs[0] && onPlaySong(playlist.songs[0]);
                          }}
                          className="w-10 h-10 rounded-full bg-[#2E5BFF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-[#2E5BFF]/20"
                        >
                          <Play size={18} fill="white" />
                        </button>
                      </div>
                      <h4 className="font-bold text-lg mb-1 truncate">{playlist.name}</h4>
                      <p className="text-xs text-white/40 font-medium uppercase tracking-widest">{playlist.songs.length} Tracks</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 bg-white/5 rounded-3xl border border-white/10 border-dashed text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                    <Music2 className="text-white/20" size={32} />
                  </div>
                  <p className="text-white/40 font-medium">No public playlists shared yet.</p>
                </div>
              )
            )}
          </div>

          {/* History Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="text-[#2E5BFF]" size={24} />
                <h3 className="text-2xl font-bold tracking-tight">Recent History</h3>
              </div>
              {profile.isHistoryPublic && (
                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Last 20 Tracks</span>
              )}
            </div>

            {profile.isHistoryPublic ? (
              userHistory.length > 0 ? (
                <div className="space-y-2">
                  {userHistory.map((event) => (
                    <div 
                      key={event.id}
                      className="group flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                        <Music size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{event.songTitle}</h4>
                        <p className="text-xs text-white/40 truncate">{event.artist}</p>
                      </div>
                      <button 
                        onClick={() => onPlaySong({ id: event.songId, title: event.songTitle, artist: event.artist, thumbnail: '', source: event.source })}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#2E5BFF] transition-all"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 bg-white/5 rounded-3xl border border-white/10 border-dashed text-center">
                  <p className="text-white/40 font-medium">No recent history available.</p>
                </div>
              )
            ) : (
              <div className="p-12 bg-white/5 rounded-3xl border border-white/10 border-dashed text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Shield className="text-white/20" size={32} />
                </div>
                <p className="text-white/40 font-medium italic">This user's listening history is private.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Info */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-[#2E5BFF]" size={24} />
              <h3 className="text-2xl font-bold tracking-tight">Musical Taste</h3>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center space-y-4">
              <p className="text-white/60 leading-relaxed">
                This user is a fan of {profile.topGenres?.join(', ') || 'various genres'}. 
                They've been exploring the community and sharing their vibes.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Globe className="text-[#2E5BFF]" size={24} />
              <h3 className="text-2xl font-bold tracking-tight">Profile Info</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                <span className="text-white/40 text-sm">Member Since</span>
                <span className="font-bold">March 2026</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                <span className="text-white/40 text-sm">Profile Status</span>
                <span className="flex items-center gap-2 text-green-500 font-bold">
                  <Globe size={14} /> Public
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentSong, setCurrentSong] = useState<Song>(INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSource, setSearchSource] = useState<'all' | 'spotify' | 'youtube'>('all');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>(INITIAL_SONGS);
  const [history, setHistory] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<any>(null);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [spotifyLikedTracks, setSpotifyLikedTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('musicfree_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [activeSpotifyPlaylist, setActiveSpotifyPlaylist] = useState<any | null>(null);
  const [activeSpotifyPlaylistTracks, setActiveSpotifyPlaylistTracks] = useState<any[]>([]);
  const [activeArtist, setActiveArtist] = useState<string | null>(null);
  const [artistTracks, setArtistTracks] = useState<Song[]>([]);
  const [artistBio, setArtistBio] = useState<string | null>(null);
  const [relatedArtists, setRelatedArtists] = useState<string[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [spotifyFeaturedPlaylists, setSpotifyFeaturedPlaylists] = useState<any[]>([]);
  const [spotifyTopArtists, setSpotifyTopArtists] = useState<any[]>([]);
  const [spotifyMadeForYou, setSpotifyMadeForYou] = useState<any[]>([]);
  const [spotifyNewReleases, setSpotifyNewReleases] = useState<any[]>([]);
  const [spotifyTopTracks, setSpotifyTopTracks] = useState<any[]>([]);
  const [youtubeUser, setYoutubeUser] = useState<any>(null);
  const [youtubePlaylists, setYoutubePlaylists] = useState<any[]>([]);
  const [youtubeLikedVideos, setYoutubeLikedVideos] = useState<any[]>([]);
  const [activeYoutubePlaylist, setActiveYoutubePlaylist] = useState<any | null>(null);
  const [activeYoutubePlaylistTracks, setActiveYoutubePlaylistTracks] = useState<any[]>([]);
  const [youtubeFeatured, setYoutubeFeatured] = useState<Song[]>([]);
  const [homeRecommendations, setHomeRecommendations] = useState<Song[]>([]);
  const [suggestedArtist, setSuggestedArtist] = useState<string | null>(null);
  const [isViewingSpotifyLikedSongs, setIsViewingSpotifyLikedSongs] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'explore' | 'library' | 'profile' | 'community' | 'spotify-playlist' | 'spotify-liked' | 'artist' | 'youtube-playlist' | 'youtube-library' | 'stats' | 'history'>('home');
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [communityProfiles, setCommunityProfiles] = useState<any[]>([]);
  const [selectedProfileUid, setSelectedProfileUid] = useState<string | null>(null);
  const [isPublicProfileLoading, setIsPublicProfileLoading] = useState(false);
  const [playbackHistory, setPlaybackHistory] = useState<PlaybackEvent[]>([]);
  const [stats, setStats] = useState<{
    weekly: any;
    monthly: any;
  } | null>(null);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isAiDjOpen, setIsAiDjOpen] = useState(false);
  const [aiDjMessages, setAiDjMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isAiDjLoading, setIsAiDjLoading] = useState(false);
  const [isImportingSpotify, setIsImportingSpotify] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);

  const togglePublicProfile = async () => {
    if (!user || !publicProfile) return;
    try {
      await setDoc(doc(db, 'publicProfiles', user.uid), {
        isPublic: !publicProfile.isPublic,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `publicProfiles/${user.uid}`);
    }
  };

  const updatePublicProfile = async (data: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'publicProfiles', user.uid), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `publicProfiles/${user.uid}`);
    }
  };

  const handleAiDjQuery = async (query: string) => {
    if (!query.trim()) return;
    
    const newMessages = [...aiDjMessages, { role: 'user' as const, content: query }];
    setAiDjMessages(newMessages);
    setIsAiDjLoading(true);

    try {
      const statsContext = stats?.monthly 
        ? `The user's top genre is "${stats.monthly.topGenre}". Their most played artists are: ${stats.monthly.topArtists.map(a => a.name).join(', ')}.`
        : '';

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are a professional Music DJ and Assistant. Your goal is to help the user find music, explain song meanings, or create moods. 
          The user is currently listening to: ${currentSong ? `${currentSong.title} by ${currentSong.artist}` : 'Nothing'}.
          Selected genre: ${selectedGenre}.
          ${statsContext}
          
          If the user wants to play a specific song or genre, suggest a search query.
          If they ask about the current song, provide interesting facts.
          Keep responses concise and energetic.
          
          User query: ${query}` }] }
        ],
      });

      const aiResponse = response.text || "I'm not sure how to help with that, but let's keep the music going!";
      setAiDjMessages([...newMessages, { role: 'assistant' as const, content: aiResponse }]);
      
      // Check if AI suggested a search
      if (aiResponse.toLowerCase().includes('search') || aiResponse.toLowerCase().includes('play')) {
        const searchMatch = aiResponse.match(/"([^"]+)"/);
        if (searchMatch) {
          setSearchQuery(searchMatch[1]);
          performSearch(searchMatch[1]);
        }
      }
    } catch (err) {
      console.error("AI DJ Error:", err);
      setAiDjMessages([...newMessages, { role: 'assistant' as const, content: "Sorry, my brain hit a skip. Try again?" }]);
    } finally {
      setIsAiDjLoading(false);
    }
  };

  const importSpotifyPlaylist = async (playlistId: string, playlistName: string) => {
    setIsImportingSpotify(true);
    toast.info(`Importing "${playlistName}"... This may take a moment.`);

    try {
      // Get Spotify token from backend
      const tokenRes = await fetch('/api/spotify/token');
      if (!tokenRes.ok) throw new Error("Not authenticated with Spotify");
      const { access_token } = await tokenRes.json();

      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const tracks = response.data.items;
      const importedSongs: Song[] = [];

      for (const item of tracks) {
        const track = item.track;
        if (!track) continue;
        
        // Search YouTube for the best match
        const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(`${track.name} ${track.artists[0].name}`)}&type=video&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`;
        const ytResponse = await axios.get(ytSearchUrl);
        
        if (ytResponse.data.items?.[0]) {
          const video = ytResponse.data.items[0];
          importedSongs.push({
            id: video.id.videoId,
            title: track.name,
            artist: track.artists.map((a: any) => a.name).join(', '),
            thumbnail: track.album.images[0]?.url || video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url,
            source: 'youtube'
          });
        }
      }

      if (importedSongs.length > 0) {
        const newPlaylist: Playlist = {
          id: `imported-${Date.now()}`,
          name: `Imported: ${playlistName}`,
          songs: importedSongs,
          createdAt: new Date().toISOString()
        };
        
        setPlaylists(prev => {
          const updated = [...prev, newPlaylist];
          localStorage.setItem('musicfree_playlists', safeStringify(updated));
          return updated;
        });

        if (user) {
          await setDoc(doc(db, 'users', user.uid, 'playlists', newPlaylist.id), newPlaylist);
        }

        toast.success(`Successfully imported ${importedSongs.length} tracks to "${newPlaylist.name}"`);
      } else {
        toast.error("No tracks could be imported.");
      }
    } catch (err) {
      console.error("Spotify Import Error:", err);
      toast.error("Failed to import playlist. Please check your connection.");
    } finally {
      setIsImportingSpotify(false);
    }
  };

  const Visualizer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (!canvasRef.current || !isPlaying) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      let animationFrameId: number;

      const bars = 64;
      const barWidth = canvas.width / bars;
      const data = new Array(bars).fill(0).map(() => Math.random() * 100);

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < bars; i++) {
          // Simulate frequency data
          data[i] += (Math.random() - 0.5) * 10;
          data[i] = Math.max(10, Math.min(canvas.height * 0.8, data[i]));
          
          const x = i * barWidth;
          const y = canvas.height - data[i];
          
          const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
          gradient.addColorStop(0, '#2E5BFF');
          gradient.addColorStop(1, 'rgba(46, 91, 255, 0.1)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, y, barWidth - 2, data[i]);
        }
        
        animationFrameId = requestAnimationFrame(render);
      };

      render();
      return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying]);

    return (
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={200} 
        className="w-full h-full opacity-40 pointer-events-none"
      />
    );
  };

  const AiDjPanel = () => {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [aiDjMessages]);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-32 right-8 w-80 lg:w-96 h-[500px] bg-[#0a1a3a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-bottom border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E5BFF] flex items-center justify-center shadow-lg shadow-[#2E5BFF]/20">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI DJ Assistant</h3>
              <p className="text-[10px] text-[#2E5BFF] font-bold uppercase tracking-widest">Online & Ready</p>
            </div>
          </div>
          <button onClick={() => setIsAiDjOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {aiDjMessages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <Sparkles size={32} className="mx-auto text-[#2E5BFF] opacity-40" />
              <p className="text-xs text-white/40 px-8">Ask me to find music, explain a song, or just say "Play something chill"!</p>
            </div>
          )}
          {aiDjMessages.map((msg, i) => (
            <div key={i} className={cn(
              "max-w-[85%] p-3 rounded-2xl text-sm",
              msg.role === 'user' 
                ? "ml-auto bg-[#2E5BFF] text-white rounded-tr-none" 
                : "bg-white/5 text-white/80 border border-white/10 rounded-tl-none"
            )}>
              {msg.content}
            </div>
          ))}
          {isAiDjLoading && (
            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10 w-12 flex justify-center">
              <Loader2 size={16} className="animate-spin text-[#2E5BFF]" />
            </div>
          )}
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAiDjQuery(input);
            setInput('');
          }}
          className="p-4 bg-white/5 border-t border-white/10 flex gap-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your DJ..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2E5BFF]/50 transition-all"
          />
          <button 
            disabled={isAiDjLoading}
            className="p-2 bg-[#2E5BFF] text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    );
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    if (searchQuery || searchResults.length > 0) {
      performSearch(searchQuery || genre, searchQuery ? genre : undefined);
    } else if (activeView === 'home') {
      getRecommendations(genre);
    }
  };
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isDynamicPlaylist, setIsDynamicPlaylist] = useState(false);
  const [isPublicPlaylist, setIsPublicPlaylist] = useState(false);
  const [playlistRefreshInterval, setPlaylistRefreshInterval] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [playlistType, setPlaylistType] = useState<'playlist' | 'radio'>('playlist');
  const [artistRadioName, setArtistRadioName] = useState('');
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [playerControls, setPlayerControls] = useState<any[]>(() => {
    const defaultControls = [
      { id: 'shuffle', label: 'Shuffle', visible: true, position: 'center' },
      { id: 'seekBack', label: 'Back 10s', visible: false, position: 'center' },
      { id: 'skipBack', label: 'Previous', visible: true, position: 'center' },
      { id: 'playPause', label: 'Play/Pause', visible: true, position: 'center' },
      { id: 'skipForward', label: 'Next', visible: true, position: 'center' },
      { id: 'seekForward', label: 'Forward 10s', visible: false, position: 'center' },
      { id: 'repeat', label: 'Repeat', visible: true, position: 'center' },
      { id: 'heart', label: 'Like', visible: true, position: 'right' },
      { id: 'lyrics', label: 'Lyrics', visible: true, position: 'right' },
      { id: 'timer', label: 'Sleep Timer', visible: true, position: 'right' },
      { id: 'queue', label: 'Queue', visible: true, position: 'right' },
      { id: 'equalizer', label: 'Equalizer', visible: true, position: 'right' },
      { id: 'party', label: 'Party Mode', visible: true, position: 'right' },
      { id: 'volume', label: 'Volume', visible: true, position: 'right' },
      { id: 'visualizer', label: 'Visualizer', visible: true, position: 'right' },
    ];
    const saved = localStorage.getItem('musicfree_player_controls');
    if (!saved) return defaultControls;
    
    const parsed = JSON.parse(saved);
    // Add missing controls from defaults
    const missing = defaultControls.filter(dc => !parsed.find((pc: any) => pc.id === dc.id));
    return [...parsed, ...missing];
  });
  const [eqSettings, setEqSettings] = useState({
    bass: 50,
    mid: 50,
    treble: 50
  });
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [activePlayer, setActivePlayer] = useState<'youtube' | 'spotify'>('youtube');
  const [vibe, setVibe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const playerRef = useRef<any>(null);
  const spotifyPlayerRef = useRef<any>(null);

  const ai = useRef(new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }));
  const [error, setError] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [partyRoomId, setPartyRoomId] = useState<string | null>(null);
  const [isPartyModeOpen, setIsPartyModeOpen] = useState(false);
  const [partyMessages, setPartyMessages] = useState<any[]>([]);
  const socket = useRef<any>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);

  const [likedSongs, setLikedSongs] = useState<string[]>(() => {
    const saved = localStorage.getItem('musicfree_liked_songs');
    return saved ? JSON.parse(saved) : [];
  });

  const safeStringify = (obj: any) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return;
        cache.add(value);
      }
      return value;
    });
  };

  useEffect(() => {
    localStorage.setItem('musicfree_liked_songs', safeStringify(likedSongs));
  }, [likedSongs]);

  // Firebase State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Visualizer Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (activePlayer === 'youtube' && playerRef.current) {
          try {
            setCurrentTime(playerRef.current.getCurrentTime() || 0);
            setDuration(playerRef.current.getDuration() || 0);
          } catch (e) {}
        } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
          spotifyPlayerRef.current.getCurrentState().then((state: any) => {
            if (state) {
              setCurrentTime(state.position / 1000);
              setDuration(state.duration / 1000);
            }
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activePlayer]);

  useEffect(() => {
    if (sleepTimer !== null && sleepTimer > 0 && isPlaying) {
      const timer = setInterval(() => {
        setSleepTimer(prev => (prev !== null && prev > 0 ? prev - 1/60 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (sleepTimer === 0) {
      setIsPlaying(false);
      if (activePlayer === 'youtube' && playerRef.current) playerRef.current.pauseVideo();
      if (activePlayer === 'spotify' && spotifyPlayerRef.current) spotifyPlayerRef.current.pauseVideo();
      setSleepTimer(null);
    }
  }, [sleepTimer, isPlaying, activePlayer]);

  useEffect(() => {
    socket.current = io();

    socket.current.on("sync-play", ({ song, position }: any) => {
      setCurrentSong(song);
      setIsPlaying(true);
      // Logic to seek to position would go here
    });

    socket.current.on("sync-pause", () => {
      setIsPlaying(false);
      if (activePlayer === 'youtube' && playerRef.current) playerRef.current.pauseVideo();
    });

    socket.current.on("chat-message", (msg: any) => {
      setPartyMessages(prev => [...prev, msg]);
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsFirebaseReady(true);
      if (u) {
        // Sync profile
        setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`));
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Liked Songs to Firebase
  useEffect(() => {
    if (!user || !isFirebaseReady) return;

    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'likedSongs'), (snapshot) => {
      const cloudLiked = snapshot.docs.map(doc => doc.data().songId);
      setLikedSongs(prev => {
        const merged = Array.from(new Set([...prev, ...cloudLiked]));
        return merged;
      });
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/likedSongs`));

    return () => unsubscribe();
  }, [user, isFirebaseReady]);

  // Push new local likes to cloud
  useEffect(() => {
    if (!user || !isFirebaseReady) return;
    localStorage.setItem('musicfree_liked_songs', safeStringify(likedSongs));
    
    likedSongs.forEach(songId => {
      const songData = trendingSongs.find(s => s.id === songId) || 
                       searchResults.find(s => s.id === songId) ||
                       artistTracks.find(s => s.id === songId);
      if (songData) {
        setDoc(doc(db, 'users', user.uid, 'likedSongs', songId), {
          uid: user.uid,
          songId,
          songData,
          createdAt: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/likedSongs/${songId}`));
      }
    });
  }, [likedSongs, user, isFirebaseReady, trendingSongs, searchResults, artistTracks]);

  // Sync Playlists to Firebase
  useEffect(() => {
    if (!user || !isFirebaseReady) return;

    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'playlists'), (snapshot) => {
      const cloudPlaylists = snapshot.docs.map(doc => doc.data() as Playlist);
      setPlaylists(prev => {
        const merged = [...prev];
        cloudPlaylists.forEach(cp => {
          if (!merged.find(p => p.id === cp.id)) {
            merged.push(cp);
          }
        });
        return merged;
      });
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/playlists`));

    return () => unsubscribe();
  }, [user, isFirebaseReady]);

  // Sync Public Profile
  useEffect(() => {
    if (!user || !isFirebaseReady) return;

    const unsubscribe = onSnapshot(doc(db, 'publicProfiles', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setPublicProfile(snapshot.data());
      } else {
        // Create initial public profile
        const initialProfile = {
          uid: user.uid,
          displayName: user.displayName || 'musicfree User',
          photoURL: user.photoURL || '',
          bio: 'Listening to music on MusicFree AI',
          topGenres: [],
          isPublic: false,
          updatedAt: serverTimestamp()
        };
        setDoc(doc(db, 'publicProfiles', user.uid), initialProfile)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `publicProfiles/${user.uid}`));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `publicProfiles/${user.uid}`));

    return () => unsubscribe();
  }, [user, isFirebaseReady]);

  // Fetch Community Profiles
  useEffect(() => {
    if (activeView !== 'community') return;

    const q = query(collection(db, 'publicProfiles'), where('isPublic', '==', true), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => doc.data());
      setCommunityProfiles(profiles);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'publicProfiles'));

    return () => unsubscribe();
  }, [activeView]);

  // Audio Visualizer Logic
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !showVisualizer) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = 32;
      const dataArray = new Uint8Array(bufferLength);
      
      // Simulate frequency data
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.random() * 255 * (Math.sin(Date.now() / 1000 + i) * 0.5 + 0.5);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#2E5BFF');
        gradient.addColorStop(1, '#4D75FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, showVisualizer]);

  useEffect(() => {
    localStorage.setItem('musicfree_player_controls', safeStringify(playerControls));
  }, [playerControls]);

  useEffect(() => {
    checkSpotifyAuth();
    checkYoutubeAuth();
    initOfflineDB();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        checkSpotifyAuth();
      }
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        checkYoutubeAuth();
      }
    };
    window.addEventListener('message', handleMessage);

    // Spotify SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      initSpotifyPlayer();
    };

    fetchYouTubeFeatured();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('message', handleMessage);
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (youtubeUser) {
      fetchYoutubeData();
    }
  }, [youtubeUser]);

  useEffect(() => {
    if (activeView === 'stats') {
      fetchPlaybackHistory();
    }
  }, [activeView, user, isFirebaseReady]);

  const initSpotifyPlayer = async () => {
    const res = await fetch('/api/spotify/token');
    if (!res.ok) return;
    const { access_token } = await res.json();

    const player = new (window as any).Spotify.Player({
      name: 'musicfree Web Player',
      getOAuthToken: (cb: any) => { cb(access_token); },
      volume: 0.5
    });

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Spotify Player Ready with Device ID', device_id);
      setSpotifyDeviceId(device_id);
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      setIsPlaying(!state.paused);
    });

    player.connect();
    spotifyPlayerRef.current = player;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const checkSpotifyAuth = async () => {
    try {
      const response = await fetch('/api/spotify/me');
      if (response.ok) {
        const user = await response.json();
        setSpotifyUser(user);
        fetchSpotifyData();
      } else {
        setSpotifyUser(null);
      }
    } catch (err) {
      console.error("Failed to check Spotify auth:", err);
    }
  };

  const checkYoutubeAuth = async () => {
    try {
      const res = await fetch('/api/youtube/me');
      if (res.ok) {
        const data = await res.json();
        setYoutubeUser(data);
        fetchYoutubeData();
      } else {
        setYoutubeUser(null);
      }
    } catch (err) {
      setYoutubeUser(null);
    }
  };

  const fetchYoutubeData = async () => {
    try {
      const [playlistsRes, likedRes] = await Promise.all([
        fetch('/api/youtube/playlists'),
        fetch('/api/youtube/liked-videos')
      ]);
      
      if (playlistsRes.ok) {
        const data = await playlistsRes.json();
        setYoutubePlaylists(data.items || []);
      }
      
      if (likedRes.ok) {
        const data = await likedRes.json();
        const tracks = (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.snippet?.title || "Unknown Title",
          artist: item.snippet?.channelTitle || "Various Artists",
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
          source: 'youtube' as const
        }));
        setYoutubeLikedVideos(tracks);
      }
    } catch (err) {
      console.error("Error fetching YouTube data:", err);
    }
  };

  const recordPlayback = useCallback(async (song: Song) => {
    if (!user || !isFirebaseReady) return;
    
    let durationInSeconds = 180; // Default 3 min
    if (song.duration) {
      const [mins, secs] = song.duration.split(':').map(Number);
      if (!isNaN(mins) && !isNaN(secs)) {
        durationInSeconds = mins * 60 + secs;
      }
    }
    
    try {
      const eventId = `pb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const eventRef = doc(db, 'users', user.uid, 'playbackHistory', eventId);
      await setDoc(eventRef, {
        uid: user.uid,
        songId: song.id,
        songTitle: song.title,
        artist: song.artist,
        source: song.source || 'youtube',
        genre: selectedGenre !== 'All' ? selectedGenre : 'Unknown',
        duration: durationInSeconds,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error recording playback:", err);
    }
  }, [user, isFirebaseReady, db, selectedGenre]);

  const fetchPlaybackHistory = async () => {
    if (!user || !isFirebaseReady) return;
    
    try {
      const q = query(
        collection(db, 'users', user.uid, 'playbackHistory'),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlaybackEvent[];
      setPlaybackHistory(history);
      calculateStats(history);
    } catch (err) {
      console.error("Error fetching playback history:", err);
    }
  };

  const calculateStats = (history: PlaybackEvent[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const getStatsForRange = (start: Date, end: Date) => {
      const rangeHistory = history.filter(event => {
        if (!event.timestamp) return false;
        const date = event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
        return isWithinInterval(date, { start, end });
      });

      const totalPlays = rangeHistory.length;
      const totalMinutes = rangeHistory.reduce((acc, curr) => acc + (curr.duration || 180), 0) / 60;

      const artistCounts: Record<string, number> = {};
      const songCounts: Record<string, { title: string, artist: string, count: number }> = {};
      const genreCounts: Record<string, number> = {};

      rangeHistory.forEach(event => {
        artistCounts[event.artist] = (artistCounts[event.artist] || 0) + 1;
        const songKey = `${event.songId}`;
        if (!songCounts[songKey]) {
          songCounts[songKey] = { title: event.songTitle, artist: event.artist, count: 0 };
        }
        songCounts[songKey].count++;
        if (event.genre) {
          genreCounts[event.genre] = (genreCounts[event.genre] || 0) + 1;
        }
      });

      const topArtists = Object.entries(artistCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topSongs = Object.entries(songCounts)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topGenre = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Generate listening history for charts
      const listeningHistory: { date: string, minutes: number }[] = [];
      const days = eachDayOfInterval({ start, end });
      const isWeekly = days.length <= 7;
      
      days.forEach(day => {
        const dayMinutes = rangeHistory
          .filter(event => {
            const date = event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
            return isSameDay(date, day);
          })
          .reduce((acc, curr) => acc + (curr.duration || 180), 0) / 60;
        
        listeningHistory.push({
          date: format(day, isWeekly ? 'EEE' : 'MMM d'),
          minutes: Math.round(dayMinutes)
        });
      });

      return {
        totalPlays,
        totalMinutes: Math.round(totalMinutes),
        topArtists,
        topSongs,
        topGenre,
        genreData: Object.entries(genreCounts).map(([name, value]) => ({ name, value })),
        listeningHistory
      };
    };

    setStats({
      weekly: getStatsForRange(weekStart, weekEnd),
      monthly: getStatsForRange(monthStart, monthEnd)
    });
  };

  const fetchYoutubePlaylistTracks = async (playlist: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/playlist-items/${playlist.id}`);
      if (res.ok) {
        const data = await res.json();
        const tracks = (data.items || []).map((item: any) => ({
          id: item.contentDetails.videoId,
          title: item.snippet?.title || "Unknown Title",
          artist: item.snippet?.videoOwnerChannelTitle || "Various Artists",
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
          isYoutube: true
        }));
        setActiveYoutubePlaylistTracks(tracks);
      }
    } catch (err) {
      console.error("Error fetching YouTube playlist tracks:", err);
      setError("Failed to fetch YouTube playlist tracks.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLyrics = async (song: Song) => {
    setIsLoading(true);
    try {
      const response = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide the lyrics for the song "${song.title}" by "${song.artist}". If you can't find them, provide a poetic description of the song's mood and themes. Format with line breaks.`,
      });
      setLyrics(response.text || "Lyrics not found.");
    } catch (err) {
      setLyrics("Failed to fetch lyrics.");
    } finally {
      setIsLoading(false);
    }
  };

  const startParty = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPartyRoomId(id);
    socket.current.emit("join-room", id);
    setIsPartyModeOpen(true);
  };

  const joinParty = (id: string) => {
    setPartyRoomId(id);
    socket.current.emit("join-room", id);
    setIsPartyModeOpen(true);
  };

  const startArtistRadio = async (artistName: string) => {
    setIsLoading(true);
    try {
      const response = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a list of 20 YouTube video IDs for songs similar to the style of "${artistName}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                duration: { type: Type.STRING, description: "MM:SS" }
              },
              required: ["id", "title", "artist", "duration"]
            }
          }
        }
      });
      const results = (response.text ? JSON.parse(response.text) : []).map((item: any) => ({
        ...item,
        thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
        source: 'youtube' as const
      }));
      setQueue(results);
      playSong(results[0]);
    } catch (err) {
      console.error("Error starting artist radio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpotifyData = async () => {
    try {
      const [playlistsRes, likedRes, featuredRes, topArtistsRes, madeForYouRes, newReleasesRes, topTracksRes] = await Promise.all([
        fetch('/api/spotify/playlists'),
        fetch('/api/spotify/liked-tracks'),
        fetch('/api/spotify/featured-playlists'),
        fetch('/api/spotify/top-artists'),
        fetch('/api/spotify/made-for-you'),
        fetch('/api/spotify/new-releases'),
        fetch('/api/spotify/top-tracks')
      ]);
      
      if (playlistsRes.ok) {
        const data = await playlistsRes.json();
        setSpotifyPlaylists(data.items || []);
      }
      
      if (likedRes.ok) {
        const data = await likedRes.json();
        const tracks = (data.items || []).map((item: any) => ({
          id: item.track.id,
          title: item.track.name,
          artist: item.track.artists.map((a: any) => a.name).join(', '),
          thumbnail: item.track.album.images[0]?.url,
          duration: formatDuration(item.track.duration_ms),
          uri: item.track.uri,
          source: 'spotify' as const
        }));
        setSpotifyLikedTracks(tracks);
      }

      if (featuredRes.ok) {
        const data = await featuredRes.ok ? await featuredRes.json() : null;
        if (data) setSpotifyFeaturedPlaylists(data.playlists?.items || []);
      }

      if (topArtistsRes.ok) {
        const data = await topArtistsRes.json();
        setSpotifyTopArtists(data.items || []);
      }

      if (madeForYouRes.ok) {
        const data = await madeForYouRes.json();
        setSpotifyMadeForYou(data.playlists?.items || []);
      }

      if (newReleasesRes.ok) {
        const data = await newReleasesRes.json();
        setSpotifyNewReleases(data.albums?.items || []);
      }

      if (topTracksRes.ok) {
        const data = await topTracksRes.json();
        const tracks = (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artists.map((a: any) => a.name).join(', '),
          thumbnail: item.album.images[0]?.url,
          duration: formatDuration(item.duration_ms),
          uri: item.uri,
          source: 'spotify' as const
        }));
        setSpotifyTopTracks(tracks);
      }
    } catch (err) {
      console.error("Failed to fetch Spotify data:", err);
    }
  };

  const fetchYouTubeFeatured = async () => {
    try {
      const response = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a list of 20 currently trending or highly recommended music videos on YouTube.`,
        config: {
          systemInstruction: "You are a music discovery expert. Provide accurate YouTube video IDs for trending music.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "11-character YouTube video ID" },
                title: { type: Type.STRING, description: "Song title" },
                artist: { type: Type.STRING, description: "Artist name" },
                duration: { type: Type.STRING, description: "Song duration in MM:SS format" }
              },
              required: ["id", "title", "artist", "duration"]
            }
          }
        }
      });
      
      const results = (response.text ? JSON.parse(response.text) : []).map((item: any) => ({
        ...item,
        thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
        source: 'youtube' as const
      }));
      
      setYoutubeFeatured(results);
      if (!currentSong && results.length > 0) {
        setCurrentSong(results[0]);
      }

      // Fetch YouTube Playlists
      const playlistResponse = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a list of 10 popular music playlists on YouTube.`,
        config: {
          systemInstruction: "You are a music discovery expert. Provide accurate YouTube playlist IDs for popular music collections.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "YouTube playlist ID" },
                name: { type: Type.STRING, description: "Playlist name" },
                description: { type: Type.STRING, description: "Brief description" },
                thumbnail: { type: Type.STRING, description: "YouTube playlist thumbnail URL" }
              },
              required: ["id", "name", "description", "thumbnail"]
            }
          }
        }
      });
      const playlistResults = playlistResponse.text ? JSON.parse(playlistResponse.text) : [];
      setYoutubePlaylists(playlistResults);

      // Fetch Home Recommendations
      const recsResponse = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Recommend 10 diverse songs for a general music lover.`,
        config: {
          systemInstruction: "You are a music discovery expert. Provide accurate YouTube video IDs for recommended music.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                thumbnail: { type: Type.STRING }
              },
              required: ["id", "title", "artist"]
            }
          }
        }
      });
      const recsResults = (recsResponse.text ? JSON.parse(recsResponse.text) : []).map((item: any) => ({
        ...item,
        thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
        source: 'youtube' as const
      }));
      setHomeRecommendations(recsResults);
    } catch (err) {
      console.error("Error fetching YouTube featured:", err);
    }
  };

  const fetchSpotifyPlaylistTracks = async (playlist: any) => {
    try {
      const response = await fetch(`/api/spotify/playlists/${playlist.id}/tracks`);
      if (response.ok) {
        const data = await response.json();
        setActiveSpotifyPlaylist(playlist);
        setActiveSpotifyPlaylistTracks(data.items || []);
        setActiveView('spotify-playlist');
        setActivePlaylistId(null);
      }
    } catch (err) {
      console.error("Failed to fetch Spotify playlist tracks:", err);
    }
  };

  const viewSpotifyLikedSongs = () => {
    setActiveView('spotify-liked');
    setActivePlaylistId(null);
    setActiveSpotifyPlaylist(null);
  };

  const handleSpotifyLogin = async () => {
    try {
      const response = await fetch('/api/auth/spotify/url');
      const { url } = await response.json();
      window.open(url, 'spotify_login', 'width=600,height=700');
    } catch (err) {
      console.error("Failed to get Spotify auth URL:", err);
    }
  };

  const handleSpotifyLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSpotifyUser(null);
      setSpotifyPlaylists([]);
      setSpotifyLikedTracks([]);
      setYoutubeUser(null);
      setYoutubePlaylists([]);
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const handleYoutubeLogin = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (err) {
      console.error("Failed to get YouTube login URL:", err);
    }
  };

  const handleYoutubeLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setYoutubeUser(null);
      setYoutubePlaylists([]);
    } catch (err) {
      console.error("Failed to logout YouTube:", err);
    }
  };

  useEffect(() => {
    localStorage.setItem('musicfree_playlists', safeStringify(playlists));
    
    const checkDynamicRefreshes = async () => {
      const now = new Date();
      for (const playlist of playlists) {
        if (playlist.isDynamic && playlist.lastRefreshed) {
          const lastRefreshed = new Date(playlist.lastRefreshed);
          let shouldRefresh = false;

          if (playlist.refreshInterval === 'daily') {
            shouldRefresh = now.getTime() - lastRefreshed.getTime() > 24 * 60 * 60 * 1000;
          } else if (playlist.refreshInterval === 'weekly') {
            shouldRefresh = now.getTime() - lastRefreshed.getTime() > 7 * 24 * 60 * 60 * 1000;
          } else if (playlist.refreshInterval === 'monthly') {
            shouldRefresh = now.getTime() - lastRefreshed.getTime() > 30 * 24 * 60 * 60 * 1000;
          }

          if (shouldRefresh) {
            await refreshDynamicPlaylist(playlist);
          }
        }
      }
    };

    checkDynamicRefreshes();
  }, [playlists]);

  const refreshDynamicPlaylist = async (playlist: Playlist) => {
    setIsLoading(true);
    try {
      const prompt = playlist.type === 'radio' 
        ? `Recommend 20 songs for an artist radio based on "${playlist.artistName}".`
        : `Recommend 20 songs for a playlist titled "${playlist.name}" with the vibe: "${playlist.songs.map(s => s.title).join(', ')}".`;

      const response = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a music discovery expert. Provide accurate YouTube video IDs for trending music.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "11-character YouTube video ID" },
                title: { type: Type.STRING, description: "Song title" },
                artist: { type: Type.STRING, description: "Artist name" },
                duration: { type: Type.STRING, description: "Song duration in MM:SS format" }
              },
              required: ["id", "title", "artist", "duration"]
            }
          }
        }
      });

      const results = (response.text ? JSON.parse(response.text) : []).map((item: any) => ({
        ...item,
        thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
        source: 'youtube' as const
      }));

      setPlaylists(prev => prev.map(p => {
        if (p.id === playlist.id) {
          return { ...p, songs: results, lastRefreshed: new Date().toISOString() };
        }
        return p;
      }));
    } catch (err) {
      console.error("Error refreshing dynamic playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (playlistType === 'playlist' && !newPlaylistName.trim()) return;
    if (playlistType === 'radio' && !artistRadioName.trim()) return;

    const id = Math.random().toString(36).substr(2, 9);
    const newPlaylist: Playlist = {
      id,
      name: playlistType === 'radio' ? `${artistRadioName} Radio` : newPlaylistName,
      songs: [],
      createdAt: new Date().toISOString(),
      isDynamic: isDynamicPlaylist,
      isPublic: isPublicPlaylist,
      refreshInterval: isDynamicPlaylist ? playlistRefreshInterval : undefined,
      type: playlistType,
      artistName: playlistType === 'radio' ? artistRadioName : undefined,
      lastRefreshed: isDynamicPlaylist ? new Date().toISOString() : undefined
    };

    if (isDynamicPlaylist || playlistType === 'radio') {
      // Initial population for dynamic/radio
      await refreshDynamicPlaylist(newPlaylist);
    } else {
      setPlaylists(prev => [...prev, newPlaylist]);
    }

    setNewPlaylistName('');
    setArtistRadioName('');
    setIsDynamicPlaylist(false);
    setIsPublicPlaylist(false);
    setPlaylistType('playlist');
    setIsCreatePlaylistModalOpen(false);
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.songs.find(s => s.id === song.id)) return p;
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    }));
    setSongToAddToPlaylist(null);
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    }));
  };

  const initOfflineDB = async () => {
    const db = await openDB('musicfree-offline', 1, {
      upgrade(db) {
        db.createObjectStore('songs', { keyPath: 'id' });
      },
    });
    const songs = await db.getAll('songs');
    setDownloadedSongs(songs);
  };

  const downloadSong = async (song: Song) => {
    if (downloadedSongs.find(s => s.id === song.id)) return;
    
    setDownloadProgress(prev => ({ ...prev, [song.id]: 0 }));
    
    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(prev => ({ ...prev, [song.id]: i }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const db = await openDB('musicfree-offline', 1);
      await db.put('songs', { ...song, isDownloaded: true });
      setDownloadedSongs(prev => [...prev, { ...song, isDownloaded: true }]);
      setDownloadProgress(prev => {
        const next = { ...prev };
        delete next[song.id];
        return next;
      });
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download song for offline use.");
    }
  };

  const removeDownloadedSong = async (songId: string) => {
    const db = await openDB('musicfree-offline', 1);
    await db.delete('songs', songId);
    setDownloadedSongs(prev => prev.filter(s => s.id !== songId));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (activePlaylistId === playlistId) setActivePlaylistId(null);
  };

  const playSpotifyTrack = async (track: any) => {
    // If user is not premium, fallback to YouTube immediately
    if (spotifyUser?.product !== 'premium') {
      const query = `${track.name} ${track.artists.map((a: any) => a.name).join(' ')}`;
      performSearch(query);
      return;
    }

    if (spotifyDeviceId) {
      try {
        const res = await fetch('/api/spotify/token');
        const { access_token } = await res.json();

        const playRes = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [track.uri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        });

        if (playRes.status === 403) {
          // Likely premium required error
          const query = `${track.name} ${track.artists.map((a: any) => a.name).join(' ')}`;
          performSearch(query);
          return;
        }

        setActivePlayer('spotify');
        const song = {
          id: track.id,
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          thumbnail: track.album?.images?.[0]?.url || track.thumbnail,
          uri: track.uri
        };
        setHistory(prev => [currentSong, ...prev].slice(0, 20));
        setCurrentSong(song);
        setIsPlaying(true);
        
        // Pause YouTube if playing
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
      } catch (err) {
        console.error("Spotify playback error:", err);
        // Fallback to YouTube search if direct play fails
        const query = `${track.name} ${track.artists.map((a: any) => a.name).join(' ')}`;
        performSearch(query);
      }
    } else {
      const query = `${track.name} ${track.artists.map((a: any) => a.name).join(' ')}`;
      performSearch(query);
    }
  };

  const getRecommendations = async (genreOverride?: string) => {
    const genreToUse = genreOverride || selectedGenre;
    if (!vibe && genreToUse === 'All') return;
    setIsLoading(true);
    setError(null);
    try {
      const historyContext = history.length > 0 
        ? `User's recent listening history: ${history.map(s => `${s.title} by ${s.artist}`).join(', ')}.`
        : '';

      const statsContext = stats?.monthly 
        ? `The user's top genre is "${stats.monthly.topGenre}". Their most played artists are: ${stats.monthly.topArtists.map(a => a.name).join(', ')}.`
        : '';

      const genreContext = genreToUse !== 'All' ? `The user is specifically looking for music in the "${genreToUse}" genre.` : '';

      // 1. AI Recommendations (Gemini)
      const aiRecsPromise = ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Recommend 5 diverse songs for the following vibe: "${vibe || 'general listening'}". 
        ${genreContext}
        ${statsContext}
        ${historyContext}
        Consider genre, mood, and tempo to provide a personalized mix.`,
        config: {
          systemInstruction: "You are a music discovery expert. Provide personalized recommendations based on vibe, genre, top artists, and listening history. Always include a valid 11-character YouTube video ID for each song.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "11-character YouTube video ID" },
                title: { type: Type.STRING, description: "Song title" },
                artist: { type: Type.STRING, description: "Artist name" },
                thumbnail: { type: Type.STRING, description: "YouTube thumbnail URL (optional)" },
                reason: { type: Type.STRING, description: "Explanation for why this song fits the vibe, history, and user preferences" }
              },
              required: ["id", "title", "artist", "reason"]
            }
          }
        }
      });

      // 2. Spotify Recommendations (if connected)
      let spotifyRecsPromise = Promise.resolve(null);
      if (spotifyUser) {
        // Use current song or top tracks as seeds
        const seedTracks = currentSong?.source === 'spotify' ? currentSong.id : '';
        const seedGenres = genreToUse !== 'All' ? genreToUse.toLowerCase() : 'pop';
        spotifyRecsPromise = fetch(`/api/spotify/recommendations?seed_tracks=${seedTracks}&seed_genres=${seedGenres}`)
          .then(res => res.ok ? res.json() : null);
      }

      // 3. YouTube Music Recommendations (via AI specifically for YouTube)
      const youtubeRecsPromise = youtubeUser ? ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Recommend 5 songs specifically available on YouTube Music for the vibe: "${vibe || 'general listening'}". 
        ${genreContext}
        ${statsContext}
        ${historyContext}
        Focus on tracks that are popular on YouTube Music and align with the user's preferences.`,
        config: {
          systemInstruction: "You are a YouTube Music expert. Provide accurate YouTube video IDs based on user's top genres, artists, and history.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                thumbnail: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["id", "title", "artist", "reason"]
            }
          }
        }
      }) : Promise.resolve(null);

      const [aiResponse, spotifyData, youtubeRecsResponse] = await Promise.all([
        aiRecsPromise,
        spotifyRecsPromise,
        youtubeRecsPromise
      ]);
      
      const aiData = aiResponse.text ? JSON.parse(aiResponse.text) : [];
      const aiRecs = aiData.map((rec: any) => ({ 
        ...rec, 
        source: 'ai',
        feedback: null 
      }));

      const spotifyRecs = spotifyData?.tracks?.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        thumbnail: track.album.images[0]?.url,
        reason: "Based on your Spotify preferences",
        source: 'spotify',
        feedback: null
      })) || [];

      const youtubeRecs = youtubeRecsResponse?.text ? JSON.parse(youtubeRecsResponse.text).map((rec: any) => ({
        ...rec,
        source: 'youtube',
        feedback: null
      })) : [];

      setRecommendations([...aiRecs, ...spotifyRecs, ...youtubeRecs]);
    } catch (err) {
      console.error("Error getting recommendations:", err);
      setError("Failed to get AI recommendations. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setRecommendations(prev => prev.map((rec, i) => 
      i === index ? { ...rec, feedback: rec.feedback === type ? null : type } : rec
    ));
  };

  const performSearch = async (query: string, genreOverride?: string) => {
    if (!query) return;
    setIsLoading(true);
    setError(null);
    setSuggestedArtist(null);
    try {
      const genreToUse = genreOverride || selectedGenre;
      const genreContext = genreToUse !== 'All' ? `The user is specifically looking for results in the "${genreToUse}" genre.` : '';
      const genreQuerySuffix = genreToUse !== 'All' ? ` ${genreToUse}` : '';
      
      // 1. AI Search (Gemini) - Always run as fallback/smart search unless specifically Spotify
      const aiSearchPromise = (searchSource === 'all' || searchSource === 'youtube')
        ? ai.current.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Provide a list of at least 15 songs that match the search query: "${query}". ${genreContext}. Also, if the query seems to be an artist name, identify that artist.`,
            config: {
              systemInstruction: "You are a music discovery expert. Provide accurate YouTube video IDs for songs matching the query. If the query is an artist name, return that artist name in the 'artistMatch' field.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  songs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "11-character YouTube video ID" },
                        title: { type: Type.STRING, description: "Song title" },
                        artist: { type: Type.STRING, description: "Artist name" },
                        duration: { type: Type.STRING, description: "Song duration in MM:SS format" }
                      },
                      required: ["id", "title", "artist", "duration"]
                    }
                  },
                  artistMatch: { type: Type.STRING, description: "The name of the artist if the query is an artist search" }
                },
                required: ["songs"]
              }
            }
          })
        : Promise.resolve(null);

      // 2. Spotify Search (if connected and source is all or spotify)
      const spotifySearchPromise = (spotifyUser && (searchSource === 'all' || searchSource === 'spotify'))
        ? fetch(`/api/spotify/search?q=${encodeURIComponent(query + genreQuerySuffix)}`).then(res => res.ok ? res.json() : null)
        : Promise.resolve(null);

      // 3. YouTube Music Search (if connected and source is all or youtube)
      const youtubeSearchPromise = (youtubeUser && (searchSource === 'all' || searchSource === 'youtube'))
        ? fetch(`/api/youtube/search?q=${encodeURIComponent(query + genreQuerySuffix)}`).then(res => res.ok ? res.json() : null)
        : Promise.resolve(null);

      // 4. Local Library Search
      const localLibraryResults: Song[] = [];
      const searchLower = query.toLowerCase();
      
      // Search in Spotify Liked Tracks
      spotifyLikedTracks.forEach(track => {
        if (track.title.toLowerCase().includes(searchLower) || track.artist.toLowerCase().includes(searchLower)) {
          localLibraryResults.push({ ...track, source: 'spotify', isLibrary: true });
        }
      });

      // Search in YouTube Liked Videos
      youtubeLikedVideos.forEach(video => {
        if (video.title.toLowerCase().includes(searchLower) || video.artist.toLowerCase().includes(searchLower)) {
          localLibraryResults.push({ ...video, source: 'youtube', isLibrary: true });
        }
      });

      // Search in User Playlists
      playlists.forEach(playlist => {
        playlist.songs.forEach(song => {
          if (song.title.toLowerCase().includes(searchLower) || song.artist.toLowerCase().includes(searchLower)) {
            localLibraryResults.push({ ...song, source: song.source || 'local', isLibrary: true });
          }
        });
      });

      const [aiResponse, spotifyData, youtubeData] = await Promise.all([
        aiSearchPromise,
        spotifySearchPromise,
        youtubeSearchPromise
      ]);
      
      const aiData = aiResponse.text ? JSON.parse(aiResponse.text) : { songs: [] };
      const aiResults = (aiData.songs || []).map((item: any) => ({
        ...item,
        thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
        source: 'ai'
      }));

      const spotifyResults = spotifyData?.tracks?.items?.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        thumbnail: track.album.images[0]?.url,
        duration: formatDuration(track.duration_ms),
        uri: track.uri,
        source: 'spotify'
      })) || [];

      const youtubeResults = youtubeData?.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet?.title || "Unknown Title",
        artist: item.snippet?.channelTitle || "Unknown Artist",
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
        source: 'youtube'
      })) || [];

      // Merge and deduplicate (by title and artist roughly)
      const allResults = [...localLibraryResults, ...aiResults, ...spotifyResults, ...youtubeResults];
      const uniqueResults = allResults.filter((song, index, self) =>
        index === self.findIndex((t) => (
          t.id === song.id || (
            t.title.toLowerCase() === song.title.toLowerCase() && 
            t.artist.toLowerCase() === song.artist.toLowerCase()
          )
        ))
      );
      
      setSearchResults(uniqueResults);
      if (aiData.artistMatch) {
        setSuggestedArtist(aiData.artistMatch);
      }
      if (uniqueResults.length > 0) {
        playSong(uniqueResults[0]);
      }
    } catch (err) {
      console.error("Error searching:", err);
      setError("Search failed. Try searching for something else.");
    } finally {
      setIsLoading(false);
    }
  };

  const playSong = useCallback((song: Song) => {
    setHistory(prev => [currentSong, ...prev].slice(0, 20));
    setCurrentSong(song);
    setIsPlaying(true);
    recordPlayback(song);
    
    if (song.source === 'spotify' || song.uri?.startsWith('spotify:')) {
      setActivePlayer('spotify');
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.resume();
      }
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    } else {
      setActivePlayer('youtube');
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.pause();
      }
      // YouTube player will handle play via videoId prop change and onReady/onStateChange
    }
    
    // Add to queue if not already there
    if (!queue.find(s => s.id === song.id)) {
      setQueue(prev => [song, ...prev]);
    }
  }, [currentSong, recordPlayback, queue]);

  const renderControl = (controlId: string) => {
    switch (controlId) {
      case 'shuffle':
        return (
          <button 
            key="shuffle"
            onClick={() => setIsShuffle(!isShuffle)}
            className={cn(
              "p-2 rounded-xl transition-all hover:scale-110",
              isShuffle ? "text-[#2E5BFF]" : "text-white/20 hover:text-white"
            )}
          >
            <ShuffleIcon size={18} />
          </button>
        );
      case 'repeat':
        return (
          <button 
            key="repeat"
            onClick={() => {
              if (repeatMode === 'off') setRepeatMode('all');
              else if (repeatMode === 'all') setRepeatMode('one');
              else setRepeatMode('off');
            }}
            className={cn(
              "p-2 rounded-xl transition-all hover:scale-110 relative",
              repeatMode !== 'off' ? "text-[#2E5BFF]" : "text-white/20 hover:text-white"
            )}
          >
            <RepeatIcon size={18} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-[#2E5BFF] text-white w-3 h-3 rounded-full flex items-center justify-center">1</span>
            )}
          </button>
        );
      case 'heart':
        const isLiked = likedSongs.includes(currentSong.id);
        return (
          <button 
            key="heart" 
            onClick={() => {
              if (isLiked) setLikedSongs(prev => prev.filter(id => id !== currentSong.id));
              else setLikedSongs(prev => [...prev, currentSong.id]);
            }}
            className={cn(
              "p-2.5 rounded-2xl transition-all hover:scale-110",
              isLiked ? "text-red-500" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
        );
      case 'lyrics':
        return (
          <button 
            key="lyrics"
            onClick={() => {
              setIsLyricsOpen(!isLyricsOpen);
              if (!lyrics || isLyricsOpen) fetchLyrics(currentSong);
            }}
            className={cn(
              "p-2.5 rounded-2xl transition-all hover:scale-110",
              isLyricsOpen ? "text-white bg-[#2E5BFF] shadow-lg shadow-[#2E5BFF]/20" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <Mic2 size={20} />
          </button>
        );
      case 'timer':
        return (
          <button 
            key="timer"
            onClick={() => setIsSleepTimerOpen(!isSleepTimerOpen)}
            className={cn(
              "p-2.5 rounded-2xl transition-all hover:scale-110",
              sleepTimer ? "text-white bg-[#2E5BFF] shadow-lg shadow-[#2E5BFF]/20" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <Timer size={20} />
          </button>
        );
      case 'skipBack':
        return (
          <button 
            key="skipBack"
            onClick={handleSkipBack}
            className="hidden sm:block text-white/20 hover:text-white transition-all hover:scale-110"
          >
            <SkipBack size={24} />
          </button>
        );
      case 'playPause':
        return (
          <button 
            key="playPause"
            onClick={togglePlay}
            className="w-10 h-10 lg:w-14 lg:h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-white/10 active:scale-95"
          >
            {isPlaying ? <Pause fill="black" size={24} className="lg:w-7 lg:h-7" /> : <Play fill="black" className="ml-1 lg:w-7 lg:h-7" size={24} />}
          </button>
        );
      case 'skipForward':
        return (
          <button 
            key="skipForward"
            onClick={handleSkipForward}
            className="text-white/20 hover:text-white transition-all hover:scale-110"
          >
            <SkipForward size={24} />
          </button>
        );
      case 'seekBack':
        return (
          <button 
            key="seekBack"
            onClick={() => {
              if (activePlayer === 'youtube' && playerRef.current) {
                const newTime = Math.max(0, playerRef.current.getCurrentTime() - 10);
                playerRef.current.seekTo(newTime);
              }
            }}
            className="text-white/20 hover:text-white transition-all hover:scale-110"
          >
            <div className="relative">
              <RotateCcw size={20} />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5">10</span>
            </div>
          </button>
        );
      case 'seekForward':
        return (
          <button 
            key="seekForward"
            onClick={() => {
              if (activePlayer === 'youtube' && playerRef.current) {
                const newTime = Math.min(duration, playerRef.current.getCurrentTime() + 10);
                playerRef.current.seekTo(newTime);
              }
            }}
            className="text-white/20 hover:text-white transition-all hover:scale-110"
          >
            <div className="relative">
              <RotateCw size={20} />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5">10</span>
            </div>
          </button>
        );
      case 'queue':
        return (
          <button 
            key="queue"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={cn(
              "p-2.5 rounded-2xl transition-all hover:scale-110",
              isQueueOpen ? "text-white bg-[#2E5BFF] shadow-lg shadow-[#2E5BFF]/20" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <ListMusic size={20} />
          </button>
        );
      case 'equalizer':
        return (
          <button 
            key="equalizer"
            onClick={() => setIsEqualizerOpen(!isEqualizerOpen)}
            className={cn(
              "p-2.5 rounded-2xl transition-all hover:scale-110",
              isEqualizerOpen ? "text-white bg-[#2E5BFF] shadow-lg shadow-[#2E5BFF]/20" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <Sliders size={20} />
          </button>
        );
      case 'party':
        return (
          <button 
            key="party"
            onClick={() => setIsPartyModeOpen(!isPartyModeOpen)}
            className={cn(
              "p-2.5 rounded-2xl transition-all hover:scale-110",
              isPartyModeOpen ? "text-white bg-[#2E5BFF] shadow-lg shadow-[#2E5BFF]/20" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <Users size={20} />
          </button>
        );
      case 'visualizer':
        return (
          <button 
            key="visualizer"
            onClick={() => setShowVisualizer(!showVisualizer)}
            className={cn(
              "p-2.5 rounded-2xl transition-all hover:scale-110",
              showVisualizer ? "text-white bg-[#2E5BFF] shadow-lg shadow-[#2E5BFF]/20" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <Waves size={20} />
          </button>
        );
      case 'volume':
        return (
          <div key="volume" className="flex items-center gap-3 group">
            <Volume2 size={20} className="text-white/20 group-hover:text-white transition-colors" />
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden relative cursor-pointer">
              <div className="w-2/3 h-full bg-white/20 group-hover:bg-[#2E5BFF] transition-colors" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSkipForward = useCallback(() => {
    if (repeatMode === 'one') {
      if (activePlayer === 'youtube' && playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.seek(0);
        spotifyPlayerRef.current.resume();
      }
      return;
    }

    let nextSong: Song | null = null;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      nextSong = queue[randomIndex];
    } else if (currentIndex < queue.length - 1) {
      nextSong = queue[currentIndex + 1];
    } else if (repeatMode === 'all') {
      nextSong = queue[0];
    }

    if (nextSong) {
      playSong(nextSong);
    } else if (isAutoplayEnabled && recommendations.length > 0) {
      const rec = recommendations[0];
      const newSong: Song = {
        id: rec.id,
        title: rec.title,
        artist: rec.artist,
        thumbnail: rec.thumbnail || `https://i.ytimg.com/vi/${rec.id}/maxresdefault.jpg`,
        source: 'youtube'
      };
      playSong(newSong);
    } else {
      playSong(INITIAL_SONGS[Math.floor(Math.random() * INITIAL_SONGS.length)]);
    }
  }, [repeatMode, activePlayer, queue, currentSong, isShuffle, playSong, isAutoplayEnabled, recommendations]);

  const handleSkipBack = useCallback(() => {
    if (currentTime > 3) {
      if (activePlayer === 'youtube' && playerRef.current) {
        playerRef.current.seekTo(0);
      } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.seek(0);
      }
      return;
    }
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    } else if (history.length > 0) {
      const prevSong = history[0];
      setHistory(prev => prev.slice(1));
      setCurrentSong(prevSong);
      setIsPlaying(true);
    }
  }, [currentTime, activePlayer, queue, currentSong, playSong, history]);

  // Media Session API for background playback and OS controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: [
          { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        if (activePlayer === 'youtube' && playerRef.current) {
          playerRef.current.playVideo();
        } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
          spotifyPlayerRef.current.resume();
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        if (activePlayer === 'youtube' && playerRef.current) {
          playerRef.current.pauseVideo();
        } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
          spotifyPlayerRef.current.pause();
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', handleSkipBack);
      navigator.mediaSession.setActionHandler('nexttrack', handleSkipForward);
    }
  }, [currentSong, isPlaying, activePlayer, handleSkipBack, handleSkipForward]);

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
    toast.success(`Added ${song.title} to queue`);
  };

  const removeFromQueue = (songId: string) => {
    setQueue(prev => prev.filter(s => s.id !== songId));
  };

  const clearQueue = () => {
    setQueue([currentSong]);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  const fetchArtistProfile = async (artistName: string) => {
    setIsLoading(true);
    setActiveArtist(artistName);
    setActiveView('artist');
    setActivePlaylistId(null);
    setActiveSpotifyPlaylist(null);
    setArtistBio(null);
    setRelatedArtists([]);
    
    try {
      const response = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a comprehensive profile for the artist: "${artistName}". Include at least 20 of their most popular and representative songs across their entire career.`,
        config: {
          systemInstruction: "You are a music discovery expert. Provide an artist biography, popular tracks with YouTube IDs, and related artists.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              songs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "11-character YouTube video ID" },
                    title: { type: Type.STRING, description: "Song title" },
                    artist: { type: Type.STRING, description: "Artist name" }
                  },
                  required: ["id", "title", "artist"]
                }
              },
              bio: { type: Type.STRING, description: "Short artist biography (2-3 sentences)" },
              related: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 5-6 similar artists"
              }
            },
            required: ["songs", "bio", "related"]
          }
        }
      });
      
      const data = response.text ? JSON.parse(response.text) : {};
      const results = (data.songs || []).map((item: any) => ({
        ...item,
        thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`
      }));
      
      setArtistTracks(results);
      setArtistBio(data.bio || `Exploring the discography of ${artistName}. Discover their top tracks and hidden gems.`);
      setRelatedArtists(data.related || []);
    } catch (err) {
      console.error("Error fetching artist profile:", err);
      setError("Failed to load artist profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingByGenre = async (genre: string) => {
    if (genre === 'All') {
      setTrendingSongs(INITIAL_SONGS);
      return;
    }
    setIsLoading(true);
    try {
      const response = await ai.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a list of 10 trending or classic songs in the "${genre}" genre.`,
        config: {
          systemInstruction: `You are a music discovery expert. Provide accurate YouTube video IDs for trending or classic songs in the ${genre} genre.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "11-character YouTube video ID" },
                title: { type: Type.STRING, description: "Song title" },
                artist: { type: Type.STRING, description: "Artist name" }
              },
              required: ["id", "title", "artist"]
            }
          }
        }
      });
      
      const data = response.text ? JSON.parse(response.text) : [];
      const results = data.map((item: any) => ({
        ...item,
        thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`
      }));
      
      setTrendingSongs(results);
    } catch (err) {
      console.error("Error fetching trending songs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'explore') {
      fetchTrendingByGenre(selectedGenre);
    }
  }, [selectedGenre, activeView]);

  const clearPlaybackHistory = async () => {
    if (!user || !isFirebaseReady) return;
    
    try {
      const q = query(collection(db, 'users', user.uid, 'playbackHistory'));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setPlaybackHistory([]);
      toast.success('Playback history cleared');
    } catch (err) {
      console.error("Error clearing playback history:", err);
      toast.error('Failed to clear history');
    }
  };

  const HistoryView = () => {
    const sortedHistory = [...playbackHistory].sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    return (
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter">Listening History</h2>
            <p className="text-white/40 font-medium text-sm lg:text-base uppercase tracking-widest">Your recently played tracks</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your listening history?')) {
                clearPlaybackHistory();
              }
            }}
            className="px-6 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-2xl text-white/40 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
          >
            <Trash2 size={14} /> Clear History
          </button>
        </div>

        <div className="space-y-2">
          {sortedHistory.map((event, index) => (
            <div 
              key={event.id || index}
              onClick={() => {
                const song: Song = {
                  id: event.songId,
                  title: event.songTitle,
                  artist: event.artist,
                  thumbnail: `https://i.ytimg.com/vi/${event.songId}/maxresdefault.jpg`,
                  source: event.source || 'youtube'
                };
                setCurrentSong(song);
                setIsPlaying(true);
              }}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden relative">
                <img 
                  src={`https://i.ytimg.com/vi/${event.songId}/maxresdefault.jpg`} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={20} fill="white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{event.songTitle}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/40 truncate">{event.artist}</p>
                  <span className="text-white/10">•</span>
                  <div className="flex items-center gap-1">
                    {event.source === 'spotify' && <Music size={10} className="text-[#1DB954]" />}
                    {event.source === 'youtube' && <Youtube size={10} className="text-[#FF0000]" />}
                    <span className="text-[9px] font-black uppercase tracking-tighter text-white/20">{event.source || 'youtube'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono text-white/30">
                  {event.timestamp ? format(event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp), 'MMM d, h:mm a') : 'Recently'}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                   <History size={10} className="text-white/20" />
                   <span className="text-[9px] font-black uppercase tracking-tighter text-white/20">Played</span>
                </div>
              </div>
            </div>
          ))}

          {sortedHistory.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                <History size={40} />
              </div>
              <p className="text-white/40">Your listening history is empty. Start playing some music!</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const StatsView = () => {
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const currentStats = stats?.[period];

    if (!currentStats) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white/40">
          <BarChart2 size={48} className="mb-4 animate-pulse" />
          <p>Loading your listening stats...</p>
        </div>
      );
    }

    const COLORS = ['#2E5BFF', '#FF2E5B', '#2EFF5B', '#FFB82E', '#B82EFF', '#2EFFF2', '#FF2EF2', '#FF8A2E'];

    return (
      <div className="p-8 space-y-8 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Stats</h1>
            <p className="text-white/40">Insights into your listening habits</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setPeriod('weekly')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                period === 'weekly' ? "bg-[#2E5BFF] text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                period === 'monthly' ? "bg-[#2E5BFF] text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Total Plays</p>
            <p className="text-3xl font-bold text-white">{currentStats.totalPlays}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Minutes Listened</p>
            <p className="text-3xl font-bold text-white">{currentStats.totalMinutes}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Top Genre</p>
            <p className="text-3xl font-bold text-[#2E5BFF]">{currentStats.topGenre}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Avg. Per Day</p>
            <p className="text-3xl font-bold text-white">{Math.round(currentStats.totalPlays / (period === 'weekly' ? 7 : 30))}</p>
          </div>
        </div>

        {/* Listening Minutes Chart */}
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Timer size={20} className="text-[#2E5BFF]" />
            Listening Minutes
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentStats.listeningHistory}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E5BFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E5BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#FFF' }}
                  cursor={{ stroke: '#2E5BFF', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#2E5BFF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMinutes)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Artists Chart */}
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Users size={20} className="text-[#2E5BFF]" />
              Top 10 Artists
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentStats.topArtists} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12}
                    tickFormatter={(value) => value.length > 12 ? value.substring(0, 10) + '...' : value}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {currentStats.topArtists.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Genre Distribution */}
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-[#FF2E5B]" />
              Genre Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentStats.genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {currentStats.genreData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Songs List */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Music2 size={20} className="text-[#2EFF5B]" />
            Top 10 Songs
          </h3>
          <div className="space-y-2">
            {currentStats.topSongs.map((song: any, index: number) => (
              <div 
                key={song.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className="w-8 text-center text-white/20 font-bold group-hover:text-[#2E5BFF]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{song.title}</p>
                  <p className="text-white/40 text-sm">{song.artist}</p>
                </div>
                <div className="text-white/20 text-sm font-mono">
                  {song.count} plays
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SongRow = ({ song, index, showIdx = true }: { song: Song, index?: number, showIdx?: boolean, key?: any }) => {
    const isLiked = likedSongs.includes(song.id);
    const isActive = currentSong.id === song.id;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (index || 0) * 0.05 }}
        className={cn(
          "group flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 cursor-pointer",
          isActive ? "bg-[#2E5BFF]/10 border border-[#2E5BFF]/20" : "hover:bg-white/5 border border-transparent"
        )}
        onClick={() => playSong(song)}
      >
        {showIdx && index !== undefined && (
          <span className="w-6 text-xs font-bold text-white/20 group-hover:text-[#2E5BFF] transition-colors">
            {(index + 1).toString().padStart(2, '0')}
          </span>
        )}
        
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
          <img src={song.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          {isActive && isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex gap-0.5 items-end h-3">
                <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-[#2E5BFF]" />
                <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-[#2E5BFF]" />
                <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-[#2E5BFF]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-bold truncate tracking-tight text-sm",
            isActive ? "text-[#2E5BFF]" : "text-white"
          )}>{song.title}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[120px]">{song.artist}</p>
            {song.duration && (
              <>
                <span className="text-white/10">•</span>
                <span className="text-[10px] font-mono text-white/30">{song.duration}</span>
              </>
            )}
            <div className="flex items-center gap-1.5 ml-1">
              {song.source === 'spotify' && <div className="flex items-center gap-1 text-[#1DB954] text-[9px] font-black uppercase tracking-tighter"><Music size={10} /> Spotify</div>}
              {song.source === 'youtube' && <div className="flex items-center gap-1 text-[#FF0000] text-[9px] font-black uppercase tracking-tighter"><Youtube size={10} /> YouTube</div>}
              {song.source === 'ai' && <div className="flex items-center gap-1 text-[#2E5BFF] text-[9px] font-black uppercase tracking-tighter"><Sparkles size={10} /> AI</div>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (isLiked) setLikedSongs(prev => prev.filter(id => id !== song.id));
              else setLikedSongs(prev => [...prev, song.id]);
            }}
            className={cn(
              "p-2 rounded-xl transition-all hover:scale-110",
              isLiked ? "text-red-500" : "text-white/20 hover:text-white hover:bg-white/5"
            )}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setPlaylistType('radio');
              setArtistRadioName(song.artist);
              setIsCreatePlaylistModalOpen(true);
            }}
            className="p-2 rounded-xl text-white/20 hover:text-[#2E5BFF] hover:bg-white/5 transition-all"
            title="Start Artist Radio"
          >
            <Radio size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleShare(song);
            }}
            className="p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all"
            title="Share Song"
          >
            <Share2 size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSongToAddToPlaylist(song);
            }}
            className="p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </motion.div>
    );
  };

  const handleShare = async (song: Song) => {
    const shareData = {
      title: `${song.title} by ${song.artist}`,
      text: `Check out this song: ${song.title} by ${song.artist}`,
      url: song.source === 'youtube' 
        ? `https://www.youtube.com/watch?v=${song.id}` 
        : song.source === 'spotify' 
          ? `https://open.spotify.com/track/${song.id}`
          : window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        toast.error('Failed to share song');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const togglePlay = () => {
    if (activePlayer === 'youtube' && playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
      spotifyPlayerRef.current.togglePlay();
    }
  };

  return (
    <div className="flex h-screen bg-[#05070a] text-[#e0d8d0] font-sans selection:bg-[#2E5BFF] selection:text-white overflow-hidden relative">
      <Toaster position="bottom-right" theme="dark" />
      
      {/* AI DJ Toggle Button */}
      <button 
        onClick={() => setIsAiDjOpen(!isAiDjOpen)}
        className={cn(
          "fixed bottom-32 right-8 w-14 h-14 rounded-2xl flex items-center justify-center z-50 transition-all duration-500 group shadow-2xl",
          isAiDjOpen ? "bg-white text-[#0a1a3a] rotate-90" : "bg-[#2E5BFF] text-white hover:scale-110"
        )}
      >
        {isAiDjOpen ? <X size={24} /> : <Bot size={24} className="group-hover:animate-bounce" />}
        {!isAiDjOpen && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-[#05070a] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isAiDjOpen && <AiDjPanel />}
      </AnimatePresence>

      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0a1a3a] rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2E5BFF] rounded-full blur-[150px] opacity-20" />
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : -280,
          width: 280,
          opacity: 1
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:relative inset-y-0 left-0 z-50 glass-dark border-r border-white/5 flex flex-col lg:translate-x-0 shadow-2xl"
      >
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4 group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2E5BFF] to-[#0a1a3a] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(46,91,255,0.4)] group-hover:rotate-12 transition-transform duration-500">
              <Music2 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-glow">musicfree</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2E5BFF] opacity-80">Premium Audio</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">Menu</p>
            <NavItem 
              icon={<Home size={20} />} 
              label="Home" 
              active={activeView === 'home' && !activePlaylistId} 
              onClick={() => {
                setActiveView('home');
                setActivePlaylistId(null);
                setSearchResults([]);
              }}
            />
            <NavItem 
              icon={<Search size={20} />} 
              label="Explore" 
              active={activeView === 'explore' && !activePlaylistId}
              onClick={() => {
                setActiveView('explore');
                setActivePlaylistId(null);
              }}
            />
            <NavItem 
              icon={<Library size={20} />} 
              label="Library" 
              active={activeView === 'library' && !activePlaylistId}
              onClick={() => {
                setActiveView('library');
                setActivePlaylistId(null);
              }}
            />
            <NavItem 
              icon={<BarChart2 size={20} />} 
              label="Stats" 
              active={activeView === 'stats'}
              onClick={() => {
                setActiveView('stats');
                setActivePlaylistId(null);
              }}
            />
            <NavItem 
              icon={<History size={20} />} 
              label="History" 
              active={activeView === 'history'}
              onClick={() => {
                setActiveView('history');
                setActivePlaylistId(null);
              }}
            />
          </div>

          <div className="pt-6 space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">Social</p>
            <NavItem 
              icon={<Users size={20} />} 
              label="Community" 
              active={activeView === 'community'}
              onClick={() => {
                setActiveView('community');
                setActivePlaylistId(null);
              }}
            />
            <NavItem 
              icon={<Users size={20} />} 
              label="Party Mode" 
              active={isPartyModeOpen}
              onClick={() => setIsPartyModeOpen(true)}
            />
          </div>

          <div className="pt-6 space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">Your Collection</p>
            <NavItem 
              icon={<Heart size={20} />} 
              label="Liked Songs" 
              active={activeView === 'spotify-liked'}
              onClick={() => setActiveView('spotify-liked')}
            />
            <NavItem 
              icon={<Download size={20} />} 
              label="Downloads" 
              active={activeView === 'library' && activePlaylistId === 'downloads'}
              onClick={() => {
                setActiveView('library');
                setActivePlaylistId('downloads');
              }}
            />
          </div>
          <NavItem 
            icon={<User size={20} />} 
            label="Profile" 
            active={activeView === 'profile' && !activePlaylistId}
            onClick={() => {
              setActiveView('profile');
              setActivePlaylistId(null);
            }}
          />
          
          <div className="pt-8 pb-2 px-2 text-xs font-semibold text-white/30 uppercase tracking-widest flex items-center justify-between">
            <span>My Playlists</span>
            <button onClick={() => setIsCreatePlaylistModalOpen(true)} className="hover:text-[#2E5BFF] transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-0.5">
            {playlists.map(p => (
              <NavItem 
                key={p.id} 
                icon={
                  p.type === 'radio' ? <Radio size={18} className="text-[#2E5BFF]" /> : 
                  p.isDynamic ? <Sparkles size={18} className="text-[#2E5BFF]" /> : 
                  <ListMusic size={18} />
                } 
                label={p.name} 
                active={activePlaylistId === p.id}
                onClick={() => {
                  setActivePlaylistId(p.id);
                  setSearchResults([]);
                }} 
              />
            ))}
          </div>

          <div className="pt-8 pb-2 px-2 text-xs font-semibold text-white/30 uppercase tracking-widest flex items-center justify-between">
            <span>Spotify</span>
            <Music2 size={14} className="text-[#1DB954]" />
          </div>
          
          {!spotifyUser ? (
            <button 
              onClick={handleSpotifyLogin}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] group-hover:bg-[#1DB954] group-hover:text-white transition-all">
                <Plus size={18} />
              </div>
              Connect Spotify
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                {spotifyUser.images?.[0]?.url ? (
                  <img src={spotifyUser.images[0].url} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Music2 size={14} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{spotifyUser.display_name}</p>
                  <button onClick={handleSpotifyLogout} className="text-[10px] text-white/40 hover:text-red-500 uppercase tracking-wider font-bold">Disconnect</button>
                </div>
              </div>
              
              <div className="space-y-0.5">
                <NavItem 
                  icon={<Heart size={18} className="text-[#1DB954]" />} 
                  label="Liked Songs" 
                  active={activeView === 'spotify-liked'}
                  onClick={viewSpotifyLikedSongs} 
                />
                {spotifyPlaylists.slice(0, 8).map(playlist => (
                  <div key={playlist.id} className="group relative">
                    <button 
                      onClick={() => fetchSpotifyPlaylistTracks(playlist)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate text-left pr-10",
                        activeSpotifyPlaylist?.id === playlist.id && activeView === 'spotify-playlist'
                          ? "text-white bg-white/10"
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className="w-6 h-6 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                        {playlist.images?.[0]?.url && <img src={playlist.images[0].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <span className="truncate">{playlist.name}</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        importSpotifyPlaylist(playlist.id, playlist.name);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/20 hover:text-[#1DB954] opacity-0 group-hover:opacity-100 transition-all"
                      title="Import to YouTube Music"
                    >
                      <Import size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 pb-2 px-2 text-xs font-semibold text-white/30 uppercase tracking-widest flex items-center justify-between">
            <span>YouTube Music</span>
            <Youtube size={14} className="text-[#FF0000]" />
          </div>
          
          {!youtubeUser ? (
            <button 
              onClick={handleYoutubeLogin}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000] group-hover:bg-[#FF0000] group-hover:text-white transition-all">
                <Plus size={18} />
              </div>
              Connect YouTube Music
            </button>
          ) : (
            <div className="space-y-1">
              <button 
                onClick={() => setActiveView('youtube-library')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                  activeView === 'youtube-library' ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  activeView === 'youtube-library' ? "bg-[#FF0000] text-white" : "bg-[#FF0000]/10 text-[#FF0000] group-hover:bg-[#FF0000] group-hover:text-white"
                )}>
                  <Library size={18} />
                </div>
                YouTube Library
              </button>

              <div className="space-y-0.5 mt-2">
                {youtubePlaylists.slice(0, 5).map(playlist => (
                  <button 
                    key={playlist.id}
                    onClick={() => {
                      setActiveYoutubePlaylist(playlist);
                      setActiveView('youtube-playlist');
                      fetchYoutubePlaylistTracks(playlist);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate text-left",
                      activeYoutubePlaylist?.id === playlist.id && activeView === 'youtube-playlist'
                        ? "text-white bg-white/10"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="w-6 h-6 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                      {playlist.snippet?.thumbnails?.default?.url && <img src={playlist.snippet.thumbnails.default.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                    </div>
                    <span className="truncate">{playlist.snippet?.title || "Untitled Playlist"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 pb-2 px-2 text-xs font-semibold text-white/30 uppercase tracking-widest">Playlists</div>
          <NavItem icon={<Plus size={20} />} label="Create Playlist" />
          <NavItem icon={<Heart size={20} />} label="Liked Songs" />
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-0 flex flex-col overflow-y-auto scrollbar-hide">
        <header className="sticky top-0 z-20 p-4 lg:p-6 flex items-center justify-between glass border-b border-white/5 mx-4 lg:mx-6 mt-4 lg:mt-6 rounded-3xl">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            >
              <Menu size={24} />
            </button>
            <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#2E5BFF] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={
                    selectedGenre !== 'All' 
                      ? `Search ${selectedGenre} songs...` 
                      : searchSource === 'youtube' 
                        ? "Search YouTube Music..." 
                        : searchSource === 'spotify' 
                          ? "Search Spotify..." 
                          : "Search songs, artists, or paste YouTube ID..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-[#2E5BFF]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm md:text-base"
                />
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSearchSource('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    searchSource === 'all' ? "bg-[#2E5BFF] text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSearchSource('youtube')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                    searchSource === 'youtube' ? "bg-[#FF0000] text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  <Youtube size={12} /> YT Music
                </button>
                <button
                  type="button"
                  onClick={() => setSearchSource('spotify')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                    searchSource === 'spotify' ? "bg-[#1DB954] text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  <Music size={12} /> Spotify
                </button>
              </div>
            </form>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 lg:gap-4 ml-4">
            {isOffline ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs font-bold animate-pulse">
                <WifiOff size={14} /> Offline Mode
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-bold">
                <Wifi size={14} /> Online
              </div>
            )}
            <button className="hidden sm:flex p-2 hover:bg-white/5 rounded-full transition-colors">
              <Mic2 size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2E5BFF] to-[#0a1a3a] border border-white/20 overflow-hidden">
              {spotifyUser?.images?.[0]?.url ? (
                <img src={spotifyUser.images[0].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={20} className="text-white/20 m-auto" />
              )}
            </div>
          </div>
        </header>

        <div className="px-4 lg:px-8 pb-32 space-y-8 lg:space-y-12">
          {/* Genre Filter */}
          {(activeView === 'home' || activeView === 'explore') && !activePlaylistId && (
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                    selectedGenre === genre 
                      ? "bg-[#2E5BFF] border-[#2E5BFF] text-white shadow-lg shadow-[#2E5BFF]/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {(activeView === 'home' || activeView === 'explore') && !activePlaylistId && (searchResults.length > 0 || suggestedArtist) && (
            <section className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tighter">
                    Search Results
                    {selectedGenre !== 'All' && (
                      <span className="ml-3 text-sm font-bold px-3 py-1 bg-[#2E5BFF]/20 text-[#2E5BFF] rounded-full border border-[#2E5BFF]/20 animate-in fade-in zoom-in duration-300">
                        {selectedGenre}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Found {searchResults.length} matches</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setSearchSource('all')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                        searchSource === 'all' ? "bg-[#2E5BFF] text-white shadow-lg shadow-[#2E5BFF]/20" : "text-white/40 hover:text-white"
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSearchSource('youtube')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                        searchSource === 'youtube' ? "bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20" : "text-white/40 hover:text-white"
                      )}
                    >
                      <Youtube size={12} /> YouTube
                    </button>
                    <button
                      onClick={() => setSearchSource('spotify')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                        searchSource === 'spotify' ? "bg-[#1DB954] text-white shadow-lg shadow-[#1DB954]/20" : "text-white/40 hover:text-white"
                      )}
                    >
                      <Music size={12} /> Spotify
                    </button>
                  </div>
                  <button 
                    onClick={clearSearchResults}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all active:scale-95"
                    title="Clear Results"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {suggestedArtist && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => fetchArtistProfile(suggestedArtist)}
                  className="p-6 rounded-[32px] bg-gradient-to-r from-[#2E5BFF] to-[#0a1a3a] text-white flex items-center justify-between cursor-pointer group hover:scale-[1.02] transition-all shadow-xl shadow-[#2E5BFF]/20"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                      <User size={32} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black tracking-tight">View {suggestedArtist}'s Profile</h4>
                      <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Explore full discography and biography</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <SkipForward size={24} />
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {!youtubeUser && searchSource !== 'spotify' && (
                  <div className="col-span-full p-6 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FF0000] rounded-2xl flex items-center justify-center shadow-lg">
                        <Youtube className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Connect YouTube Music</h4>
                        <p className="text-white/60 text-sm">Get personalized results and access your library directly.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/auth/google'}
                      className="bg-[#FF0000] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#CC0000] transition-all flex items-center gap-2"
                    >
                      Connect Now <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {searchResults.filter(s => s.isLibrary).length > 0 && (
                  <div className="col-span-full py-4">
                    <h4 className="text-sm font-bold text-[#2E5BFF] uppercase tracking-widest flex items-center gap-2">
                      <Library size={16} /> From Your Library
                    </h4>
                  </div>
                )}
                {searchResults.filter(s => s.isLibrary).map((song, idx) => (
                  <SongRow key={song.id} song={song} index={idx} />
                ))}
                
                {searchResults.filter(s => !s.isLibrary).length > 0 && (
                  <div className="col-span-full py-4 mt-4 border-t border-white/5">
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Search size={16} /> Global Results
                    </h4>
                  </div>
                )}
                {searchResults.filter(s => !s.isLibrary).map((song, idx) => (
                  <SongRow key={song.id} song={song} index={idx} />
                ))}
              </div>
            </section>
          )}

          {/* Explore View */}
          {activeView === 'explore' && !activePlaylistId && (
            <section className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tighter">Explore {selectedGenre !== 'All' ? selectedGenre : 'Music'}</h2>
                  <p className="text-white/40 font-medium text-sm lg:text-base">Discover trending tracks and hidden gems curated by YouTube.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start">
                  {['All', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Hip Hop'].map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreSelect(genre)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                        selectedGenre === genre ? "bg-[#2E5BFF] text-white" : "text-white/40 hover:text-white"
                      )}
                    >
                      {genre === 'All' ? 'Trending' : genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {isLoading && trendingSongs.length === 0 ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                      <div className="aspect-square bg-white/5 rounded-2xl" />
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {trendingSongs.map((song, idx) => (
                      <SongRow key={song.id} song={song} index={idx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Genre Spotlight */}
              {selectedGenre !== 'All' && (
                <div className="p-8 rounded-3xl bg-gradient-to-br from-[#2E5BFF]/20 to-transparent border border-[#2E5BFF]/20 space-y-4">
                  <div className="flex items-center gap-3 text-[#2E5BFF]">
                    <Sparkles size={24} />
                    <h3 className="text-xl font-bold uppercase tracking-widest">Genre Spotlight: {selectedGenre}</h3>
                  </div>
                  <p className="text-white/60 leading-relaxed max-w-2xl">
                    The {selectedGenre} genre has a rich history and continues to evolve. From its roots to modern interpretations, 
                    it offers a unique sonic experience. Dive deep into the sounds that define this genre.
                  </p>
                  <button 
                    onClick={() => performSearch(selectedGenre)}
                    className="bg-[#2E5BFF] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#4D75FF] transition-all"
                  >
                    Deep Dive into {selectedGenre}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Artist Profile View */}
          {activeView === 'artist' && activeArtist && (
            <section className="space-y-10 lg:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-12 relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#2E5BFF]/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative group mx-auto lg:mx-0">
                  <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full p-1 bg-gradient-to-br from-[#2E5BFF] via-transparent to-[#0a1a3a] shadow-2xl overflow-hidden flex-shrink-0 transition-transform duration-700 group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden border-4 border-black/20">
                      {artistTracks.length > 0 ? (
                        <img 
                          src={artistTracks[0].thumbnail} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-sm group-hover:blur-none scale-110" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <User size={80} className="text-white/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#2E5BFF] rounded-full flex items-center justify-center border-4 border-[#0a0a0a] shadow-xl">
                    <CheckCircle2 size={20} fill="white" className="text-[#2E5BFF]" />
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2E5BFF] opacity-80">Verified Artist</p>
                    <h2 className="text-5xl lg:text-8xl font-black tracking-tighter leading-none text-glow">{activeArtist}</h2>
                  </div>
                  
                  <p className="text-white/50 max-w-2xl leading-relaxed text-sm lg:text-lg font-medium mx-auto lg:mx-0">
                    {artistBio || `Exploring the unique soundscape of ${activeArtist}. Dive into their latest releases and most popular tracks curated just for you.`}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-6">
                    <div className="flex items-center gap-8 pr-8 border-r border-white/10 hidden lg:flex">
                      <div className="text-center lg:text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Monthly Listeners</p>
                        <p className="text-xl font-black text-white">1,245,892</p>
                      </div>
                      <div className="text-center lg:text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Global Rank</p>
                        <p className="text-xl font-black text-white">#42</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => artistTracks.length > 0 && playSong(artistTracks[0])}
                      className="bg-[#2E5BFF] text-white px-8 lg:px-10 py-3.5 lg:py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-[#4D75FF] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#2E5BFF]/30 text-sm lg:text-base group"
                    >
                      <Play fill="white" size={20} className="group-hover:scale-110 transition-transform" /> Play Top Track
                    </button>
                    <button 
                      onClick={() => startArtistRadio(activeArtist)}
                      className="glass-dark border border-white/10 text-white px-8 lg:px-10 py-3.5 lg:py-4 rounded-2xl font-black hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-sm lg:text-base flex items-center gap-3"
                    >
                      <Radio size={20} className="text-[#2E5BFF]" /> Artist Radio
                    </button>
                    <button className="glass-dark border border-white/10 text-white px-8 lg:px-10 py-3.5 lg:py-4 rounded-2xl font-black hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-sm lg:text-base flex items-center gap-3 group">
                      <UserPlus size={20} className="group-hover:text-[#2E5BFF] transition-colors" /> Follow
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
                <div className="lg:col-span-3 space-y-16">
                  {/* Featured Releases Section */}
                  {!isLoading && artistTracks.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black tracking-tight">Featured Releases</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                        {artistTracks.slice(0, 8).map((song) => (
                          <div 
                            key={`featured-${song.id}`}
                            onClick={() => playSong(song)}
                            className="flex-shrink-0 w-56 space-y-4 group cursor-pointer snap-start"
                          >
                            <div className="relative aspect-square rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
                              <img 
                                src={song.thumbnail} 
                                alt={song.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                <div className="w-14 h-14 bg-[#2E5BFF] rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-xl">
                                  <Play fill="white" className="text-white ml-1" size={28} />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1 px-1">
                              <h4 className="font-bold truncate text-base group-hover:text-[#2E5BFF] transition-colors">{song.title}</h4>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Official Release</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-black tracking-tight">Popular Tracks</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {isLoading ? (
                        <div className="col-span-full py-20 text-center">
                          <div className="w-12 h-12 border-4 border-[#2E5BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(46,91,255,0.4)]" />
                          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Synchronizing Tracks...</p>
                        </div>
                      ) : artistTracks.map((song, idx) => (
                        <SongRow key={song.id} song={song} index={idx} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-black tracking-tight">Related Artists</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {relatedArtists.length > 0 ? relatedArtists.map((artist) => (
                        <button
                          key={artist}
                          onClick={() => fetchArtistProfile(artist)}
                          className="w-full text-left p-4 rounded-2xl glass-dark border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-4 group"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/5">
                            <User size={24} className="text-white/20 group-hover:text-[#2E5BFF] transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold block truncate group-hover:text-[#2E5BFF] transition-colors">{artist}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Artist</span>
                          </div>
                          <ChevronRight size={18} className="text-white/10 group-hover:text-[#2E5BFF] group-hover:translate-x-1 transition-all" />
                        </button>
                      )) : (
                        <div className="p-8 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                          <Users size={24} className="text-white/10" />
                          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No Related Artists</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl glass-dark border border-white/5 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#2E5BFF]">Artist Insight</h4>
                    <p className="text-xs text-white/40 leading-relaxed italic">
                      "Music is the universal language of mankind." - This artist continues to push boundaries and redefine their sound with every release.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Spotify Liked Songs View */}
          {activeView === 'spotify-liked' && (
            <section className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-[#1DB954] to-[#05070a] rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-[#1DB954] flex items-center justify-center">
                    <Heart size={60} fill="white" className="lg:w-20 lg:h-20 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Spotify Collection</p>
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">Liked Songs</h2>
                  <p className="text-white/60 max-w-xl text-sm lg:text-base">All the tracks you've liked on Spotify, now available for offline download.</p>
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={() => spotifyLikedTracks.length > 0 && playSpotifyTrack(spotifyLikedTracks[0].track)}
                      className="bg-[#1DB954] text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#1ed760] transition-all shadow-xl shadow-[#1DB954]/20 text-sm lg:text-base"
                    >
                      <Play fill="white" size={20} /> Play on Spotify
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {spotifyLikedTracks.map(({ track }, idx) => (
                  <div 
                    key={track.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => playSpotifyTrack(track)}
                  >
                    <span className="w-8 text-center text-white/20 font-mono text-sm group-hover:text-[#1DB954]">{idx + 1}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                      <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{track.name}</h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchArtistProfile(track.artists.map((a: any) => a.name).join(', '));
                        }}
                        className="text-sm text-white/40 truncate hover:text-[#1DB954] transition-colors cursor-pointer"
                      >
                        {track.artists.map((a: any) => a.name).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const song = {
                            id: track.id,
                            title: track.name,
                            artist: track.artists.map((a: any) => a.name).join(', '),
                            thumbnail: track.album.images[0].url,
                            uri: track.uri
                          };
                          downloadSong(song);
                        }}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          downloadedSongs.find(s => s.id === track.id) ? "text-green-500" : "text-white/20 hover:text-white"
                        )}
                      >
                        {downloadProgress[track.id] !== undefined ? (
                          <div className="relative w-5 h-5">
                            <svg className="w-full h-full" viewBox="0 0 24 24">
                              <circle className="text-white/20" strokeWidth="2" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                              <circle className="text-white" strokeWidth="2" strokeDasharray={62.8} strokeDashoffset={62.8 - (62.8 * downloadProgress[track.id]) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                            </svg>
                          </div>
                        ) : downloadedSongs.find(s => s.id === track.id) ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Download size={20} />
                        )}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToAddToPlaylist({
                            id: track.id,
                            title: track.name,
                            artist: track.artists.map((a: any) => a.name).join(', '),
                            thumbnail: track.album.images[0].url,
                            uri: track.uri
                          });
                        }}
                        className="p-2 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* YouTube Library View */}
          {activeView === 'youtube-library' && (
            <section className="space-y-12">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-[#FF0000] to-[#05070a] rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0">
                  <Youtube size={60} className="lg:w-20 lg:h-20 text-white/20" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">YouTube Music</p>
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">Your Library</h2>
                  <p className="text-white/60 max-w-xl text-sm lg:text-base">Explore your YouTube playlists and liked videos.</p>
                </div>
              </div>

              {/* Liked Videos Section */}
              {youtubeLikedVideos.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Heart fill="#FF0000" className="text-[#FF0000]" /> Liked Videos
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {youtubeLikedVideos.map((song) => (
                      <SongRow key={song.id} song={song} />
                    ))}
                  </div>
                </div>
              )}

              {/* Playlists Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Library className="text-[#FF0000]" /> Your Playlists
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {youtubePlaylists.map((playlist) => (
                    <div 
                      key={playlist.id}
                      onClick={() => {
                        setActiveYoutubePlaylist(playlist);
                        fetchYoutubePlaylistTracks(playlist.id);
                        setActiveView('youtube-playlist');
                      }}
                      className="group cursor-pointer space-y-3"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                        {playlist.snippet?.thumbnails?.high?.url ? (
                          <img src={playlist.snippet.thumbnails.high.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <Youtube size={40} className="text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Play fill="white" size={24} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold truncate group-hover:text-[#FF0000] transition-colors">{playlist.snippet?.title || "Untitled Playlist"}</h4>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{playlist.contentDetails?.itemCount || 0} tracks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* YouTube Playlist View */}
          {activeView === 'youtube-playlist' && activeYoutubePlaylist && (
            <section className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-[#FF0000] to-[#05070a] rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0">
                  {activeYoutubePlaylist.snippet?.thumbnails?.high?.url ? (
                    <img src={activeYoutubePlaylist.snippet.thumbnails.high.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Youtube size={60} className="lg:w-20 lg:h-20 text-white/20" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">YouTube Music Playlist</p>
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">{activeYoutubePlaylist.snippet?.title || "Untitled Playlist"}</h2>
                  <p className="text-white/60 max-w-xl text-sm lg:text-base">{activeYoutubePlaylist.snippet?.description || `A collection of tracks from YouTube Music`}</p>
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={() => activeYoutubePlaylistTracks.length > 0 && playSong(activeYoutubePlaylistTracks[0])}
                      className="bg-[#FF0000] text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#ff1a1a] transition-all shadow-xl shadow-[#FF0000]/20 text-sm lg:text-base"
                    >
                      <Play fill="white" size={20} /> Play on YouTube
                    </button>
                    <button 
                      onClick={() => {
                        const newPlaylist: Playlist = {
                          id: `yt-${activeYoutubePlaylist.id}-${Date.now()}`,
                          name: activeYoutubePlaylist.snippet.title,
                          songs: activeYoutubePlaylistTracks,
                          createdAt: new Date().toISOString()
                        };
                        setPlaylists([...playlists, newPlaylist]);
                        setActivePlaylistId(newPlaylist.id);
                        setActiveView('home');
                      }}
                      className="bg-white/5 text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10 text-sm lg:text-base"
                    >
                      <Download size={20} /> Migrate to musicfree
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {activeYoutubePlaylistTracks.map((song, idx) => (
                  <div 
                    key={song.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => playSong(song)}
                  >
                    <span className="w-8 text-center text-white/20 font-mono text-sm group-hover:text-[#FF0000]">{idx + 1}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{song.title}</h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchArtistProfile(song.artist);
                        }}
                        className="text-sm text-white/40 truncate hover:text-[#FF0000] transition-colors cursor-pointer"
                      >
                        {song.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSong(song);
                        }}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          downloadedSongs.find(s => s.id === song.id) ? "text-green-500" : "text-white/20 hover:text-white"
                        )}
                      >
                        {downloadProgress[song.id] !== undefined ? (
                          <div className="relative w-5 h-5">
                            <svg className="w-full h-full" viewBox="0 0 24 24">
                              <circle className="text-white/20" strokeWidth="2" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                              <circle className="text-white" strokeWidth="2" strokeDasharray={62.8} strokeDashoffset={62.8 - (62.8 * downloadProgress[song.id]) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                            </svg>
                          </div>
                        ) : downloadedSongs.find(s => s.id === song.id) ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Download size={20} />
                        )}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToAddToPlaylist(song);
                        }}
                        className="p-2 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Spotify Playlist View */}
          {activeView === 'spotify-playlist' && activeSpotifyPlaylist && (
            <section className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-[#1DB954] to-[#05070a] rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0">
                  {activeSpotifyPlaylist.images?.[0]?.url ? (
                    <img src={activeSpotifyPlaylist.images[0].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Music2 size={60} className="lg:w-20 lg:h-20 text-white/20" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Spotify Playlist</p>
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">{activeSpotifyPlaylist.name}</h2>
                  <p className="text-white/60 max-w-xl text-sm lg:text-base">{activeSpotifyPlaylist.description || `A collection of tracks from ${activeSpotifyPlaylist.owner?.display_name || 'Spotify'}`}</p>
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={() => activeSpotifyPlaylistTracks.length > 0 && playSpotifyTrack(activeSpotifyPlaylistTracks[0].track)}
                      className="bg-[#1DB954] text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#1ed760] transition-all shadow-xl shadow-[#1DB954]/20 text-sm lg:text-base"
                    >
                      <Play fill="white" size={20} /> Play on Spotify
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {activeSpotifyPlaylistTracks.map(({ track }, idx) => (
                  <div 
                    key={track.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => playSpotifyTrack(track)}
                  >
                    <span className="w-8 text-center text-white/20 font-mono text-sm group-hover:text-[#1DB954]">{idx + 1}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                      <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{track.name}</h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchArtistProfile(track.artists.map((a: any) => a.name).join(', '));
                        }}
                        className="text-sm text-white/40 truncate hover:text-[#1DB954] transition-colors cursor-pointer"
                      >
                        {track.artists.map((a: any) => a.name).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const song = {
                            id: track.id,
                            title: track.name,
                            artist: track.artists.map((a: any) => a.name).join(', '),
                            thumbnail: track.album.images[0].url,
                            uri: track.uri
                          };
                          downloadSong(song);
                        }}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          downloadedSongs.find(s => s.id === track.id) ? "text-green-500" : "text-white/20 hover:text-white"
                        )}
                      >
                        {downloadProgress[track.id] !== undefined ? (
                          <div className="relative w-5 h-5">
                            <svg className="w-full h-full" viewBox="0 0 24 24">
                              <circle className="text-white/20" strokeWidth="2" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                              <circle className="text-white" strokeWidth="2" strokeDasharray={62.8} strokeDashoffset={62.8 - (62.8 * downloadProgress[track.id]) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                            </svg>
                          </div>
                        ) : downloadedSongs.find(s => s.id === track.id) ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Download size={20} />
                        )}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToAddToPlaylist({
                            id: track.id,
                            title: track.name,
                            artist: track.artists.map((a: any) => a.name).join(', '),
                            thumbnail: track.album.images[0].url,
                            uri: track.uri
                          });
                        }}
                        className="p-2 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Downloads View */}
          {activePlaylistId === 'downloads' && (
            <section className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-[#2E5BFF] to-[#0a1a3a] rounded-3xl flex items-center justify-center shadow-2xl relative flex-shrink-0">
                  <Download size={60} className="lg:w-20 lg:h-20 text-white/20" />
                  <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    Offline
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Collection</p>
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">Downloads</h2>
                  <p className="text-white/60 max-w-xl text-sm lg:text-base">Your offline library. These songs are stored locally and can be played without an internet connection.</p>
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={() => downloadedSongs.length > 0 && playSong(downloadedSongs[0])}
                      className="bg-[#2E5BFF] text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#4D75FF] transition-all shadow-xl shadow-[#2E5BFF]/20 text-sm lg:text-base"
                    >
                      <Play fill="white" size={20} /> Play Offline
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {downloadedSongs.map((song, idx) => (
                  <div 
                    key={song.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => playSong(song)}
                  >
                    <span className="w-8 text-center text-white/20 font-mono text-sm group-hover:text-[#2E5BFF]">{idx + 1}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{song.title}</h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchArtistProfile(song.artist);
                        }}
                        className="text-sm text-white/40 truncate hover:text-[#2E5BFF] transition-colors cursor-pointer"
                      >
                        {song.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Cached
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDownloadedSong(song.id);
                        }}
                        className="p-2 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {downloadedSongs.length === 0 && (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                      <CloudOff size={40} />
                    </div>
                    <p className="text-white/40">No offline songs yet. Click the download icon on any song to save it.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Stats View */}
          {activeView === 'stats' && <StatsView />}

          {/* History View */}
          {activeView === 'history' && <HistoryView />}

          {/* Profile View */}
          {activeView === 'profile' && !activePlaylistId && (
            <section className="space-y-12">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 text-center lg:text-left">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-tr from-[#2E5BFF] to-[#0a1a3a] border-4 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden mx-auto lg:mx-0">
                  {spotifyUser?.images?.[0]?.url ? (
                    <img src={spotifyUser.images[0].url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={60} className="lg:w-20 lg:h-20 text-white/20" />
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl lg:text-5xl font-black tracking-tighter">{spotifyUser?.display_name || 'musicfree User'}</h2>
                  <p className="text-white/40 font-medium text-sm lg:text-base">{spotifyUser?.email || 'gabrysiacichoszewska12@gmail.com'}</p>
                  <div className="flex justify-center lg:justify-start gap-4 pt-4">
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs lg:text-sm">
                      <span className="text-[#2E5BFF] font-bold">{playlists.length}</span> Playlists
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs lg:text-sm">
                      <span className="text-[#2E5BFF] font-bold">{history.length}</span> Recent Tracks
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <History className="text-[#2E5BFF]" size={24} />
                    <h3 className="text-2xl font-bold tracking-tight">Listening History</h3>
                  </div>
                  <div className="space-y-2">
                    {history.length > 0 ? (
                      history.map((song, idx) => (
                        <div key={`${song.id}-${idx}`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate text-sm">{song.title}</h4>
                            <p className="text-xs text-white/40 truncate">{song.artist}</p>
                          </div>
                          <button 
                            onClick={() => song.uri ? playSpotifyTrack(song) : playSong(song)}
                            className="p-2 text-white/20 hover:text-[#2E5BFF] opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/20 italic text-sm py-4">No history yet. Start listening!</p>
                    )}
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Music className="text-[#2E5BFF]" size={24} />
                      <h3 className="text-2xl font-bold tracking-tight">Favorite Genres</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Lofi', 'Synthwave', 'Ambient', 'Jazz', 'Electronic'].map(genre => (
                        <div key={genre} className="px-4 py-2 bg-[#2E5BFF]/10 border border-[#2E5BFF]/20 rounded-full text-sm font-bold text-[#2E5BFF]">
                          {genre}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Settings className="text-[#2E5BFF]" size={24} />
                      <h3 className="text-2xl font-bold tracking-tight">Account Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954]">
                            <Music2 size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">Spotify</h4>
                            <p className="text-xs text-white/40">{spotifyUser ? `Connected as ${spotifyUser.display_name}` : 'Not connected'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={spotifyUser ? handleSpotifyLogout : handleSpotifyLogin}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                            spotifyUser ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-[#1DB954] text-white hover:bg-[#1ed760]"
                          )}
                        >
                          {spotifyUser ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000]">
                            <Youtube size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">YouTube Music</h4>
                            <p className="text-xs text-white/40">{youtubeUser ? `Connected as ${youtubeUser.name}` : 'Not connected'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={youtubeUser ? handleYoutubeLogout : handleYoutubeLogin}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                            youtubeUser ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-[#FF0000] text-white hover:bg-[#ff1a1a]"
                          )}
                        >
                          {youtubeUser ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#2E5BFF]/10 flex items-center justify-center text-[#2E5BFF]">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">Cloud Sync (Firebase)</h4>
                            <p className="text-xs text-white/40">{user ? `Synced as ${user.email}` : 'Not synced'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => user ? signOut(auth) : signInWithPopup(auth, googleProvider)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                            user ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-[#2E5BFF] text-white hover:bg-[#4D75FF]"
                          )}
                        >
                          {user ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">High Quality Audio</h4>
                          <p className="text-xs text-white/40">Stream at 320kbps for better sound</p>
                        </div>
                        <div className="w-12 h-6 bg-[#2E5BFF] rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">Public Profile</h4>
                          <p className="text-xs text-white/40">Allow others to see your playlists</p>
                        </div>
                        <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full shadow-sm" />
                        </div>
                      </div>
                      <button className="w-full py-3 rounded-xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500/10 transition-all">
                        Sign Out
                      </button>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#2E5BFF]/10 flex items-center justify-center text-[#2E5BFF]">
                            <Globe size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">Public Profile</h4>
                            <p className="text-xs text-white/40">{publicProfile?.isPublic ? 'Visible to community' : 'Private'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={togglePublicProfile}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                            publicProfile?.isPublic ? "bg-green-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {publicProfile?.isPublic ? 'Public' : 'Go Public'}
                        </button>
                      </div>

                      {publicProfile?.isPublic && (
                        <div className="p-6 bg-[#2E5BFF]/5 rounded-3xl border border-[#2E5BFF]/20 space-y-4 animate-in slide-in-from-top-4 duration-300">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-[#2E5BFF]">Profile Details</h4>
                            <Edit3 size={16} className="text-[#2E5BFF]" />
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-white/20">Bio</label>
                              <textarea 
                                value={publicProfile.bio || ''}
                                onChange={(e) => updatePublicProfile({ bio: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#2E5BFF] transition-colors resize-none h-20"
                                placeholder="Tell the community about your musical taste..."
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-white/20">Top Genres (comma separated)</label>
                              <input 
                                type="text"
                                value={publicProfile.topGenres?.join(', ') || ''}
                                onChange={(e) => updatePublicProfile({ topGenres: e.target.value.split(',').map((g: string) => g.trim()).filter(Boolean) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#2E5BFF] transition-colors"
                                placeholder="Lofi, Jazz, Rock..."
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div className="space-y-1">
                                <p className="text-sm font-bold">Public Listening History</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Show your recent tracks to the community</p>
                              </div>
                              <button 
                                onClick={() => updatePublicProfile({ isHistoryPublic: !publicProfile.isHistoryPublic })}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-all relative",
                                  publicProfile.isHistoryPublic ? "bg-[#2E5BFF]" : "bg-white/10"
                                )}
                              >
                                <motion.div 
                                  animate={{ x: publicProfile.isHistoryPublic ? 24 : 4 }}
                                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Community View */}
          {activeView === 'community' && !selectedProfileUid && (
            <CommunityView 
              profiles={communityProfiles} 
              onProfileClick={(uid) => setSelectedProfileUid(uid)} 
            />
          )}

          {/* User Profile View */}
          {activeView === 'community' && selectedProfileUid && (
            <UserProfileView 
              profile={communityProfiles.find(p => p.uid === selectedProfileUid)} 
              onBack={() => setSelectedProfileUid(null)} 
              onPlaySong={playSong}
            />
          )}

          {/* Active Playlist View */}
          {activePlaylistId && (
            <section className="space-y-6">
              {(() => {
                const playlist = playlists.find(p => p.id === activePlaylistId);
                if (!playlist) return null;
                return (
                  <>
                    <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                      <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-[#2E5BFF] to-[#0a1a3a] rounded-3xl flex items-center justify-center shadow-2xl flex-shrink-0 mx-auto lg:mx-0">
                        <Music2 size={60} className="lg:w-20 lg:h-20 text-white/20" />
                      </div>
                      <div className="flex-1 space-y-2 text-center lg:text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                          {playlist.type === 'radio' ? 'Artist Radio' : playlist.isDynamic ? 'Dynamic Playlist' : 'Playlist'}
                        </p>
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">{playlist.name}</h2>
                          {playlist.isDynamic && (
                            <div className="px-2 py-1 bg-[#2E5BFF]/10 text-[#2E5BFF] rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                              <Sparkles size={12} /> {playlist.refreshInterval}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                          <button 
                            onClick={() => playlist.songs.length > 0 && (playlist.songs[0].uri ? playSpotifyTrack(playlist.songs[0]) : playSong(playlist.songs[0]))}
                            className="bg-[#2E5BFF] text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#4D75FF] transition-all shadow-xl shadow-[#2E5BFF]/20 text-sm lg:text-base"
                          >
                            <Play fill="white" size={20} /> Play All
                          </button>
                          {(playlist.isDynamic || playlist.type === 'radio') && (
                            <button 
                              onClick={() => refreshDynamicPlaylist(playlist)}
                              disabled={isLoading}
                              className="p-2.5 lg:p-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-full transition-all disabled:opacity-50"
                              title="Refresh Playlist"
                            >
                              <RotateCw size={24} className={isLoading ? "animate-spin" : ""} />
                            </button>
                          )}
                          <button 
                            onClick={() => deletePlaylist(playlist.id)}
                            className="p-2.5 lg:p-3 hover:bg-red-500/10 text-white/40 hover:text-red-500 rounded-full transition-all"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {playlist.songs.map((song, idx) => (
                        <div 
                          key={song.id}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer"
                          onClick={() => song.uri ? playSpotifyTrack(song) : playSong(song)}
                        >
                          <span className="w-8 text-center text-white/20 font-mono text-sm group-hover:text-[#2E5BFF]">{idx + 1}</span>
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate">{song.title}</h4>
                            <p 
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchArtistProfile(song.artist);
                              }}
                              className="text-sm text-white/40 truncate hover:text-[#2E5BFF] transition-colors cursor-pointer"
                            >
                              {song.artist}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromPlaylist(playlist.id, song.id);
                            }}
                            className="p-2 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      {playlist.songs.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                            <Plus size={40} />
                          </div>
                          <p className="text-white/40">This playlist is empty. Add some songs!</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </section>
          )}

          {/* Spotify Favorites */}
          {activeView === 'home' && !activePlaylistId && spotifyUser && spotifyLikedTracks.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1DB954] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(29,185,84,0.3)]">
                    <Heart className="text-white" size={20} fill="white" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Spotify Favorites</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {spotifyLikedTracks.slice(0, 5).map(({ track }) => (
                  <motion.div 
                    key={track.id}
                    whileHover={{ y: -8 }}
                    onClick={() => playSpotifyTrack(track)}
                    className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                      <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            playSpotifyTrack(track);
                          }}
                          className="w-12 h-12 bg-[#2E5BFF] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                        >
                          <Play size={24} fill="white" className="text-white ml-1" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const song = {
                              id: track.id,
                              title: track.name,
                              artist: track.artists.map((a: any) => a.name).join(', '),
                              thumbnail: track.album.images[0].url,
                              uri: track.uri
                            };
                            downloadSong(song);
                          }}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all",
                            downloadedSongs.find(s => s.id === track.id) 
                              ? "bg-green-500 text-white" 
                              : "bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
                          )}
                        >
                          {downloadProgress[track.id] !== undefined ? (
                            <div className="relative w-6 h-6">
                              <svg className="w-full h-full" viewBox="0 0 24 24">
                                <circle className="text-white/20" strokeWidth="2" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                                <circle className="text-white" strokeWidth="2" strokeDasharray={62.8} strokeDashoffset={62.8 - (62.8 * downloadProgress[track.id]) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                              </svg>
                            </div>
                          ) : downloadedSongs.find(s => s.id === track.id) ? (
                            <CheckCircle2 size={24} />
                          ) : (
                            <Download size={24} />
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSongToAddToPlaylist({
                              id: track.id,
                              title: track.name,
                              artist: track.artists.map((a: any) => a.name).join(', '),
                              thumbnail: track.album.images[0].url,
                              uri: track.uri
                            });
                          }}
                          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white/20 transition-all"
                        >
                          <Plus size={24} className="text-white" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold truncate text-sm">{track.name}</h4>
                    <p className="text-xs text-white/40 truncate">{track.artists.map((a: any) => a.name).join(', ')}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Hero Section */}
          {activeView === 'home' && !activePlaylistId && (
            <section className="relative h-[350px] lg:h-[500px] rounded-[40px] lg:rounded-[56px] overflow-hidden group shadow-2xl mx-2 lg:mx-0">
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                src={currentSong.thumbnail} 
                alt={currentSong.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#05070a]/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 lg:bottom-12 left-6 lg:left-12 right-6 lg:right-12 space-y-2 lg:space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#2E5BFF] text-white text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-[#2E5BFF]/40">
                    Featured
                  </div>
                  <div className="flex items-center gap-2 text-[#2E5BFF] font-bold text-[8px] lg:text-[10px] uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full animate-pulse" />
                    Now Playing
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl lg:text-8xl font-black tracking-tighter leading-[0.8] text-glow drop-shadow-2xl">
                    {currentSong.title}
                  </h2>
                  <p className="text-white/80 text-lg lg:text-3xl font-medium italic serif tracking-tight">
                    by {currentSong.artist}
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <button 
                    onClick={() => playSong(currentSong)}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black text-sm lg:text-base hover:scale-105 transition-all shadow-2xl shadow-white/10"
                  >
                    <Play size={20} fill="black" /> Play Now
                  </button>
                  <button 
                    onClick={() => addToQueue(currentSong)}
                    className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-black text-sm lg:text-base hover:bg-white/20 transition-all"
                  >
                    <Plus size={20} /> Add to Queue
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Recommended for You */}
          {activeView === 'home' && !activePlaylistId && homeRecommendations.length > 0 && (
            <section className="space-y-8 pt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2E5BFF] to-[#8A2BE2] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#2E5BFF]/20">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Recommended for You</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">AI-curated based on your taste</p>
                  </div>
                </div>
                <button 
                  onClick={() => fetchYouTubeFeatured()}
                  className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <RotateCw size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {homeRecommendations.map((song) => (
                  <motion.div 
                    key={song.id}
                    whileHover={{ y: -10 }}
                    onClick={() => playSong(song)}
                    className="bg-white/5 p-5 rounded-[32px] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative shadow-lg">
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                        <div className="w-14 h-14 bg-[#2E5BFF] rounded-full flex items-center justify-center shadow-xl shadow-[#2E5BFF]/40 scale-75 group-hover:scale-100 transition-transform">
                          <Play size={28} fill="white" className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-black truncate text-base tracking-tight mb-1">{song.title}</h4>
                    <p className="text-xs font-bold text-white/40 truncate uppercase tracking-widest">{song.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Spotify Featured Playlists */}
          {activeView === 'home' && !activePlaylistId && spotifyUser && spotifyFeaturedPlaylists.length > 0 && (
            <section className="space-y-6 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1DB954] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#1DB954]/20">
                    <ListMusic size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Spotify Featured</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Editor's picks from Spotify</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {spotifyFeaturedPlaylists.map((playlist: any) => (
                  <motion.div 
                    key={playlist.id}
                    whileHover={{ y: -8 }}
                    onClick={() => {
                      setActiveSpotifyPlaylist(playlist);
                      setActiveView('spotify-playlist');
                      fetchSpotifyPlaylistTracks(playlist);
                    }}
                    className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                      <img src={playlist.images[0]?.url} alt={playlist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={32} fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                    <h4 className="font-bold truncate text-sm">{playlist.name}</h4>
                    <p className="text-xs text-white/40 truncate">{playlist.owner.display_name}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Spotify Made For You */}
          {activeView === 'home' && !activePlaylistId && spotifyUser && spotifyMadeForYou.length > 0 && (
            <section className="space-y-6 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1DB954] to-[#191414] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#1DB954]/20">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Made For You</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Personalized Spotify mixes</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {spotifyMadeForYou.map((playlist: any) => (
                  <motion.div 
                    key={playlist.id}
                    whileHover={{ y: -8 }}
                    onClick={() => {
                      setActiveSpotifyPlaylist(playlist);
                      setActiveView('spotify-playlist');
                      fetchSpotifyPlaylistTracks(playlist);
                    }}
                    className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                      <img src={playlist.images[0]?.url} alt={playlist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={32} fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                    <h4 className="font-bold truncate text-sm">{playlist.name}</h4>
                    <p className="text-xs text-white/40 truncate">Spotify</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Spotify Top Artists */}
          {activeView === 'home' && !activePlaylistId && spotifyUser && spotifyTopArtists.length > 0 && (
            <section className="space-y-6 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#191414] rounded-2xl flex items-center justify-center text-[#1DB954] border border-[#1DB954]/20 shadow-lg">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Your Top Artists</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Artists you listen to most</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {spotifyTopArtists.map((artist: any) => (
                  <motion.div 
                    key={artist.id}
                    whileHover={{ y: -8 }}
                    onClick={() => fetchArtistProfile(artist.name)}
                    className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group text-center"
                  >
                    <div className="aspect-square rounded-full overflow-hidden mb-4 relative border-2 border-white/5 group-hover:border-[#1DB954]/50 transition-colors">
                      <img src={artist.images[0]?.url} alt={artist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <h4 className="font-bold truncate text-sm">{artist.name}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">{artist.genres[0] || 'Artist'}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Spotify New Releases */}
          {activeView === 'home' && !activePlaylistId && spotifyUser && spotifyNewReleases.length > 0 && (
            <section className="space-y-6 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2E5BFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#2E5BFF]/20">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">New Releases</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Fresh drops on Spotify</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {spotifyNewReleases.map((album: any) => (
                  <motion.div 
                    key={album.id}
                    whileHover={{ y: -8 }}
                    onClick={() => {
                      const query = `${album.name} ${album.artists.map((a: any) => a.name).join(' ')}`;
                      performSearch(query);
                    }}
                    className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                      <img src={album.images[0]?.url} alt={album.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={32} fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                    <h4 className="font-bold truncate text-sm">{album.name}</h4>
                    <p className="text-xs text-white/40 truncate">{album.artists.map((a: any) => a.name).join(', ')}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Spotify Global Top 50 */}
          {activeView === 'home' && !activePlaylistId && spotifyUser && spotifyTopTracks.length > 0 && (
            <section className="space-y-6 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Music2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Global Top 50</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">The world's most played tracks</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {spotifyTopTracks.map(({ track }: any) => (
                  <motion.div 
                    key={track.id}
                    whileHover={{ y: -8 }}
                    onClick={() => playSpotifyTrack(track)}
                    className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                      <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={32} fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                    <h4 className="font-bold truncate text-sm">{track.name}</h4>
                    <p className="text-xs text-white/40 truncate">{track.artists.map((a: any) => a.name).join(', ')}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* YouTube Trending */}
          {activeView === 'home' && !activePlaylistId && youtubeFeatured.length > 0 && (
            <section className="space-y-6 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                    <Music size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">YouTube Trending</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Global hits on YouTube</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {youtubeFeatured.map((song) => (
                  <motion.div 
                    key={song.id}
                    whileHover={{ y: -8 }}
                    onClick={() => playSong(song)}
                    className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={32} fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                    <h4 className="font-bold truncate text-sm">{song.title}</h4>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* YouTube Playlists Section */}
          {activeView === 'home' && !activePlaylistId && youtubePlaylists.length > 0 && (
            <section className="space-y-8 pt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/20">
                    <Youtube size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">YouTube Mixes</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Popular collections on YouTube Music</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubePlaylists.slice(0, 6).map((playlist) => (
                  <motion.div 
                    key={playlist.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setActiveYoutubePlaylist(playlist);
                      setActiveView('youtube-playlist');
                      fetchYoutubePlaylistTracks(playlist);
                    }}
                    className="flex gap-5 p-5 rounded-[32px] glass hover:bg-white/10 border border-white/5 hover:border-red-600/30 transition-all cursor-pointer group"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg relative">
                      <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ListMusic size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-black text-lg truncate tracking-tight mb-1 group-hover:text-red-600 transition-colors">{playlist.name}</h4>
                      <p className="text-xs font-medium text-white/40 line-clamp-2 leading-relaxed">{playlist.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Moods & Genres Section */}
          {activeView === 'home' && !activePlaylistId && (
            <section className="space-y-8 pt-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#2E5BFF] border border-white/10">
                  <LayoutGrid size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter">Moods & Genres</h3>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Find the perfect sound for any moment</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Chill', color: 'bg-blue-500', icon: <Wind size={20} /> },
                  { name: 'Energy', color: 'bg-orange-500', icon: <Zap size={20} /> },
                  { name: 'Focus', color: 'bg-emerald-500', icon: <Target size={20} /> },
                  { name: 'Party', color: 'bg-pink-500', icon: <Users size={20} /> },
                  { name: 'Romance', color: 'bg-red-500', icon: <Heart size={20} /> },
                  { name: 'Sleep', color: 'bg-indigo-500', icon: <Moon size={20} /> },
                ].map((mood) => (
                  <motion.button
                    key={mood.name}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => {
                      setVibe(mood.name);
                      getRecommendations(mood.name);
                    }}
                    className={cn(
                      "h-32 rounded-[32px] p-6 flex flex-col justify-between items-start transition-all shadow-lg group relative overflow-hidden",
                      mood.color
                    )}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
                      {mood.icon}
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl">
                      {mood.icon}
                    </div>
                    <span className="font-black text-xl tracking-tighter">{mood.name}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Queue Section */}
          {activeView === 'home' && !activePlaylistId && (
            <section className="space-y-8 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#2E5BFF] border border-white/10">
                    <ListMusic size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Up Next</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Your YouTube & Spotify queue</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {queue.length > 1 && (
                    <button 
                      onClick={clearQueue}
                      className="px-6 py-2 rounded-full bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Clear Queue
                    </button>
                  )}
                  <button 
                    onClick={() => setIsQueueOpen(true)}
                    className="px-6 py-2 rounded-full bg-[#2E5BFF]/10 text-[#2E5BFF] text-sm font-bold hover:bg-[#2E5BFF]/20 transition-all flex items-center gap-2"
                  >
                    View Full Queue
                  </button>
                </div>
              </div>
              
              <Reorder.Group 
                axis="y" 
                values={queue.filter(s => s.id !== currentSong.id)} 
                onReorder={(newOrder) => {
                  const currentIndex = queue.findIndex(s => s.id === currentSong.id);
                  const newQueue = [...newOrder];
                  if (currentIndex !== -1) {
                    newQueue.splice(currentIndex, 0, currentSong);
                  }
                  setQueue(newQueue);
                }}
                className="space-y-3"
              >
                {queue.filter(s => s.id !== currentSong.id).map((song) => (
                  <Reorder.Item 
                    key={song.id} 
                    value={song}
                    className="flex items-center gap-6 p-4 rounded-3xl glass hover:bg-white/10 border border-white/5 hover:border-[#2E5BFF]/30 transition-all cursor-pointer group"
                  >
                    <div className="text-white/10 group-hover:text-[#2E5BFF] transition-colors">
                      <GripVertical size={20} />
                    </div>
                    <div 
                      onClick={() => playSong(song)}
                      className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 relative flex-shrink-0 shadow-lg"
                    >
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={20} fill="white" className="text-white" />
                      </div>
                    </div>
                    <div 
                      onClick={() => playSong(song)}
                      className="flex-1 min-w-0"
                    >
                      <h4 className="font-black text-lg truncate tracking-tight group-hover:text-[#2E5BFF] transition-colors">{song.title}</h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchArtistProfile(song.artist);
                        }}
                        className="text-xs font-bold text-white/40 truncate hover:text-[#2E5BFF] transition-colors uppercase tracking-widest"
                      >
                        {song.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(song.id);
                        }}
                        className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              
              {queue.length <= 1 && (
                <div className="py-12 text-center glass rounded-[40px] border border-dashed border-white/10">
                  <p className="text-sm text-white/20 italic font-medium">Queue is empty. Search for songs to add them here.</p>
                </div>
              )}
            </section>
          )}

          {/* Featured Mixes */}
          {activeView === 'home' && !activePlaylistId && (
            <section className="space-y-6 lg:space-y-8 pt-8 pb-32">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#2E5BFF] border border-white/10">
                  <History size={20} className="lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tighter">Your Daily Mixes</h3>
                  <p className="text-[10px] lg:text-xs font-bold text-white/40 uppercase tracking-widest">Fresh tracks from YouTube & Spotify</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-8">
                {(youtubeFeatured.length > 0 ? youtubeFeatured : INITIAL_SONGS).slice(0, 5).map((song) => (
                  <motion.div 
                    key={song.id}
                    whileHover={{ y: -10 }}
                    onClick={() => {
                      setCurrentSong(song);
                      setIsPlaying(true);
                    }}
                    className="space-y-4 group cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
                      <img 
                        src={song.thumbnail} 
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#2E5BFF] rounded-full flex items-center justify-center shadow-2xl shadow-[#2E5BFF]/40 transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
                          <Play fill="white" className="text-white ml-1" size={32} />
                        </div>
                      </div>
                    </div>
                    <div className="px-2">
                      <h4 className="font-black text-lg truncate tracking-tight group-hover:text-[#2E5BFF] transition-colors">{song.title}</h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchArtistProfile(song.artist);
                        }}
                        className="text-xs font-bold text-white/40 hover:text-[#2E5BFF] transition-colors cursor-pointer uppercase tracking-widest"
                      >
                        {song.artist}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Player Bar */}
      <motion.footer 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 h-20 lg:h-24 glass border-t border-white/5 px-4 lg:px-8 flex items-center justify-between mx-2 lg:mx-6 mb-2 lg:mb-6 rounded-2xl lg:rounded-3xl shadow-2xl"
      >
        <div className="flex items-center gap-3 lg:gap-4 w-1/2 lg:w-1/3">
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 shadow-lg group relative flex-shrink-0">
            <img 
              src={currentSong.thumbnail} 
              alt={currentSong.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black truncate tracking-tight text-glow text-sm lg:text-base">{currentSong.title}</h4>
            <p 
              onClick={() => fetchArtistProfile(currentSong.artist)}
              className="text-[10px] lg:text-xs font-bold text-[#2E5BFF] truncate hover:text-[#4D75FF] transition-colors cursor-pointer uppercase tracking-widest"
            >
              {currentSong.artist}
            </p>
          </div>
          {playerControls.filter(c => c.position === 'left' && c.visible).map(c => renderControl(c.id))}
          <button 
            onClick={() => setIsCustomizeModalOpen(true)}
            className="hidden sm:block text-white/10 hover:text-white transition-all ml-2"
          >
            <Settings size={14} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 lg:gap-2 w-1/2 lg:w-1/3 relative">
          {showVisualizer && (
            <canvas 
              ref={canvasRef} 
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-full h-12 pointer-events-none opacity-60"
              width={300}
              height={48}
            />
          )}
          <div className="flex items-center gap-4 lg:gap-6">
            {playerControls.filter(c => c.position === 'center' && c.visible).map(c => renderControl(c.id))}
          </div>
          
          <div className="hidden lg:flex items-center gap-3 w-full max-w-md group">
            <span className="text-[10px] font-bold text-white/40 tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = x / rect.width;
                const newTime = percent * duration;
                if (activePlayer === 'youtube' && playerRef.current) {
                  playerRef.current.seekTo(newTime);
                } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
                  spotifyPlayerRef.current.seek(newTime * 1000);
                }
                setCurrentTime(newTime);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-[#2E5BFF] to-[#4D75FF] relative transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-white/40 tabular-nums w-10">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 lg:gap-6 w-1/3">
          <div className="hidden lg:flex items-center gap-6">
            {playerControls.filter(c => c.position === 'right' && c.visible).map(c => renderControl(c.id))}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsQueueOpen(true)}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              <ListMusic size={20} />
            </button>
            <button 
              onClick={() => {
                if (activePlayer === 'youtube' && playerRef.current) {
                  playerRef.current.playVideo();
                } else if (activePlayer === 'spotify' && spotifyPlayerRef.current) {
                  spotifyPlayerRef.current.resume();
                }
              }}
              className="flex items-center gap-2 px-2 lg:px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/60 transition-all border border-white/10"
              title="Click if audio is not playing"
            >
              <Volume2 size={12} /> <span className="hidden sm:inline">Sound Check</span>
            </button>
          </div>
        </div>
      </motion.footer>

      {/* Full Queue Overlay */}
      <AnimatePresence>
        {isQueueOpen && (
            <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[60] w-full md:w-[450px] glass-dark border-l border-white/5 flex flex-col shadow-2xl m-6 rounded-[40px] overflow-hidden"
          >
            <div className="p-8 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#2E5BFF]/10 rounded-xl flex items-center justify-center text-[#2E5BFF]">
                  <ListMusic size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter">Queue</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{queue.length} Tracks</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Autoplay</span>
                  <button 
                    onClick={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
                    className={cn(
                      "w-8 h-4 rounded-full relative transition-all duration-300",
                      isAutoplayEnabled ? "bg-[#2E5BFF]" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300",
                      isAutoplayEnabled ? "left-4.5" : "left-0.5"
                    )} />
                  </button>
                </div>
                <button 
                  onClick={() => setIsQueueOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-all hover:rotate-90 duration-300"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Now Playing</h3>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#2E5BFF]/10 border border-[#2E5BFF]/20">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                      <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-[#2E5BFF]">{currentSong.title}</h4>
                      <p 
                        onClick={() => fetchArtistProfile(currentSong.artist)}
                        className="text-xs text-white/60 truncate hover:text-[#2E5BFF] transition-colors cursor-pointer"
                      >
                        {currentSong.artist}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Next Up</h3>
                    {queue.length > 1 && (
                      <button 
                        onClick={clearQueue}
                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Clear All
                      </button>
                    )}
                  </div>
                  <Reorder.Group 
                    axis="y" 
                    values={queue.filter(s => s.id !== currentSong.id)} 
                    onReorder={(newOrder) => {
                      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
                      const newQueue = [...newOrder];
                      if (currentIndex !== -1) {
                        newQueue.splice(currentIndex, 0, currentSong);
                      }
                      setQueue(newQueue);
                    }}
                    className="space-y-2"
                  >
                    {queue.filter(s => s.id !== currentSong.id).map((song) => (
                      <Reorder.Item 
                        key={song.id} 
                        value={song}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/0 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className="text-white/20 group-hover:text-white/40 transition-colors">
                          <GripVertical size={18} />
                        </div>
                        <div 
                          onClick={() => playSong(song)}
                          className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 relative flex-shrink-0"
                        >
                          <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={16} fill="white" className="text-white" />
                          </div>
                        </div>
                        <div 
                          onClick={() => playSong(song)}
                          className="flex-1 min-w-0"
                        >
                          <h4 className="font-bold truncate text-sm">{song.title}</h4>
                          <p 
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchArtistProfile(song.artist);
                            }}
                            className="text-xs text-white/40 truncate hover:text-[#2E5BFF] transition-colors cursor-pointer"
                          >
                            {song.artist}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(song.id);
                          }}
                          className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isEqualizerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sliders className="text-[#2E5BFF]" size={24} />
                  <h2 className="text-2xl font-bold tracking-tight">Audio Equalizer</h2>
                </div>
                <button onClick={() => setIsEqualizerOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8 py-4">
                <EqSlider 
                  label="Bass" 
                  value={eqSettings.bass} 
                  onChange={(v) => setEqSettings(prev => ({ ...prev, bass: v }))} 
                  color="#2E5BFF"
                />
                <EqSlider 
                  label="Mid Range" 
                  value={eqSettings.mid} 
                  onChange={(v) => setEqSettings(prev => ({ ...prev, mid: v }))} 
                  color="#4D75FF"
                />
                <EqSlider 
                  label="Treble" 
                  value={eqSettings.treble} 
                  onChange={(v) => setEqSettings(prev => ({ ...prev, treble: v }))} 
                  color="#809FFF"
                />
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-white/30 leading-relaxed italic">
                  Note: This is a virtual equalizer interface. Due to browser security restrictions on third-party audio streams (YouTube/Spotify), these settings provide a visual reference for your preferred sound profile.
                </p>
              </div>

              <button 
                onClick={() => setIsEqualizerOpen(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all"
              >
                Close Settings
              </button>
            </motion.div>
          </motion.div>
        )}

        {isCustomizeModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="text-[#2E5BFF]" size={24} />
                  <h2 className="text-2xl font-bold tracking-tight">Customize Player</h2>
                </div>
                <button onClick={() => setIsCustomizeModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Preview</p>
                <div className="p-6 bg-black/40 rounded-[32px] border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 opacity-50 pointer-events-none">
                    {playerControls.filter(c => c.position === 'left' && c.visible).map(c => (
                      <div key={c.id} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl">
                    {playerControls.filter(c => c.position === 'center' && c.visible).map(c => (
                      <div key={c.id} className="w-8 h-8 rounded-lg bg-[#2E5BFF]/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#2E5BFF]" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 opacity-50 pointer-events-none">
                    {playerControls.filter(c => c.position === 'right' && c.visible).map(c => (
                      <div key={c.id} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Controls Layout</p>
                  <span className="text-[10px] text-white/20 italic">Drag to reorder</span>
                </div>
                
                <Reorder.Group 
                  axis="y" 
                  values={playerControls} 
                  onReorder={setPlayerControls}
                  className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide"
                >
                  {playerControls.map((control) => (
                    <Reorder.Item 
                      key={control.id} 
                      value={control}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="text-white/20 group-hover:text-white/40 transition-colors">
                        <GripVertical size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{control.label}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {['left', 'center', 'right'].map((pos) => (
                            <button
                              key={pos}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayerControls(prev => prev.map(c => 
                                  c.id === control.id ? { ...c, position: pos } : c
                                ));
                              }}
                              className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter transition-all",
                                control.position === pos ? "bg-[#2E5BFF] text-white" : "bg-white/5 text-white/20 hover:bg-white/10"
                              )}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayerControls(prev => prev.map(c => 
                            c.id === control.id ? { ...c, visible: !c.visible } : c
                          ));
                        }}
                        className={cn(
                          "w-10 h-5 rounded-full p-0.5 transition-colors relative",
                          control.visible ? "bg-[#2E5BFF]" : "bg-white/10"
                        )}
                      >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full shadow-lg"
                          animate={{ x: control.visible ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => {
                    setPlayerControls([
                      { id: 'shuffle', label: 'Shuffle', visible: true, position: 'center' },
                      { id: 'seekBack', label: 'Back 10s', visible: false, position: 'center' },
                      { id: 'skipBack', label: 'Previous', visible: true, position: 'center' },
                      { id: 'playPause', label: 'Play/Pause', visible: true, position: 'center' },
                      { id: 'skipForward', label: 'Next', visible: true, position: 'center' },
                      { id: 'seekForward', label: 'Forward 10s', visible: false, position: 'center' },
                      { id: 'repeat', label: 'Repeat', visible: true, position: 'center' },
                      { id: 'heart', label: 'Like', visible: true, position: 'right' },
                      { id: 'lyrics', label: 'Lyrics', visible: true, position: 'right' },
                      { id: 'timer', label: 'Sleep Timer', visible: true, position: 'right' },
                      { id: 'queue', label: 'Queue', visible: true, position: 'right' },
                      { id: 'equalizer', label: 'Equalizer', visible: true, position: 'right' },
                      { id: 'party', label: 'Party Mode', visible: true, position: 'right' },
                      { id: 'volume', label: 'Volume', visible: true, position: 'right' },
                    ]);
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  Reset Defaults
                </button>
                <button 
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="flex-1 bg-[#2E5BFF] hover:bg-[#4D75FF] text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-[#2E5BFF]/20"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isCreatePlaylistModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <h2 className="text-2xl font-bold tracking-tight">Create New</h2>
              
              <div className="flex p-1 bg-white/5 rounded-2xl">
                <button 
                  onClick={() => setPlaylistType('playlist')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                    playlistType === 'playlist' ? "bg-[#2E5BFF] text-white" : "text-white/40"
                  )}
                >
                  Playlist
                </button>
                <button 
                  onClick={() => setPlaylistType('radio')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                    playlistType === 'radio' ? "bg-[#2E5BFF] text-white" : "text-white/40"
                  )}
                >
                  Artist Radio
                </button>
              </div>

              {playlistType === 'playlist' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Playlist Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="e.g. Late Night Vibes"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2E5BFF] transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Dynamic Playlist</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Auto-refreshes with new music</p>
                    </div>
                    <button 
                      onClick={() => setIsDynamicPlaylist(!isDynamicPlaylist)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        isDynamicPlaylist ? "bg-[#2E5BFF]" : "bg-white/10"
                      )}
                    >
                      <motion.div 
                        animate={{ x: isDynamicPlaylist ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Public Playlist</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Visible to the community</p>
                    </div>
                    <button 
                      onClick={() => setIsPublicPlaylist(!isPublicPlaylist)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        isPublicPlaylist ? "bg-[#2E5BFF]" : "bg-white/10"
                      )}
                    >
                      <motion.div 
                        animate={{ x: isPublicPlaylist ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>

                  {isDynamicPlaylist && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Refresh Interval</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['daily', 'weekly', 'monthly'] as const).map((interval) => (
                          <button
                            key={interval}
                            onClick={() => setPlaylistRefreshInterval(interval)}
                            className={cn(
                              "py-2 rounded-xl text-xs font-bold border transition-all capitalize",
                              playlistRefreshInterval === interval 
                                ? "bg-[#2E5BFF]/10 border-[#2E5BFF] text-[#2E5BFF]" 
                                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                            )}
                          >
                            {interval}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Artist Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={artistRadioName}
                      onChange={(e) => setArtistRadioName(e.target.value)}
                      placeholder="e.g. Radiohead"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2E5BFF] transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                    We'll create a dynamic radio station based on this artist that refreshes weekly.
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsCreatePlaylistModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={createPlaylist}
                  disabled={isLoading}
                  className="flex-1 bg-[#2E5BFF] text-white py-3 rounded-xl font-bold hover:bg-[#4D75FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    playlistType === 'playlist' ? 'Create Playlist' : 'Create Radio'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isLyricsOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl max-h-[80vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setIsLyricsOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-4 mb-8">
                <img src={currentSong.thumbnail} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{currentSong.title}</h2>
                  <p className="text-[#2E5BFF] font-bold uppercase tracking-widest text-xs">{currentSong.artist}</p>
                </div>
              </div>
              <div className="whitespace-pre-line text-xl lg:text-2xl font-bold leading-relaxed text-white/80">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-8 bg-white/5 rounded w-3/4 animate-pulse" />
                    <div className="h-8 bg-white/5 rounded w-1/2 animate-pulse" />
                    <div className="h-8 bg-white/5 rounded w-2/3 animate-pulse" />
                  </div>
                ) : lyrics}
              </div>
            </motion.div>
          </motion.div>
        )}

        {isSleepTimerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Sleep Timer</h2>
                <button onClick={() => setIsSleepTimerOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[15, 30, 45, 60].map(mins => (
                  <button 
                    key={mins}
                    onClick={() => {
                      setSleepTimer(mins);
                      setIsSleepTimerOpen(false);
                    }}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-[#2E5BFF] transition-all font-bold"
                  >
                    {mins} min
                  </button>
                ))}
              </div>
              {sleepTimer && (
                <button 
                  onClick={() => setSleepTimer(null)}
                  className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all"
                >
                  Cancel Timer ({Math.ceil(sleepTimer)}m left)
                </button>
              )}
            </motion.div>
          </motion.div>
        )}

        {isPartyModeOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="text-[#2E5BFF]" size={24} />
                  <h2 className="text-2xl font-bold tracking-tight">Party Mode</h2>
                </div>
                <button onClick={() => setIsPartyModeOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>

              {!partyRoomId ? (
                <div className="space-y-4">
                  <button 
                    onClick={startParty}
                    className="w-full py-4 rounded-2xl bg-[#2E5BFF] text-white font-bold hover:bg-[#4D75FF] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Start New Party
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                    <div className="relative flex justify-center text-xs uppercase font-bold text-white/20 bg-[#1a1a1a] px-2">Or join one</div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Room ID"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2E5BFF]"
                      onKeyDown={(e) => e.key === 'Enter' && joinParty((e.target as HTMLInputElement).value)}
                    />
                    <button className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-[#2E5BFF]/10 border border-[#2E5BFF]/20 text-center">
                    <p className="text-xs font-bold text-[#2E5BFF] uppercase tracking-widest mb-1">Room ID</p>
                    <h3 className="text-3xl font-black tracking-widest">{partyRoomId}</h3>
                    <button 
                      onClick={() => navigator.clipboard.writeText(partyRoomId)}
                      className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-1 mx-auto"
                    >
                      <Copy size={12} /> Copy Invite Link
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} /> Party Chat
                    </h4>
                    <div className="h-48 overflow-y-auto space-y-2 pr-2 scrollbar-hide bg-black/20 rounded-2xl p-4 border border-white/5">
                      {partyMessages.length === 0 ? (
                        <p className="text-center text-white/20 text-xs italic py-8">No messages yet. Say hi!</p>
                      ) : (
                        partyMessages.map((m, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-bold text-[#2E5BFF]">{m.user}: </span>
                            <span className="text-white/80">{m.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2E5BFF]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const text = (e.target as HTMLInputElement).value;
                            socket.current.emit("chat-message", { room: partyRoomId, text, user: "Me" });
                            setPartyMessages(prev => [...prev, { text, user: "Me" }]);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setPartyRoomId(null);
                      setPartyMessages([]);
                      setIsPartyModeOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all text-sm"
                  >
                    Leave Party
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {songToAddToPlaylist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Add to Playlist</h2>
                <button onClick={() => setSongToAddToPlaylist(null)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                <img src={songToAddToPlaylist.thumbnail} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{songToAddToPlaylist.title}</h4>
                  <p className="text-xs text-white/40 truncate">{songToAddToPlaylist.artist}</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {playlists.length === 0 ? (
                  <p className="text-center py-8 text-white/40 italic">No playlists yet. Create one first!</p>
                ) : (
                  playlists.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => addToPlaylist(p.id, songToAddToPlaylist)}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#2E5BFF]/10 border border-transparent hover:border-[#2E5BFF]/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {p.type === 'radio' ? <Radio size={16} className="text-[#2E5BFF]" /> : 
                         p.isDynamic ? <Sparkles size={16} className="text-[#2E5BFF]" /> : 
                         <ListMusic size={16} className="text-white/20" />}
                        <span className="font-bold group-hover:text-[#2E5BFF]">{p.name}</span>
                      </div>
                      <Plus size={18} className="text-white/20 group-hover:text-[#2E5BFF]" />
                    </button>
                  ))
                )}
              </div>

              <button 
                onClick={() => {
                  setNewPlaylistName('');
                  setIsCreatePlaylistModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 transition-all"
              >
                <Plus size={20} /> Create New Playlist
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* YouTube Player (Hidden but active) */}
      <div className="fixed -top-[1000px] -left-[1000px] w-[200px] h-[200px] opacity-0 pointer-events-none overflow-hidden">
        <YouTube 
          videoId={currentSong?.id}
          opts={{
            height: '200',
            width: '200',
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              origin: window.location.origin
            },
          }}
          onReady={(e) => {
            playerRef.current = e.target;
            if (isPlaying && activePlayer === 'youtube') e.target.playVideo();
          }}
          onStateChange={(e) => {
            // 1: playing, 2: paused, 0: ended
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2) setIsPlaying(false);
            if (e.data === 0) handleSkipForward();
          }}
          onError={(e) => {
            console.error("YouTube Player Error:", e);
            setError("Playback error. Skipping to next song...");
            setTimeout(handleSkipForward, 2000);
          }}
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, key }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, key?: React.Key }) {
  return (
    <button 
      key={key}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
        active 
          ? "bg-[#2E5BFF] text-white shadow-lg shadow-[#2E5BFF]/20" 
          : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      <span className={cn(
        "transition-transform duration-300",
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </span>
      <span className="font-bold tracking-tight">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-active-dot"
          className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
        />
      )}
    </button>
  );
}

function EqSlider({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold tracking-tight text-white/60">{label}</span>
        <span className="text-xs font-mono text-white/40">{value}%</span>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden group cursor-pointer">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <motion.div 
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        />
      </div>
    </div>
  );
}
