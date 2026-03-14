import Papa from 'papaparse';
import { SensorReading } from '../types';

export const fetchSheetData = async (sheetId: string): Promise<SensorReading[]> => {
  // If it's a full URL (like a direct published CSV link), use it directly.
  // Otherwise, construct the standard Google Sheets query URL.
  const url = sheetId.startsWith('http') 
    ? sheetId 
    : `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const readings: SensorReading[] = results.data.map((row: any) => ({
            timestamp: new Date(row.Timestamp || row.timestamp),
            sensorId: row.SensorID || row.sensorId || 'default',
            value: parseFloat(row.Value || row.value || row.Moisture || row.moisture || '0'),
          })).filter(r => !isNaN(r.timestamp.getTime()) && !isNaN(r.value));
          
          resolve(readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
};
