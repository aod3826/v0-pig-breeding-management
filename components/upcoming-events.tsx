"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Calendar, Clock, Baby, ClipboardCheck, AlertTriangle } from "lucide-react"
import { 
  BreedingRecord, 
  getUpcomingEvents, 
  getEventLabel, 
  getEventColorClass,
  formatDateThai
} from "@/lib/types"
import { cn } from "@/lib/utils"

interface UpcomingEventsProps {
  records: BreedingRecord[]
}

export function UpcomingEvents({ records }: UpcomingEventsProps) {
  const events = getUpcomingEvents(records)

  const getEventIcon = (eventType: string, daysRemaining: number) => {
    if (daysRemaining < 0) return AlertTriangle
    switch (eventType) {
      case "first-check":
        return ClipboardCheck
      case "confirm":
        return Clock
      case "due":
        return Baby
      default:
        return Calendar
    }
  }

  const getDaysText = (days: number) => {
    if (days < 0) return `เลยกำหนด ${Math.abs(days)} วัน`
    if (days === 0) return "วันนี้"
    if (days === 1) return "พรุ่งนี้"
    return `อีก ${days} วัน`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="size-5" />
          กำหนดการที่กำลังจะมาถึง
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {events.length === 0 ? (
          <Empty className="py-6">
            <EmptyMedia variant="icon">
              <Calendar className="size-5 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-base">ไม่มีกำหนดการ</EmptyTitle>
            <EmptyDescription>
              ไม่มีเหตุการณ์สำคัญในช่วง 14 วันข้างหน้า
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 5).map((event, index) => {
              const Icon = getEventIcon(event.eventType, event.daysRemaining)
              return (
                <div
                  key={`${event.id}-${event.eventType}-${index}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    getEventColorClass(event.eventType, event.daysRemaining)
                  )}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{event.sowId}</span>
                      <Badge variant="outline" className="text-xs">
                        {getEventLabel(event.eventType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateThai(event.eventDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge 
                      variant={event.daysRemaining < 0 ? "destructive" : event.daysRemaining <= 3 ? "default" : "secondary"}
                      className="whitespace-nowrap"
                    >
                      {getDaysText(event.daysRemaining)}
                    </Badge>
                  </div>
                </div>
              )
            })}
            {events.length > 5 && (
              <p className="pt-2 text-center text-sm text-muted-foreground">
                และอีก {events.length - 5} รายการ
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
