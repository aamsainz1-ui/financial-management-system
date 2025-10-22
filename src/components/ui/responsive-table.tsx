'use client'

import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMobile } from '@/hooks/use-mobile'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T, index: number) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: {
    label: string
    icon?: React.ReactNode
    onClick: (item: T, index: number) => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    hideOnMobile?: boolean
  }[]
  emptyMessage?: string
  className?: string
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  emptyMessage = "ไม่มีข้อมูล",
  className
}: ResponsiveTableProps<T>) {
  const isMobile = useMobile()

  if (isMobile) {
    // Mobile card view
    return (
      <div className={`space-y-4 ${className}`}>
        {data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {emptyMessage}
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Mobile card header */}
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-lg">
                      {columns[0].render 
                        ? columns[0].render(item[columns[0].key], item, index)
                        : item[columns[0].key]
                      }
                    </div>
                    {actions && actions.filter(a => !a.hideOnMobile).length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.filter(a => !a.hideOnMobile).map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(item, index)}
                              className={action.variant === 'destructive' ? 'text-destructive' : ''}
                            >
                              {action.icon}
                              <span>{action.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Mobile card content */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {columns.slice(1).map((column) => {
                      if (column.hideOnMobile) return null
                      return (
                        <div key={String(column.key)} className="flex justify-between items-center">
                          <span className="text-muted-foreground min-w-0 flex-shrink-0">
                            {column.label}:
                          </span>
                          <span className="text-right font-medium min-w-0 flex-1 ml-2">
                            {column.render 
                              ? column.render(item[column.key], item, index)
                              : item[column.key]
                            }
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Mobile actions */}
                  {actions && actions.filter(a => a.hideOnMobile).length > 0 && (
                    <div className="flex gap-2 pt-2 border-t">
                      {actions.filter(a => a.hideOnMobile).map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || 'outline'}
                          size="sm"
                          onClick={() => action.onClick(item, index)}
                          className="flex-1"
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  // Desktop table view
  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={String(column.key)} 
                className={column.className}
              >
                {column.label}
              </TableHead>
            ))}
            {actions && actions.length > 0 && (
              <TableHead className="w-20 text-right">การจัดการ</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (actions ? 1 : 0)} 
                className="text-center text-muted-foreground py-8"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell 
                    key={String(column.key)} 
                    className={column.className}
                  >
                    {column.render 
                      ? column.render(item[column.key], item, index)
                      : item[column.key]
                    }
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={() => action.onClick(item, index)}
                            className={action.variant === 'destructive' ? 'text-destructive' : ''}
                          >
                            {action.icon}
                            <span>{action.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}