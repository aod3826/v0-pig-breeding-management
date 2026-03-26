"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  AlertCircle,
  Clock,
  Bell,
  CheckCircle2,
} from "lucide-react"
import { formatDateThai } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface AlertItem {
  id: string
  type: "first-check" | "confirm-check" | "due-soon" | "overdue"
  severity: "warning" | "info" | "danger"
  title: string
  description: string
  date: Date
  sowId: string
}

interface AlertsPanelProps {
  alerts: AlertItem[]
}

const alertConfig = {
  "first-check": {
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "ตรวจท้อง",
  },
  "confirm-check": {
    icon: Clock,
    color: "text-info",
    bgColor: "bg-info/10",
    label: "ตรวจยืนยัน",
  },
  "due-soon": {
    icon: Bell,
    color: "text-accent",
    bgColor: "bg-accent/10",
    label: "ใกล้คลอด",
  },
  "overdue": {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "เกินกำหนด",
  },
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Empty>
            <EmptyMedia variant="icon">
              <Bell className="size-5 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>ไม่มีการแจ้งเตือน</EmptyTitle>
            <EmptyDescription>
              ทุกอย่างเป็นไปตามปกติ
            </EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { danger: 0, warning: 1, info: 2 }
    const severityDiff =
      severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">การแจ้งเตือน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAlerts.map((alert) => {
            const config = alertConfig[alert.type]
            const Icon = config.icon
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  config.bgColor,
                  alert.severity === "danger"
                    ? "border-destructive/30"
                    : alert.severity === "warning"
                      ? "border-warning/30"
                      : "border-info/30"
                )}
              >
                <Icon className={cn("mt-0.5 size-4 shrink-0", config.color)} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{alert.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.sowId}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateThai(alert.date)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
