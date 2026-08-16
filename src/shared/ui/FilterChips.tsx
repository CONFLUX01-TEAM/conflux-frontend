import type { ReactNode } from 'react'
import Dropdown from './Dropdown'
import Button from './Button'

export interface FilterChip {
  id: string
  type: string
  value: string
}

export interface FilterChipsProps {
  activeFilters: FilterChip[]
  availableOptions: Record<string, string[]>
  filterLabels: Record<string, string>
  onFilterValueChange: (id: string, value: string) => void
  onRemoveFilter: (id: string) => void
  onClearFilters: () => void
  renderValue?: (type: string, value: string) => ReactNode
  renderOption?: (type: string, option: string) => ReactNode
}

const FilterChips = ({
  activeFilters,
  availableOptions,
  filterLabels,
  onFilterValueChange,
  onRemoveFilter,
  onClearFilters,
  renderValue,
  renderOption,
}: FilterChipsProps) => {
  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-[24px] w-full">
      <div className="flex flex-wrap items-center gap-3">
        {activeFilters.map((chip) => {
          const items = availableOptions[chip.type] || []
          const label = filterLabels[chip.type] || chip.type

          return (
            <div
              key={chip.id}
              className="flex items-center gap-2.5 p-2.5 border border-[#E6E6E6] bg-[#fdfeff] rounded-lg text-[15px] font-sans font-medium text-[#535353] relative"
            >
              <span className="text-[#3B3B3B] font-sans">{label}</span>

              {/* Dropdown Trigger Box */}
              <Dropdown
                items={items}
                value={chip.value}
                onChange={(val) => onFilterValueChange(chip.id, val)}
                align="left"
                renderTrigger={(_, isOpen) => (
                  <Button
                    type="button"
                    className="!w-auto flex items-center gap-2 px-2.5 py-2 bg-white border border-[#0D2D54] rounded-[8px] text-[14px] font-medium font-inter text-[#000000] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {renderValue ? renderValue(chip.type, chip.value) : <span>{chip.value}</span>}
                    <img
                      src="/dropdown_arrow-icon.svg"
                      alt="arrow"
                      className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </Button>
                )}
                renderItem={(option) => {
                  const optVal = typeof option === 'string' ? option : option.value
                  return renderOption ? (
                    renderOption(chip.type, optVal)
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-sans border">
                      <span>{optVal}</span>
                    </span>
                  )
                }}
                menuClassName="w-[14rem] max-h-48 overflow-y-auto px-2.5 py-[13px]"
                itemClassName="text-[15px] text-[#3B3B3B] font-inter font-medium px-5 py-2.5  hover:bg-[#E7EAEE] rounded-[8px] cursor-pointer"
              />

              {/* Close Button to remove this filter chip */}
              <Button
                type="button"
                onClick={() => onRemoveFilter(chip.id)}
                className="!w-auto cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-1"
                icon={<img src="/x-icon.svg" alt="remove" className="size-2.5" />}
              />
            </div>
          )
        })}
      </div>

      {/* Clear all */}
      <Button
        type="button"
        onClick={onClearFilters}
        className="!w-auto flex items-center gap-1.5 text-xs font-sans font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition-colors cursor-pointer ml-auto whitespace-nowrap"
        icon={<img src="/redo-icon.svg" alt="clear" className="size-3.5" />}
      >
        Clear all
      </Button>
    </div>
  )
}

export default FilterChips
