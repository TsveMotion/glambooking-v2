'use client'

interface RevenueChartProps {
  data: {
    date: string
    revenue: number
  }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  
  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-glam-pink rounded-t-md min-h-[4px] transition-all duration-300"
              style={{ 
                height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` 
              }}
            />
            <div className="text-xs text-gray-500 mt-2 text-center">
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs font-medium text-gray-700">
              £{item.revenue.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
