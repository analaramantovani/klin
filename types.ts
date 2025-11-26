export interface ShoeCandidate {
  value: string;
  confidence: number;
  bbox?: number[]; // [x, y, w, h] normalized 0-1
}

export interface RoiData {
  roi: number[]; // [x, y, w, h]
  candidates: ShoeCandidate[];
  chosen: string | null;
  confidence: number;
}

export interface ScanResult {
  timestamp: string;
  left: RoiData;
  right: RoiData;
  match: boolean;
  processing_time_ms: number;
  device: string;
  image_id?: string; // Base64 snippet or ID
  notes: string;
  status: 'OK' | 'ERROR' | 'WARNING';
}

export interface ProcessingState {
  isScanning: boolean;
  error?: string;
}
