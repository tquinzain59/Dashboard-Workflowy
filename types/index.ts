export interface WorkflowyNode {
  id: string;
  name: string;
  nm?: string;
  note: string;
  no?: string;
  createdAt: number;
  updatedAt: number;
  isComplete?: boolean;
  items?: WorkflowyNode[];
  ch?: WorkflowyNode[];
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
  onAction?: () => void;
}

export interface BaseTileProps extends TileConfig {
  icon: string;
  title: string;
}
