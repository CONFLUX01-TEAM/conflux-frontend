import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface SourceData {
  name: string
  value: number
  color: string
}

const CandidatesBySource = () => {
  const [data] = useState<SourceData[]>([
    { name: 'LinkedIn', value: 40, color: '#021264' },
    { name: 'Indeed', value: 25, color: '#2779DE' },
    { name: 'Twitter', value: 15, color: '#08458F' },
    { name: 'Other', value: 12, color: '#0D2D54' },
    { name: 'Referral', value: 8, color: '#062DF6' },
  ])

  return (
    <div className="flex flex-col bg-[#FFFFFF] border-[0.5px] border-[#B5B5B5] rounded-[0.75rem] px-7 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[25.75rem] w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-[1.25rem] leading-[100%] font-medium text-[#000000]">
          Candidates by source
        </h3>
      </div>

      {/* Donut Chart Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative size-41.25">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  borderRadius: '6px',
                  border: '1px solid #EAEAEA',
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="100%"
                paddingAngle={5}
                cornerRadius="5%"
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-3 gap-y-3.5 gap-x-2.25 mb-[9px] mt-4 text-[0.6875rem] sm:text-xs font-inter font-medium text-[#71717A] px-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="size-3.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span
              className="truncate font-medium font-sans text-[0.8175rem] leading-[100%] text-[#535353]"
              title={item.name}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CandidatesBySource
