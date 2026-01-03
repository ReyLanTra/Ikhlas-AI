
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  attachments?: string[];
  groundingLinks?: { title: string; uri: string }[];
  isImage?: boolean;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export type ViewType = 'chat' | 'tools' | 'gallery' | 'games';

export interface UserProfile {
  name: string;
  username: string;
  photo: string;
  bio: string;
  exp: number;
  titles: string[];
}

export interface AiPersonalization {
  characteristic: string;
  style: string;
  tone: string;
  customInstructions: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  language: string;
  userProfile: UserProfile;
  aiPersonalization: AiPersonalization;
  hasCompletedOnboarding?: boolean;
}

export const LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'jp', name: '日本語 (Japanese)' },
  { code: 'kr', name: '한국어 (Korean)' },
  { code: 'cn', name: '中文 (Chinese)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'tr', name: 'Türkçe (Turkish)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'nl', name: 'Nederlands (Dutch)' },
  { code: 'th', name: 'ไทย (Thai)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' }
];

export const FONTS = [
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Amiri', value: "'Amiri', serif" }
];
