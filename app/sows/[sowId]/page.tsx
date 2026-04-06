"use client"

import { use, useState } from "react"
import useSWR, { mutate } from "swr"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  BreedingRecord, 
  BreedingStatus, 
  Medication,
  getStatusLabel, 
  getStatusColor, 
  formatDateThai 
} from "@/lib/types"
import { 
  Calendar, 
  Syringe, 
  History, 
  Plus, 
  Clock,
  CheckCircle2,
  Baby
} from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface SowDetailData {
  sowId: string
  breedingRecords: Array<{
    id: string
    sow_id: string
    sire_id: string
    breeding_method: "artificial" | "natural"
    breeding_date: string
    first_check_date: string
    confirm_date: string
    due_date: string
    status: BreedingStatus
    notes?: string
    created_at: string
  }>
  medications: Array<{
    id: string
    sow_id: string
    medication_name: string
    dosage?: string
    administered_date: string
    administered_by?: string
    reason?: string
    notes?: string
    created_at: string
  }>
}

function transformBreedingRecord(record: SowDetailData["breedingRecords"][0]): BreedingRecord {
  return {
    id: record.id,
    sowId: record.sow_id,
    sireId: record.sire_id,
    breedingMethod: record.breeding_method,
    breedingDate: new Date(record.breeding_date),
    firstCheckDate: new Date(record.first_check_date),
    confirmDate: new Date(record.confirm_date),
    dueDate: new Date(record.due_date),
    status: record.status,
    notes: record.notes,
    createdAt: new Date(record.created_at),
  }
}

function transformMedication(med: SowDetailData["medications"][0]): Medication {
  return {
    id: med.id,
    sowId: med.sow_id,
    medicationName: med.medication_name,
    dosage: med.dosage,
    administeredDate: new Date(med.administered_date),
    administeredBy: med.administered_by,
    reason: med.reason,
    notes: med.notes,
    createdAt: new Date(med.created_at),
  }
}

function calculateDaysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function SowDetailPage({ 
  params 
}: { 
  params: Promise<{ sowId: string }> 
}) {
  const { sowId } = use(params)
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [medForm, setMedForm] = useState({
    medication_name: "",
    dosage: "",
    administered_date: new Date().toISOString().split("T")[0],
    administered_by: "",
    reason: "",
    notes: "",
  })

  const { data, error, isLoading } = useSWR<SowDetailData>(
    `/api/sows/${sowId}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const breedingRecords = data?.breedingRecords.map(transformBreedingRecord) || []
  const medications = data?.medications.map(transformMedication) || []
  const latestBreeding = breedingRecords[0]

  const handleAddMedication = async () => {
    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sow_id: sowId,
          ...medForm,
        }),
      })

      if (response.ok) {
        mutate(`/api/sows/${sowId}`)
        setIsAddingMed(false)
        setMedForm({
          medication_name: "",
          dosage: "",
          administered_date: new Date().toISOString().split("T")[0],
          administered_by: "",
          reason: "",
          notes: "",
        })
      }
    } catch (err) {
      console.error("Error adding medication:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title={sowId} subtitle="กำลังโหลด..." />
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8 text-primary" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title={sowId} />
        <div className="container px-4 py-8">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={sowId} subtitle="รายละเอียดแม่พันธุ์" />

      <main className="container space-y-4 px-4 py-4">
        {/* Current Status Card */}
        {latestBreeding && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">สถานะปัจจุบัน</CardTitle>
                <Badge
                  variant="outline"
                  className={cn("text-xs", getStatusColor(latestBreeding.status))}
                >
                  {getStatusLabel(latestBreeding.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Timeline */}
              <div className="space-y-2">
                <TimelineItem 
                  icon={Calendar}
                  label="วันผสม"
                  date={latestBreeding.breedingDate}
                  isPast
                />
                <TimelineItem 
                  icon={Clock}
                  label="ตรวจท้อง"
                  date={latestBreeding.firstCheckDate}
                  isPast={calculateDaysUntil(latestBreeding.firstCheckDate) < 0}
                  isActive={latestBreeding.status === "pending-check"}
                />
                <TimelineItem 
                  icon={CheckCircle2}
                  label="ยืนยันท้อง"
                  date={latestBreeding.confirmDate}
                  isPast={calculateDaysUntil(latestBreeding.confirmDate) < 0}
                  isActive={latestBreeding.status === "pregnant" && calculateDaysUntil(latestBreeding.confirmDate) >= 0}
                />
                <TimelineItem 
                  icon={Baby}
                  label="กำหนดคลอด"
                  date={latestBreeding.dueDate}
                  isPast={latestBreeding.status === "delivered"}
                  isActive={latestBreeding.status === "pregnant" && calculateDaysUntil(latestBreeding.confirmDate) < 0}
                  highlight
                />
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-2 pt-2 text-sm text-muted-foreground">
                <span>พ่อพันธุ์: {latestBreeding.sireId}</span>
                <span>|</span>
                <span>
                  {latestBreeding.breedingMethod === "artificial" ? "ผสมเทียม" : "ผสมจริง"}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for History */}
        <Tabs defaultValue="breeding" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breeding" className="gap-2">
              <History className="size-4" />
              ประวัติผสม ({breedingRecords.length})
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2">
              <Syringe className="size-4" />
              ประวัติยา ({medications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breeding" className="mt-4 space-y-3">
            {breedingRecords.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                ไม่มีประวัติการผสมพันธุ์
              </div>
            ) : (
              breedingRecords.map((record, index) => (
                <Card key={record.id} className={index === 0 ? "border-primary/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatDateThai(record.breedingDate)}
                          </span>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              ล่าสุด
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          พ่อพันธุ์: {record.sireId} | 
                          {record.breedingMethod === "artificial" ? " ผสมเทียม" : " ผสมจริง"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          กำหนดคลอด: {formatDateThai(record.dueDate)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getStatusColor(record.status))}
                      >
                        {getStatusLabel(record.status)}
                      </Badge>
                    </div>
                    {record.notes && (
                      <p className="mt-2 text-sm text-muted-foreground border-t pt-2">
                        {record.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="medications" className="mt-4 space-y-3">
            {/* Add Medication Button */}
            <Dialog open={isAddingMed} onOpenChange={setIsAddingMed}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="size-4" />
                  เพิ่มบันทึกการให้ยา
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>บันทึกการให้ยา - {sowId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication_name">ชื่อยา *</Label>
                    <Input
                      id="medication_name"
                      value={medForm.medication_name}
                      onChange={(e) => setMedForm({ ...medForm, medication_name: e.target.value })}
                      placeholder="เช่น ไอเวอร์เมคติน"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">ขนาดยา</Label>
                      <Input
                        id="dosage"
                        value={medForm.dosage}
                        onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                        placeholder="เช่น 5ml"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="administered_date">วันที่ให้ยา *</Label>
                      <Input
                        id="administered_date"
                        type="date"
                        value={medForm.administered_date}
                        onChange={(e) => setMedForm({ ...medForm, administered_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="administered_by">ผู้ให้ยา</Label>
                    <Input
                      id="administered_by"
                      value={medForm.administered_by}
                      onChange={(e) => setMedForm({ ...medForm, administered_by: e.target.value })}
                      placeholder="ชื่อผู้ให้ยา"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">เหตุผล</Label>
                    <Input
                      id="reason"
                      value={medForm.reason}
                      onChange={(e) => setMedForm({ ...medForm, reason: e.target.value })}
                      placeholder="เช่น ถ่ายพยาธิ, รักษาอาการป่วย"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea
                      id="notes"
                      value={medForm.notes}
                      onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                      placeholder="รายละเอียดเพิ่มเติม..."
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleAddMedication} 
                    className="w-full"
                    disabled={!medForm.medication_name}
                  >
                    บันทึก
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {medications.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                ไม่มีประวัติการให้ยา
              </div>
            ) : (
              medications.map((med) => (
                <Card key={med.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Syringe className="size-4 text-primary" />
                          <span className="font-medium">{med.medicationName}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDateThai(med.administeredDate)}
                          {med.dosage && ` | ${med.dosage}`}
                        </p>
                        {med.reason && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            เหตุผล: {med.reason}
                          </p>
                        )}
                      </div>
                      {med.administeredBy && (
                        <span className="text-xs text-muted-foreground">
                          โดย {med.administeredBy}
                        </span>
                      )}
                    </div>
                    {med.notes && (
                      <p className="mt-2 text-sm text-muted-foreground border-t pt-2">
                        {med.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}

// Timeline Item Component
function TimelineItem({ 
  icon: Icon, 
  label, 
  date, 
  isPast,
  isActive,
  highlight 
}: { 
  icon: React.ElementType
  label: string
  date: Date
  isPast?: boolean
  isActive?: boolean
  highlight?: boolean
}) {
  const daysUntil = calculateDaysUntil(date)
  
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg p-2 transition-colors",
      isActive && "bg-primary/10",
      highlight && isActive && "bg-primary/15"
    )}>
      <div className={cn(
        "flex size-8 items-center justify-center rounded-full",
        isPast ? "bg-muted text-muted-foreground" : 
        isActive ? "bg-primary text-primary-foreground" : 
        "bg-secondary text-secondary-foreground"
      )}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1">
        <p className={cn(
          "text-sm font-medium",
          isPast && !isActive && "text-muted-foreground"
        )}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateThai(date)}
        </p>
      </div>
      {!isPast && (
        <span className={cn(
          "text-sm font-medium",
          daysUntil <= 0 ? "text-destructive" :
          daysUntil <= 3 ? "text-warning-foreground" :
          daysUntil <= 7 ? "text-primary" :
          "text-muted-foreground"
        )}>
          {daysUntil === 0 ? "วันนี้" :
           daysUntil < 0 ? `เลย ${Math.abs(daysUntil)} วัน` :
           `${daysUntil} วัน`}
        </span>
      )}
    </div>
  )
}
