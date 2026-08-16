import { useState } from 'react'
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer } from 'recharts'

import Dropdown from '@/shared/ui/Dropdown'

interface FunnelStage {
  name: string
  value: number
  fill: string
}

// Custom funnel segment: rounded trapezoid (slanted sides with rounded corners)
interface FunnelShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  upperWidth?: number
  lowerWidth?: number
  fill?: string
}

const RoundedFunnelBar = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  upperWidth = 0,
  lowerWidth = 0,
  fill,
}: FunnelShapeProps) => {
  const gap = 5
  const r = 10
  const cx = x + width / 2

  const y1 = y
  const y2 = y + height - gap

  // Override lowerWidth to keep the slant without making it a pointy triangle
  const effectiveLowerWidth = lowerWidth === 0 ? upperWidth * 0.5 : lowerWidth

  // 4 corners of the trapezoid (clockwise: TL → TR → BR → BL)
  const corners = [
    { x: cx - upperWidth / 2, y: y1 }, // TL
    { x: cx + upperWidth / 2, y: y1 }, // TR
    { x: cx + effectiveLowerWidth / 2, y: y2 }, // BR
    { x: cx - effectiveLowerWidth / 2, y: y2 }, // BL
  ]

  // Normalize a 2D vector
  const norm = (dx: number, dy: number) => {
    const len = Math.sqrt(dx * dx + dy * dy)
    return len === 0 ? { dx: 0, dy: 0 } : { dx: dx / len, dy: dy / len }
  }

  // Clamp radius so it never exceeds half the shortest edge
  const minHalfW = Math.min(upperWidth, effectiveLowerWidth) / 2
  const halfH = (y2 - y1) / 2
  const cr = Math.max(0, Math.min(r, minHalfW - 1, halfH - 1))

  const parts: string[] = []

  for (let i = 0; i < 4; i++) {
    const prev = corners[(i + 3) % 4]
    const curr = corners[i]
    const next = corners[(i + 1) % 4]

    // Unit vectors toward prev and next from current corner
    const inDir = norm(prev.x - curr.x, prev.y - curr.y)
    const outDir = norm(next.x - curr.x, next.y - curr.y)

    // Points at distance cr along each edge from the corner
    const arcStart = { x: curr.x + inDir.dx * cr, y: curr.y + inDir.dy * cr }
    const arcEnd = { x: curr.x + outDir.dx * cr, y: curr.y + outDir.dy * cr }

    if (i === 0) {
      parts.push(`M ${arcStart.x} ${arcStart.y}`)
    } else {
      parts.push(`L ${arcStart.x} ${arcStart.y}`)
    }
    // Quadratic bezier: corner is the control point
    parts.push(`Q ${curr.x} ${curr.y} ${arcEnd.x} ${arcEnd.y}`)
  }
  parts.push('Z')

  return <path d={parts.join(' ')} fill={fill} />
}

const HiringPipeline = () => {
  const [timeframe, setTimeframe] = useState('This month')

  const stages: FunnelStage[] = [
    { name: 'Applied', value: 1000, fill: '#0D2D54' },
    { name: 'Screening', value: 800, fill: '#163F73' },
    { name: 'Technical Assessment', value: 600, fill: '#1B518E' },
    { name: 'Interview', value: 400, fill: '#1E62A5' },
    { name: 'Hired', value: 200, fill: '#257BC1' },
  ]

  const FUNNEL_COLORS = ['#0D2D54', '#163F73', '#1B518E', '#1E62A5', '#257BC1']

  const sortedStages = [...stages]
    .sort((a, b) => b.value - a.value)
    .map((stage, index) => ({
      ...stage,
      fill: FUNNEL_COLORS[index] || stage.fill,
    }))

  return (
    <div className="flex flex-col bg-[#FFFFFF] gap-10 border-[0.5px] border-[#B5B5B5] rounded-[0.75rem] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[25.75rem] w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-[1.25rem] font-medium text-[#000000]">Hiring Pipeline</h3>

        <Dropdown
          items={['This month', 'Last month', 'All time']}
          value={timeframe}
          onChange={setTimeframe}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-between gap-4">
        {/* Left side: Labels list */}
        <div className="flex flex-col justify-between gap-3.75 h-full select-none">
          {sortedStages.map((stage) => (
            <div key={stage.name} className="flex flex-col gap-0.5 leading-tight">
              <span
                className="font-sans font-medium text-[0.8125rem] leading-[100%] text-[#6C6C6C] truncate"
                title={stage.name}
              >
                {stage.name}
              </span>
              <span className="font-sans text-xs sm:text-[1rem] leading-[100%] font-medium text-[#000000]">
                {stage.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Right side: Recharts Funnel Chart */}
        <div className="flex-1 h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <Tooltip
                contentStyle={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  borderRadius: '6px',
                  border: '1px solid #EAEAEA',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                }}
              />
              <Funnel
                dataKey="value"
                data={sortedStages}
                isAnimationActive
                shape={<RoundedFunnelBar />}
              />
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default HiringPipeline
