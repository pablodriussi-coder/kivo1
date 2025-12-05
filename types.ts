export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CategoryResult {
  title: string;
  status: 'positive' | 'warning' | 'negative';
  details: string[];
}

export interface AnalysisData {
  verdict: string;
  summary: string;
  categories: CategoryResult[];
  fullReportMarkdown: string;
}

export interface AnalysisResult extends Partial<AnalysisData> {
  markdown?: string; // Legacy support
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  analyses: AnalysisItem[];
}

export interface AnalysisItem {
  id: string;
  imageUrl: string; // Base64 data URL
  result: AnalysisResult | null;
  loading: boolean;
  error?: string;
}

export type ViewState = 'AUTH' | 'DASHBOARD' | 'PROJECT_DETAIL';

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}