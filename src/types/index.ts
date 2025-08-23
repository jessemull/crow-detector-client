export interface FeedingEvent {
  id: string;
  timestamp: string;
  foodType: string;
  amount: number;
  images: string[];
}

export interface FeederStatus {
  isOnline: boolean;
  lastSeen: string;
  batteryLevel: number;
  foodLevel: number;
}

export interface CameraStatus {
  isOnline: boolean;
  lastImage: string;
  storageUsed: number;
  storageTotal: number;
}

export interface AppState {
  feeder: FeederStatus;
  camera: CameraStatus;
  recentFeedings: FeedingEvent[];
}
