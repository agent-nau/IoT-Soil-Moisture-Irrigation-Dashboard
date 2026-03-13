import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { SensorReading } from '../types';

interface MoistureChartProps {
  readings: SensorReading[];
}

export const MoistureChart: React.FC<MoistureChartProps> = ({ readings }) => {
  const chartData = readings.map(r => ({
    time: format(r.timestamp, 'HH:mm'),
    fullTime: format(r.timestamp, 'MMM d, HH:mm:ss'),
    value: r.value,
  }));

  if (readings.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-maroon-300/20 font-medium italic">
        No historical data available yet
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4c0519" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#fda4af' }}
            minTickGap={30}
          />
          <YAxis 
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#fda4af' }}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid rgba(251, 191, 36, 0.2)', 
              backgroundColor: '#4c0519',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
              fontSize: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#fbbf24' }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#fbbf24" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
