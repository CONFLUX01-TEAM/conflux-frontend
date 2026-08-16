import type { ReactNode } from 'react'

export interface Column<T> {
  header: ReactNode
  key: string
  headerClassName?: string
  cellClassName?: string
  render?: (item: T) => ReactNode
}

export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  className?: string
  tableClassName?: string
  rowClassName?: string | ((item: T) => string)
}

const Table = <T,>({
  data,
  columns,
  keyExtractor,
  className = '',
  tableClassName = '',
  rowClassName = '',
}: TableProps<T>) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table
        className={`w-full min-w-[55rem] border-separate border-spacing-0 text-left ${tableClassName}`}
      >
        <thead>
          <tr className="bg-[#ECF2F9] text-[14px] font-inter font-semibold text-[#535353] uppercase leading-[100%] tracking-[5%] select-none">
            {columns.map((column, index) => {
              const isFirst = index === 0
              const isLast = index === columns.length - 1
              const roundedClass = isFirst ? 'rounded-tl-[10px]' : isLast ? 'rounded-tr-[10px]' : ''

              // Avoid duplicate padding class conflict if specified in headerClassName
              const pyClass =
                column.headerClassName && column.headerClassName.includes('py-') ? '' : 'py-5'

              return (
                <th
                  key={column.key}
                  className={`px-6 font-semibold text-[#535353] ${pyClass} ${roundedClass} ${
                    column.headerClassName || ''
                  }`}
                >
                  {column.header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const rowClass = typeof rowClassName === 'function' ? rowClassName(item) : rowClassName
            return (
              <tr
                key={keyExtractor(item)}
                className={`group hover:bg-[#F9FAFB]/50 transition-colors ${rowClass}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-4 px-6 border-b border-[#E6E6E6] ${column.cellClassName || ''}`}
                  >
                    {column.render
                      ? column.render(item)
                      : ((item as Record<string, unknown>)[column.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table
