import { useMemo } from "react";

interface AnalyticsChartProps {
  data: Array<{
    day: string;
    hours: number;
  }>;
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    if (!data || data.length === 0) {
      // Return default data if no data provided
      return days.map(day => ({ day, hours: Math.random() * 4 + 1 }));
    }
    
    return data;
  }, [data]);

  const maxHours = Math.max(...chartData.map(d => d.hours));

  return (
    <div className="h-64 flex items-end justify-between space-x-2">
      {chartData.map((item, index) => (
        <div key={item.day} className="flex flex-col items-center flex-1">
          <div 
            className="w-full bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
            style={{ 
              height: `${(item.hours / maxHours) * 100}%`,
              minHeight: '4px'
            }}
            title={`${item.day}: ${item.hours.toFixed(1)} hours`}
          />
          <span className="text-xs text-gray-500 mt-2">{item.day}</span>
        </div>
      ))}
    </div>
  );
}
