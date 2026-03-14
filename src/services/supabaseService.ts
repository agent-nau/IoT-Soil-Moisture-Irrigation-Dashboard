import { supabase } from '../supabase';
import { SensorReading } from '../types';

export const fetchSupabaseData = async (): Promise<SensorReading[]> => {
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      // If table doesn't exist yet, we'll return empty instead of crashing
      if (error.code === '42P01') {
        console.warn('Supabase table "sensor_readings" not found. Please create it in your Supabase dashboard.');
        return [];
      }
      throw error;
    }

    return (data || []).map((row: any) => ({
      timestamp: new Date(row.timestamp),
      sensorId: row.sensor_id || 'default',
      value: parseFloat(row.value || '0'),
    }));
  } catch (error) {
    console.error('Error fetching Supabase data:', error);
    return [];
  }
};

export const insertSensorReading = async (value: number, sensorId: string = 'default') => {
  try {
    const { error } = await supabase
      .from('sensor_readings')
      .insert([
        { 
          value, 
          sensor_id: sensorId, 
          timestamp: new Date().toISOString() 
        }
      ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error inserting sensor reading:', error);
    return false;
  }
};
