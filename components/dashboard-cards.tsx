"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, Baby, Clock, ClipboardList } from "lucide-react"

interface DashboardCardsProps {
  totalBreedings: number
  pregnantCount: number
  pendingCheckCount: number
  dueSoonCount: number
}

export function DashboardCards({
  totalBreedings,
  pregnantCount,
  pendingCheckCount,
  dueSoonCount,
}: DashboardCardsProps) {
  const stats = [
    {
      label: "จำนวนการผสมทั้งหมด",
      value: totalBreedings,
      icon: ClipboardList,
      color: "bg-primary/10 text-primary",
      borderColor: "border-primary/20",
    },
    {
      label: "กำลังตั้งท้อง",
      value: pregnantCount,
      icon: Activity,
      color: "bg-success/10 text-success",
      borderColor: "border-success/20",
    },
    {
      label: "รอตรวจท้อง",
      value: pendingCheckCount,
      icon: Clock,
      color: "bg-warning/10 text-accent",
      borderColor: "border-warning/20",
    },
    {
      label: "รอคลอดใน 7 วัน",
      value: dueSoonCount,
      icon: Baby,
      color: "bg-info/10 text-info",
      borderColor: "border-info/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border ${stat.borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
