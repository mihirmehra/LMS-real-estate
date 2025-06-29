'use client';

import { LeadStatusFunnel } from '@/types/analytics';

interface ConversionFunnelChartProps {
  data: LeadStatusFunnel[];
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const maxCount = Math.max(...data.map(stage => stage.count));

  return (
    <div className="space-y-4">
      {data.map((stage, index) => {
        const width = (stage.count / maxCount) * 100;
        const isLossStage = stage.status === 'Lost';
        
        return (
          <div key={stage.status} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{stage.status}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{stage.count} leads</span>
                <span className="text-xs text-gray-500">({stage.percentage}%)</span>
              </div>
            </div>
            
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  isLossStage 
                    ? 'bg-red-500' 
                    : index === 0 
                      ? 'bg-blue-500' 
                      : stage.status === 'Converted'
                        ? 'bg-green-500'
                        : 'bg-blue-400'
                }`}
                style={{ width: `${width}%` }}
              />
              
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className="text-white text-xs font-medium">
                  {stage.count}
                </span>
                {stage.conversionRate > 0 && (
                  <span className="text-white text-xs">
                    {stage.conversionRate.toFixed(1)}% →
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>Avg. time: {stage.averageTimeInStatus}d</span>
              {stage.dropOffRate > 0 && (
                <span className="text-red-600">Drop-off: {stage.dropOffRate.toFixed(1)}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}