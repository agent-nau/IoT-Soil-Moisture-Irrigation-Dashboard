export interface SensorReading {
  timestamp: Date;
  sensorId: string;
  value: number;
}

export interface SensorData {
  id: string;
  name: string;
  readings: SensorReading[];
  currentValue: number | null;
  lastUpdated: Date | null;
  battery: number | null;
  signal: number | null;
}
