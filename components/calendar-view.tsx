"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { BreedingRecord, getStatusColor, getStatusLabel } from "@/lib/types"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  records: BreedingRecord[]
}

export function CalendarView({ records }: CalendarViewProps) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  // Get important dates for this month
  const monthlyEvents = useMemo(() => {
    const events: Record<number, BreedingRecord[]> = {}

    records.forEach((record) => {
      const date = record.status === "pregnant" ? record.dueDate : record.firstCheckDate
      if (
        date.getFullYear() === year &&
        date.getMonth() === month
      ) {
        const day = date.getDate()
        if (!events[day]) events[day] = []
        events[day].push(record)
      }
    })

    return events
  }, [records, year, month])

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = new Date(year, month, 1).toLocaleString("th-TH", {
    month: "long",
    year: "numeric",
  })

  if (Object.keys(monthlyEvents).length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Empty>
            <EmptyMedia variant="icon">
              <CalendarIcon className="size-5 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>ไม่มีกิจกรรมในเดือนนี้</EmptyTitle>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{monthName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank days */}
            {blanks.map((i) => (
              <div key={`blank-${i}`} className="aspect-square" />
            ))}

            {/* Days with events */}
            {days.map((day) => {
              const dayEvents = monthlyEvents[day] || []
              const hasEvent = dayEvents.length > 0

              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square rounded-lg border p-1.5 transition-colors",
                    hasEvent
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-background"
                  )}
                >
                  <div className="h-full flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex-1 flex flex-col gap-0.5 mt-1">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <Badge
                            key={`${day}-${idx}`}
                            variant="outline"
                            className={cn(
                              "text-[0.5rem] px-1 py-0 h-4 truncate",
                              getStatusColor(event.status)
                            )}
                          >
                            {event.sowId}
                          </Badge>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[0.5rem] text-muted-foreground">
                            +{dayEvents.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">
              รายละเอียด
            </h4>
            <div className="space-y-1">
              {Object.entries(monthlyEvents)
                .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
                .map(([day, events]) => (
                  <div key={day} className="text-xs space-y-1">
                    <p className="font-medium text-foreground">
                      {month + 1}/{day}:
                    </p>
                    <div className="ml-2 space-y-0.5">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="text-muted-foreground"
                        >
                          {event.sowId} -{" "}
                          {event.status === "pregnant"
                            ? `กำหนดคลอด`
                            : `ตรวจท้อง`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
