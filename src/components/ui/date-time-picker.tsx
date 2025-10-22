'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, X, Filter, RotateCcw } from 'lucide-react'

export interface DateTimeFilter {
  startDateTime: string
  endDateTime: string
}

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
}

function DateTimePicker({ value, onChange, label, placeholder }: DateTimePickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {label}
      </Label>
      <div className="relative">
        <Input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
        />
      </div>
    </div>
  )
}

interface DateTimeFilterProps {
  filter: DateTimeFilter
  onFilterChange: (filter: DateTimeFilter) => void
  onClearFilter: () => void
  className?: string
}

export function DateTimeFilterComponent({ 
  filter, 
  onFilterChange, 
  onClearFilter,
  className = "" 
}: DateTimeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStartDateTimeChange = (startDateTime: string) => {
    onFilterChange({ ...filter, startDateTime })
  }

  const handleEndDateTimeChange = (endDateTime: string) => {
    onFilterChange({ ...filter, endDateTime })
  }

  const handleClearFilter = () => {
    onFilterChange({ startDateTime: '', endDateTime: '' })
    onClearFilter()
  }

  const hasActiveFilter = filter.startDateTime || filter.endDateTime

  const formatDateForDisplay = (dateTimeString: string) => {
    if (!dateTimeString) return ''
    try {
      const date = new Date(dateTimeString)
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateTimeString
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <Button
          variant={hasActiveFilter ? "default" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Filter className="h-4 w-4" />
          กรองตามวันที่และเวลา
          {hasActiveFilter && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>

        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full sm:w-auto justify-center sm:justify-start"
          >
            <RotateCcw className="h-4 w-4" />
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      {/* Active Filter Display */}
      {hasActiveFilter && !isExpanded && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-3 sm:pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                {filter.startDateTime && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-medium">จาก:</span>
                    <span className="break-all sm:break-normal">{formatDateForDisplay(filter.startDateTime)}</span>
                  </div>
                )}
                {filter.endDateTime && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-medium">ถึง:</span>
                    <span className="break-all sm:break-normal">{formatDateForDisplay(filter.endDateTime)}</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-blue-600 self-start sm:self-auto"
              >
                แก้ไข
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm sm:text-base">ตัวกรองวันที่และเวลา</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="self-start sm:self-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateTimePicker
                value={filter.startDateTime}
                onChange={handleStartDateTimeChange}
                label="วันที่และเวลาเริ่มต้น"
                placeholder="เลือกวันที่และเวลาเริ่มต้น"
              />
              <DateTimePicker
                value={filter.endDateTime}
                onChange={handleEndDateTimeChange}
                label="วันที่และเวลาสิ้นสุด"
                placeholder="เลือกวันที่และเวลาสิ้นสุด"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                onClick={() => setIsExpanded(false)}
                className="flex-1 order-2 sm:order-1"
                disabled={!hasActiveFilter}
              >
                ใช้ตัวกรอง
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFilter}
                className="flex-1 order-1 sm:order-2"
              >
                ล้างตัวกรอง
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• สามารถเลือกเฉพาะวันที่เริ่มต้นหรือวันที่สิ้นสุดก็ได้</p>
              <p>• ระบบจะแสดงรายการที่สร้างหรืออัปเดตภายในช่วงเวลาที่เลือก</p>
              <p>• รูปแบบ: DD/MM/YYYY HH:MM</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to check if a date is within the filter range
export function isDateInRange(date: string, filter: DateTimeFilter): boolean {
  if (!filter.startDateTime && !filter.endDateTime) {
    return true // No filter applied
  }

  const itemDate = new Date(date)
  
  if (filter.startDateTime) {
    const startDate = new Date(filter.startDateTime)
    if (itemDate < startDate) {
      return false
    }
  }
  
  if (filter.endDateTime) {
    const endDate = new Date(filter.endDateTime)
    if (itemDate > endDate) {
      return false
    }
  }
  
  return true
}

// Helper function to filter an array of items by date range
export function filterByDateRange<T extends { date: string | Date; createdAt?: string | Date; updatedAt?: string | Date }>(
  items: T[],
  filter: DateTimeFilter,
  dateField: 'date' | 'createdAt' | 'updatedAt' = 'date'
): T[] {
  if (!filter.startDateTime && !filter.endDateTime) {
    return items
  }

  return items.filter(item => {
    const itemDate = item[dateField] || item.createdAt || item.updatedAt
    if (!itemDate) return true
    
    return isDateInRange(
      typeof itemDate === 'string' ? itemDate : itemDate.toISOString(),
      filter
    )
  })
}