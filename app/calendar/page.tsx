"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Baby } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CalendarEvent {
  sowId: string
  type: "check" | "confirm" | "due"
  date: string
  status: string
}

interface CalendarData {
  year: number
  month: number
  events: Record<string, CalendarEvent[]>
}

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
]

const EVENT_CONFIG = {
  check: { label: "ตรวจท้อง", color: "bg-warning", icon: Clock },
  confirm: { label: "ยืนยันท้อง", color: "bg-info", icon: CheckCircle2 },
  due: { label: "กำหนดคลอด", color: "bg-destructive", icon: Baby },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data, error, isLoading } = useSWR<CalendarData>(
    `/api/calendar?year=${currentYear}&month=${currentMonth}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const days: Array<{ date: number | null; dateStr: string | null }> = []

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, dateStr: null })
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      days.push({ date: day, dateStr })
    }

    return days
  }, [currentYear, currentMonth])

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const handleToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth() + 1)
    setSelectedDate(null)
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const selectedEvents = selectedDate && data?.events[selectedDate] ? data.events[selectedDate] : []

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <main className="container space-y-4 px-4 py-4">
        {/* Month Navigation */}
        <Card>
          <CardContent className="flex items-center justify-between p-3">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="size-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {MONTHS[currentMonth - 1]} {currentYear + 543}
              </span>
              {(currentYear !== today.getFullYear() || currentMonth !== today.getMonth() + 1) && (
                <Button variant="outline" size="sm" onClick={handleToday}>
                  วันนี้
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="size-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="size-8 text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </div>
            ) : (
              <>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map((day, index) => (
                    <div
                      key={day}
                      className={cn(
                        "text-center text-xs font-medium py-2",
                        index === 0 ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (!day.date || !day.dateStr) {
                      return <div key={`empty-${index}`} className="aspect-square" />
                    }

                    const isToday = day.dateStr === todayStr
                    const isSelected = day.dateStr === selectedDate
                    const dayEvents = data?.events[day.dateStr] || []
                    const hasEvents = dayEvents.length > 0
                    const hasDue = dayEvents.some(e => e.type === "due")

                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={cn(
                          "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm transition-colors relative",
                          isToday && "bg-primary/10 font-semibold",
                          isSelected && "bg-primary text-primary-foreground",
                          !isToday && !isSelected && "hover:bg-muted",
                          index % 7 === 0 && !isSelected && "text-destructive"
                        )}
                      >
                        <span>{day.date}</span>
                        {hasEvents && (
                          <div className="flex gap-0.5">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "size-1.5 rounded-full",
                                  isSelected ? "bg-primary-foreground" :
                                  event.type === "due" ? "bg-destructive" :
                                  event.type === "check" ? "bg-warning" :
                                  "bg-info"
                                )}
                              />
                            ))}
                          </div>
                        )}
                        {hasDue && !isSelected && (
                          <div className="absolute -top-0.5 -right-0.5 size-2 bg-destructive rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-warning" />
            <span>ตรวจท้อง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-info" />
            <span>ยืนยันท้อง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-destructive" />
            <span>กำหนดคลอด</span>
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {new Date(selectedDate).toLocaleDateString("th-TH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ไม่มีกำหนดการในวันนี้
                </p>
              ) : (
                selectedEvents.map((event, index) => {
                  const config = EVENT_CONFIG[event.type]
                  const Icon = config.icon
                  
                  return (
                    <Link
                      key={`${event.sowId}-${event.type}-${index}`}
                      href={`/sows/${event.sowId}`}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className={cn(
                        "flex size-8 items-center justify-center rounded-full text-white",
                        config.color
                      )}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.sowId}</p>
                        <p className="text-sm text-muted-foreground">{config.label}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ดูรายละเอียด
                      </Badge>
                    </Link>
                  )
                })
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
