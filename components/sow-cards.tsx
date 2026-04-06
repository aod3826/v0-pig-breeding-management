"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BreedingRecord, BreedingStatus, getStatusLabel, getStatusColor } from "@/lib/types"
import { ChevronRight, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SowCardData {
  sowId: string
  currentStatus: BreedingStatus | null
  nextEvent: {
    type: "check" | "confirm" | "due" | null
    date: Date | null
    daysUntil: number | null
  }
  latestBreeding: BreedingRecord | null
}

interface SowCardsProps {
  sows: SowCardData[]
}

const eventTypeLabels = {
  check: "ตรวจท้อง",
  confirm: "ยืนยันท้อง",
  due: "กำหนดคลอด",
}

function getDaysLabel(days: number | null): string {
  if (days === null) return ""
  if (days < 0) return `เลยกำหนด ${Math.abs(days)} วัน`
  if (days === 0) return "วันนี้"
  if (days === 1) return "พรุ่งนี้"
  return `อีก ${days} วัน`
}

function getDaysColor(days: number | null): string {
  if (days === null) return "text-muted-foreground"
  if (days < 0) return "text-destructive"
  if (days <= 3) return "text-warning-foreground"
  if (days <= 7) return "text-primary"
  return "text-muted-foreground"
}

export function SowCards({ sows }: SowCardsProps) {
  if (sows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">ไม่มีรายการแม่พันธุ์</p>
        <p className="mt-1 text-sm text-muted-foreground">
          เริ่มบันทึกการผสมพันธุ์ที่หน้าหลัก
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {sows.map((sow) => (
        <Link key={sow.sowId} href={`/sows/${sow.sowId}`}>
          <Card className="transition-colors hover:bg-muted/50 active:bg-muted">
            <CardContent className="flex items-center gap-3 p-4">
              {/* Sow Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">{sow.sowId}</span>
                  {sow.currentStatus && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-0.5",
                        getStatusColor(sow.currentStatus)
                      )}
                    >
                      {getStatusLabel(sow.currentStatus)}
                    </Badge>
                  )}
                </div>
                
                {/* Next Event */}
                {sow.nextEvent.type && sow.nextEvent.date && (
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>{eventTypeLabels[sow.nextEvent.type]}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 font-medium",
                      getDaysColor(sow.nextEvent.daysUntil)
                    )}>
                      <Clock className="size-3.5" />
                      <span>{getDaysLabel(sow.nextEvent.daysUntil)}</span>
                    </div>
                  </div>
                )}
                
                {!sow.nextEvent.type && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    ไม่มีกำหนดการถัดไป
                  </p>
                )}
              </div>
              
              {/* Arrow */}
              <ChevronRight className="size-5 text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
