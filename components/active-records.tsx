"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { 
  ChevronDown, 
  Syringe, 
  PiggyBank, 
  Calendar, 
  ClipboardCheck,
  MoreVertical,
  CheckCircle2,
  RefreshCw,
  Baby,
  LayoutGrid,
  TableIcon,
  StickyNote,
  Pencil,
  Trash2
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
  onUpdateStatus: (id: string, status: BreedingStatus, additionalData?: { pigletCount?: number; notes?: string; deliveredDate?: string }) => void
  onDeleteRecord?: (id: string) => void
}

type FilterStatus = "all" | BreedingStatus
type ViewMode = "card" | "table"

export function ActiveRecords({ records, onUpdateStatus, onDeleteRecord }: ActiveRecordsProps) {
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("card")

  // Dialog states
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BreedingRecord | null>(null)
  const [pigletCount, setPigletCount] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")

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

  const handleDeliveryClick = (record: BreedingRecord) => {
    setSelectedRecord(record)
    setPigletCount("")
    setDeliveryNotes("")
    setDeliveryDialogOpen(true)
  }

  const handleDeliverySubmit = () => {
    if (selectedRecord) {
      onUpdateStatus(selectedRecord.id, "delivered", {
        pigletCount: pigletCount ? parseInt(pigletCount, 10) : undefined,
        notes: deliveryNotes || undefined,
        deliveredDate: new Date().toISOString().split("T")[0],
      })
      setDeliveryDialogOpen(false)
      setSelectedRecord(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter and View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="h-10 shrink-0 text-sm sm:h-11 sm:text-base"
            >
              {option.label}
              {option.value !== "all" && (
                <span className="ml-1.5 rounded-full bg-background/20 px-2 py-0.5 text-xs sm:text-sm">
                  {records.filter((r) => r.status === option.value).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("card")}
            className="h-9 gap-1.5 px-3"
          >
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">การ์ด</span>
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-9 gap-1.5 px-3"
          >
            <TableIcon className="size-4" />
            <span className="hidden sm:inline">ตาราง</span>
          </Button>
        </div>
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
      ) : viewMode === "card" ? (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <RecordCard 
              key={record.id} 
              record={record} 
              onUpdateStatus={onUpdateStatus}
              onDeliveryClick={handleDeliveryClick}
              onDeleteRecord={onDeleteRecord}
            />
          ))}
        </div>
      ) : (
        <RecordTable 
          records={filteredRecords} 
          onUpdateStatus={onUpdateStatus}
          onDeliveryClick={handleDeliveryClick}
          onDeleteRecord={onDeleteRecord}
        />
      )}

      {/* Delivery Dialog */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Baby className="size-5 text-info" />
              บันทึกการคลอด - {selectedRecord?.sowId}
            </DialogTitle>
            <DialogDescription>
              กรอกข้อมูลจำนวนลูกสุกรและหมายเหตุเพิ่มเติม (ถ้ามี)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel htmlFor="pigletCount">จำนวนลูกสุกร</FieldLabel>
              <Input
                id="pigletCount"
                type="number"
                min="0"
                max="30"
                placeholder="เช่น 12"
                value={pigletCount}
                onChange={(e) => setPigletCount(e.target.value)}
                className="text-lg"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="deliveryNotes">หมายเหตุ (ไม่บังคับ)</FieldLabel>
              <Textarea
                id="deliveryNotes"
                placeholder="เช่น คลอดปกติ ลูกแข็งแรงดี"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </Field>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeliveryDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleDeliverySubmit} className="gap-2">
              <CheckCircle2 className="size-4" />
              บันทึกการคลอด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface RecordCardProps {
  record: BreedingRecord
  onUpdateStatus: (id: string, status: BreedingStatus, additionalData?: { pigletCount?: number; notes?: string; deliveredDate?: string }) => void
  onDeliveryClick: (record: BreedingRecord) => void
  onDeleteRecord?: (id: string) => void
}

function RecordCard({ record, onUpdateStatus, onDeliveryClick, onDeleteRecord }: RecordCardProps) {
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
          <div className="min-w-0 flex-1 space-y-3">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold">{record.sowId}</span>
              <Badge 
                variant="outline" 
                className={cn("text-sm", getStatusColor(record.status))}
              >
                {getStatusLabel(record.status)}
              </Badge>
              {isNearDue && (
                <Badge className="bg-info text-info-foreground text-sm">
                  คลอดใน {daysUntilDue} วัน
                </Badge>
              )}
              {record.status === "delivered" && record.pigletCount !== undefined && (
                <Badge variant="secondary" className="text-sm">
                  ลูก {record.pigletCount} ตัว
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 sm:text-base">
              <div className="flex items-center gap-2 text-muted-foreground">
                {record.breedingMethod === "artificial" ? (
                  <Syringe className="size-3.5 shrink-0" />
                ) : (
                  <PiggyBank className="size-3.5 shrink-0" />
                )}
                <span>
                  {record.breedingMethod === "artificial" ? "ผสมเทียม" : "ผสมจริง"}
                </span>
              </div>
              <div className="text-muted-foreground truncate">
                {record.breedingMethod === "artificial" ? "น้ำเชื้อ" : "พ่อพันธุ์"}: {record.sireId}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" />
                <span>ผสม: {formatDateThai(record.breedingDate)}</span>
              </div>
              <div className="text-muted-foreground">
                กำหนดคลอด: {formatDateThai(record.dueDate)}
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                <StickyNote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{record.notes}</span>
              </div>
            )}

            {/* Timeline */}
            {record.status === "pending-check" && (
              <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-sm">
                <Calendar className="size-3.5 shrink-0 text-accent" />
                <span>ตรวจท้องครั้งที่ 1: {formatDateThai(record.firstCheckDate)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10 shrink-0 sm:size-11">
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
                  onClick={() => onDeliveryClick(record)}
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
              {onDeleteRecord && (
                <DropdownMenuItem
                  onClick={() => onDeleteRecord(record.id)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  ลบรายการ
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

interface RecordTableProps {
  records: BreedingRecord[]
  onUpdateStatus: (id: string, status: BreedingStatus, additionalData?: { pigletCount?: number; notes?: string; deliveredDate?: string }) => void
  onDeliveryClick: (record: BreedingRecord) => void
  onDeleteRecord?: (id: string) => void
}

function RecordTable({ records, onUpdateStatus, onDeliveryClick, onDeleteRecord }: RecordTableProps) {
  const today = new Date()
  
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เบอร์หู</TableHead>
            <TableHead className="hidden sm:table-cell">วิธีผสม</TableHead>
            <TableHead className="hidden md:table-cell">วันผสม</TableHead>
            <TableHead>กำหนดคลอด</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="hidden lg:table-cell">จำนวนลูก</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const daysUntilDue = Math.ceil(
              (record.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )
            const isNearDue = record.status === "pregnant" && daysUntilDue <= 7 && daysUntilDue >= 0

            return (
              <TableRow 
                key={record.id}
                className={cn(isNearDue && "bg-info/5")}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {record.sowId}
                    {isNearDue && (
                      <Badge className="bg-info text-info-foreground text-xs hidden sm:inline-flex">
                        {daysUntilDue} วัน
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    {record.breedingMethod === "artificial" ? (
                      <Syringe className="size-3.5" />
                    ) : (
                      <PiggyBank className="size-3.5" />
                    )}
                    <span className="hidden lg:inline">
                      {record.breedingMethod === "artificial" ? "ผสมเทียม" : "ผสมจริง"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDateThai(record.breedingDate)}
                </TableCell>
                <TableCell>{formatDateThai(record.dueDate)}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getStatusColor(record.status))}
                  >
                    {getStatusLabel(record.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {record.pigletCount !== undefined ? `${record.pigletCount} ตัว` : "-"}
                </TableCell>
                <TableCell>
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
                          onClick={() => onDeliveryClick(record)}
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
                      {onDeleteRecord && (
                        <DropdownMenuItem
                          onClick={() => onDeleteRecord(record.id)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          ลบรายการ
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
