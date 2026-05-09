export interface WorkflowyNode {
  id: string;
  name: string;
  note: string;
  createdAt: number;
  updatedAt: number;
  isComplete?: boolean;
}

export interface WeatherInfo {
  temperature: number;
  windspeed: number;
}

export interface GoogleEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
}

export interface GmailMessage {
  id: string;
  from: string;
  subject: string;
}

export interface ExpensesData {
  date?: string;
  openRouter?: { daily: string; weekly: string; monthly: string };
  deepSeek?: { solde: string; aujourdHui: string; appels: string; tokens: string };
  totalAujourdHui?: string;
}

export interface TileConfig {
  id: string;
  name: string;
  color: string;
  type: string;
  onJarvisClick?: () => void;
}

export interface BaseTileProps extends TileConfig {
  icon: string;
  title: string;
}
