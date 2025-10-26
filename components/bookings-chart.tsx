'use client'

interface BookingsChartProps {
  data: {
    date: string
    bookings: number
  }[]
}

export function BookingsChart({ data }: BookingsChartProps) {
  const maxBookings = Math.max(...data.map(d => d.bookings))
  
  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-glam-gold rounded-t-md min-h-[4px] transition-all duration-300"
              style={{ 
                height: `${maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 0}%` 
              }}
            />
            <div className="text-xs text-gray-500 mt-2 text-center">
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs font-medium text-gray-700">
              {item.bookings}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
