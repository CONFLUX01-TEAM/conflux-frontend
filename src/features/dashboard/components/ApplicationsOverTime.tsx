// import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartDataPoint {
  name: string
  value: number
}

const ApplicationsOverTime = () => {
  // const [activeTab, setActiveTab] = useState('Weekly')

  // Data representing the application trend over weeks/days
  const data: ChartDataPoint[] = [
    { name: 'June 4', value: 0 },
    { name: 'June 6', value: 400 },
    { name: 'June 8', value: 200 },
    { name: 'June 10', value: 600 },
    { name: 'June 12', value: 300 },
    { name: 'June 14', value: 800 },
    { name: 'June 16', value: 1400 },
    { name: 'June 18', value: 500 },
    { name: 'June 20', value: 1800 },
    { name: 'June 22', value: 900 },
  ]

  const maxVal = Math.max(...data.map((d) => d.value), 0)

  const getUpperLimit = (val: number) => {
    if (val <= 0) return 100
    const power = Math.floor(Math.log10(val))
    const base = Math.pow(10, power)
    const steps = [1, 2, 5, 10]
    for (const step of steps) {
      const limitVal = step * base
      if (limitVal >= val) {
        return limitVal
      }
    }
    return base * 10
  }

  const limit = getUpperLimit(maxVal)

  const getTicks = (lim: number) => {
    if (lim % 4 === 0) {
      const step = lim / 4
      return [0, step, step * 2, step * 3, lim]
    } else if (lim % 5 === 0) {
      const step = lim / 5
      return [0, step, step * 2, step * 3, step * 4, lim]
    } else {
      const step = Math.ceil(lim / 4)
      const ticksList = []
      for (let v = 0; v <= lim; v += step) {
        ticksList.push(v)
      }
      if (ticksList[ticksList.length - 1] !== lim) {
        ticksList.push(lim)
      }
      return ticksList
    }
  }

  const ticks = getTicks(limit)

  // Y-axis tick formatter
  const formatYAxis = (tick: number) => {
    if (tick >= 1000) {
      return `${tick / 1000}k`
    }
    return tick.toString()
  }

  return (
    <div className="flex flex-col gap-14 bg-[#FFFFFF] border-[0.5px] border-[#DDE0E9] rounded-[0.75rem] pl-7 pr-1 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[25.75rem] w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-[1.25rem] font-medium leading-[100%] text-[#000000] tracking-[0%]">
          Applications over time
        </h3>

        {/* Tab Selector */}
        {/* <div className="flex bg-[#F4F4F5] p-0.5 rounded-[0.375rem]">
          {['Weekly', 'Monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 text-[0.6875rem] font-inter font-medium rounded-[0.25rem] transition-colors cursor-pointer ${activeTab === tab
                ? 'bg-white text-[#18181B] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                : 'text-[#71717A] hover:text-[#18181B]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div> */}
      </div>

      {/* Chart Wrapper */}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 26, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="recharts-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3481E0" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1D64BA" stopOpacity={0} />
              </linearGradient>
              {/* <filter id="recharts-area-shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
              </filter> */}
            </defs>
            <CartesianGrid vertical={false} stroke="#F0F0F0" strokeDasharray="3 0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#6C6C6C',
                fontSize: 13,
                fontWeight: 500,
                lineHeight: '100%',
                letterSpacing: '0%',
              }}
            />
            <YAxis
              domain={[0, limit]}
              ticks={ticks}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{
                fill: '#6C6C6C',
                fontSize: 15,
                fontWeight: 500,
                lineHeight: '100%',
                letterSpacing: '0%',
              }}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                if (name === 'line-only') return null
                return [value, 'Applications']
              }}
              contentStyle={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid #EAEAEA',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Applications"
              stroke="none"
              fillOpacity={1}
              fill="url(#recharts-area-grad)"
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="line-only"
              stroke="#0D2D54"
              strokeWidth={4}
              fill="none"
              filter="url(#recharts-area-shadow)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ApplicationsOverTime
