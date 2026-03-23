"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { 
  ChevronDown, 
  Syringe, 
  PiggyBank, 
  Calendar, 
  ClipboardCheck,
  MoreVertical,
  CheckCircle2,
  RefreshCw,
  Baby
} from "lucide-react"
import { 
  BreedingRecord, 
  BreedingStatus, 
  formatDateThai, 
  getStatusLabel, 
  getStatusColor 
} from "@/lib/types"
import { cn } from "@/lib/utils"

interface ActiveRecordsProps {
  records: BreedingRecord[]
  onUpdateStatus: (id: string, status: BreedingStatus) => void
}

type FilterStatus = "all" | BreedingStatus

export function ActiveRecords({ records, onUpdateStatus }: ActiveRecordsProps) {
  const [filter, setFilter] = useState<FilterStatus>("all")

  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true
    return record.status === filter
  })

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "pending-check", label: "รอตรวจท้อง" },
    { value: "pregnant", label: "ตั้งท้อง" },
    { value: "repeat", label: "ผสมซ้ำ" },
    { value: "delivered", label: "คลอดแล้ว" },
  ]

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(option.value)}
            className="shrink-0"
          >
            {option.label}
            {option.value !== "all" && (
              <span className="ml-1.5 rounded-full bg-background/20 px-1.5 text-xs">
                {records.filter((r) => r.status === option.value).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <Empty>
              <EmptyMedia variant="icon">
                <ClipboardCheck className="size-5 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>ไม่มีรายการ</EmptyTitle>
              <EmptyDescription>
                {filter === "all" 
                  ? "เริ่มบันทึกการผสมพันธุ์ใหม่ได้เลย" 
                  : `ไม่มีรายการที่สถานะ "${filterOptions.find(f => f.value === filter)?.label}"`
                }
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <RecordCard 
              key={record.id} 
              record={record} 
              onUpdateStatus={onUpdateStatus} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface RecordCardProps {
  record: BreedingRecord
  onUpdateStatus: (id: string, status: BreedingStatus) => void
}

function RecordCard({ record, onUpdateStatus }: RecordCardProps) {
  const today = new Date()
  const daysUntilDue = Math.ceil(
    (record.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const isNearDue = record.status === "pregnant" && daysUntilDue <= 7 && daysUntilDue >= 0
  
  return (
    <Card className={cn(
      "transition-all",
      isNearDue && "border-info/50 bg-info/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{record.sowId}</span>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getStatusColor(record.status))}
              >
                {getStatusLabel(record.status)}
              </Badge>
              {isNearDue && (
                <Badge className="bg-info text-info-foreground text-xs">
                  คลอดใน {daysUntilDue} วัน
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                {record.breedingMethod === "artificial" ? (
                  <Syringe className="size-3.5" />
                ) : (
                  <PiggyBank className="size-3.5" />
                )}
                <span>
                  {record.breedingMethod === "artificial" ? "ผสมเทียม" : "ผสมจริง"}
                </span>
              </div>
              <div className="text-muted-foreground">
                {record.breedingMethod === "artificial" ? "น้ำเชื้อ" : "พ่อพันธุ์"}: {record.sireId}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>ผสม: {formatDateThai(record.breedingDate)}</span>
              </div>
              <div className="text-muted-foreground">
                กำหนดคลอด: {formatDateThai(record.dueDate)}
              </div>
            </div>

            {/* Timeline */}
            {record.status === "pending-check" && (
              <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs">
                <Calendar className="size-3.5 text-accent" />
                <span>ตรวจท้องครั้งที่ 1: {formatDateThai(record.firstCheckDate)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
                <span className="sr-only">เมนู</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {record.status === "pending-check" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(record.id, "pregnant")}
                    className="gap-2"
                  >
                    <CheckCircle2 className="size-4 text-success" />
                    ยืนยันตั้งท้อง
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(record.id, "repeat")}
                    className="gap-2"
                  >
                    <RefreshCw className="size-4 text-destructive" />
                    ผสมซ้ำ
                  </DropdownMenuItem>
                </>
              )}
              {record.status === "pregnant" && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(record.id, "delivered")}
                  className="gap-2"
                >
                  <Baby className="size-4 text-info" />
                  บันทึกคลอด
                </DropdownMenuItem>
              )}
              {(record.status === "repeat" || record.status === "rebreed") && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(record.id, "pending-check")}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" />
                  บันทึกผสมใหม่
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
