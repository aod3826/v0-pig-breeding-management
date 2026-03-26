"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { DashboardCards } from "@/components/dashboard-cards"
import { BreedingForm } from "@/components/breeding-form"
import { ActiveRecords } from "@/components/active-records"
import { AIAnalysis } from "@/components/ai-analysis"
import { BottomNav } from "@/components/bottom-nav"
import { AlertsPanel, AlertItem } from "@/components/alerts-panel"
import { SowsManagement } from "@/components/sows-management"
import { DeliveryDialog } from "@/components/delivery-dialog"
import { CalendarView } from "@/components/calendar-view"
import { ReportsView } from "@/components/reports-view"
import { BreedingRecord, BreedingStatus, Sow, Sire, DeliveryData } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Transform API data to app format
function transformRecord(record: Record<string, unknown>): BreedingRecord {
  return {
    id: record.id as string,
    sowId: record.sow_id as string,
    breedingMethod: record.breeding_method as "artificial" | "natural",
    sireId: record.sire_id as string,
    breedingDate: new Date(record.breeding_date as string),
    firstCheckDate: new Date(record.first_check_date as string),
    confirmDate: new Date(record.confirmation_date as string),
    dueDate: new Date(record.expected_due_date as string),
    status: record.status as BreedingStatus,
    createdAt: new Date(record.created_at as string),
    notes: record.notes as string | undefined,
    actualDeliveryDate: record.actual_delivery_date
      ? new Date(record.actual_delivery_date as string)
      : undefined,
    litterSizeBorn: record.litter_size_born as number | undefined,
    litterSizeAlive: record.litter_size_alive as number | undefined,
    litterSizeDead: record.litter_size_dead as number | undefined,
    litterSizeMummy: record.litter_size_mummy as number | undefined,
    avgBirthWeight: record.avg_birth_weight as number | undefined,
  }
}

export default function PigBreedingApp() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "breeding" | "sows" | "calendar" | "reports"
  >("dashboard")
  const [deliveryDialog, setDeliveryDialog] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  // Fetch data
  const { data: records, error: recordsError, isLoading: recordsLoading } = useSWR<
    Record<string, unknown>[]
  >("/api/breeding", fetcher, { refreshInterval: 30000 })

  const { data: stats, error: statsError } = useSWR(
    "/api/breeding/stats",
    fetcher,
    { refreshInterval: 30000 }
  )

  const { data: sowsData } = useSWR<Record<string, unknown>[]>(
    "/api/sows",
    fetcher,
    { refreshInterval: 60000 }
  )

  const { data: siresData } = useSWR<Record<string, unknown>[]>(
    "/api/sires",
    fetcher,
    { refreshInterval: 60000 }
  )

  const { data: reportStats } = useSWR(
    "/api/reports/stats",
    fetcher,
    { refreshInterval: 60000 }
  )

  // Transform data
  const transformedRecords: BreedingRecord[] = records
    ? records.map(transformRecord)
    : []

  const sows: Sow[] = sowsData
    ? sowsData.map((s: any) => ({
        id: s.id,
        sowId: s.sow_id,
        name: s.name,
        breed: s.breed,
        birthDate: s.birth_date ? new Date(s.birth_date) : undefined,
        status: s.status,
        notes: s.notes,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }))
    : []

  const sires: Sire[] = siresData
    ? siresData.map((s: any) => ({
        id: s.id,
        sireId: s.sire_id,
        name: s.name,
        breed: s.breed,
        sireType: s.sire_type,
        status: s.status,
        notes: s.notes,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }))
    : []

  // Calculate alerts
  const alerts: AlertItem[] = []
  const today = new Date()

  transformedRecords.forEach((record) => {
    const daysUntilCheck = Math.ceil(
      (record.firstCheckDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysUntilDue = Math.ceil(
      (record.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    // First check alert
    if (record.status === "pending-check" && daysUntilCheck <= 1 && daysUntilCheck >= 0) {
      alerts.push({
        id: `${record.id}-check`,
        type: "first-check",
        severity: "warning",
        title: "ตรวจท้องครั้งที่ 1",
        description: `ถึงเวลาตรวจท้องแม่พันธุ์ ${record.sowId}`,
        date: record.firstCheckDate,
        sowId: record.sowId,
      })
    }

    // Due soon alert
    if (record.status === "pregnant" && daysUntilDue <= 7 && daysUntilDue >= 0) {
      alerts.push({
        id: `${record.id}-due`,
        type: "due-soon",
        severity: "info",
        title: "ใกล้คลอด",
        description: `${record.sowId} กำหนดคลอดใน ${daysUntilDue} วัน`,
        date: record.dueDate,
        sowId: record.sowId,
      })
    }

    // Overdue alert
    if (record.status === "pregnant" && daysUntilDue < 0) {
      alerts.push({
        id: `${record.id}-overdue`,
        type: "overdue",
        severity: "danger",
        title: "เกินกำหนดคลอด",
        description: `${record.sowId} เกินกำหนดคลอด ${Math.abs(daysUntilDue)} วัน`,
        date: record.dueDate,
        sowId: record.sowId,
      })
    }
  })

  // API calls
  const addRecord = async (
    newRecord: Omit<BreedingRecord, "id" | "createdAt">
  ) => {
    try {
      const response = await fetch("/api/breeding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sow_id: newRecord.sowId,
          sire_id: newRecord.sireId,
          breeding_method: newRecord.breedingMethod,
          breeding_date: newRecord.breedingDate.toISOString().split("T")[0],
          first_check_date: newRecord.firstCheckDate.toISOString().split("T")[0],
          confirmation_date: newRecord.confirmDate.toISOString().split("T")[0],
          expected_due_date: newRecord.dueDate.toISOString().split("T")[0],
          notes: newRecord.notes,
        }),
      })

      if (response.ok) {
        mutate("/api/breeding")
        mutate("/api/breeding/stats")
      }
    } catch (error) {
      console.error("[v0] Error adding record:", error)
    }
  }

  const updateRecordStatus = async (
    id: string,
    status: BreedingStatus
  ) => {
    try {
      const response = await fetch(`/api/breeding/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        mutate("/api/breeding")
        mutate("/api/breeding/stats")
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    }
  }

  const recordDelivery = async (data: DeliveryData) => {
    if (!selectedRecordId) return

    try {
      const response = await fetch(`/api/breeding/${selectedRecordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "delivered",
          actual_delivery_date: data.actualDeliveryDate
            .toISOString()
            .split("T")[0],
          litter_size_born: data.litterSizeBorn,
          litter_size_alive: data.litterSizeAlive,
          litter_size_dead: data.litterSizeDead,
          litter_size_mummy: data.litterSizeMummy,
          avg_birth_weight: data.avgBirthWeight,
        }),
      })

      if (response.ok) {
        mutate("/api/breeding")
        mutate("/api/breeding/stats")
        setDeliveryDialog(false)
        setSelectedRecordId(null)
      }
    } catch (error) {
      console.error("[v0] Error recording delivery:", error)
    }
  }

  const addSow = async (sow: Omit<Sow, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/sows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sow_id: sow.sowId,
          name: sow.name,
          breed: sow.breed,
          birth_date: sow.birthDate?.toISOString().split("T")[0],
          status: sow.status,
          notes: sow.notes,
        }),
      })

      if (response.ok) {
        mutate("/api/sows")
      }
    } catch (error) {
      console.error("[v0] Error adding sow:", error)
    }
  }

  const addSire = async (sire: Omit<Sire, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/sires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sire_id: sire.sireId,
          name: sire.name,
          breed: sire.breed,
          sire_type: sire.sireType,
          status: sire.status,
          notes: sire.notes,
        }),
      })

      if (response.ok) {
        mutate("/api/sires")
      }
    } catch (error) {
      console.error("[v0] Error adding sire:", error)
    }
  }

  const updateSow = async (id: string, data: Partial<Sow>) => {
    try {
      const response = await fetch(`/api/sows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        mutate("/api/sows")
      }
    } catch (error) {
      console.error("[v0] Error updating sow:", error)
    }
  }

  const updateSire = async (id: string, data: Partial<Sire>) => {
    try {
      const response = await fetch(`/api/sires/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        mutate("/api/sires")
      }
    } catch (error) {
      console.error("[v0] Error updating sire:", error)
    }
  }

  const deleteSow = async (id: string) => {
    try {
      const response = await fetch(`/api/sows/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate("/api/sows")
      }
    } catch (error) {
      console.error("[v0] Error deleting sow:", error)
    }
  }

  const deleteSire = async (id: string) => {
    try {
      const response = await fetch(`/api/sires/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate("/api/sires")
      }
    } catch (error) {
      console.error("[v0] Error deleting sire:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none">PigBreed Pro</h1>
              <p className="text-xs text-muted-foreground">ระบบจัดการการผสมพันธุ์</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-4 text-lg font-semibold">ภาพรวมฟาร์ม</h2>
              <DashboardCards
                totalBreedings={stats?.totalBreedings || 0}
                pregnantCount={stats?.pregnant || 0}
                pendingCheckCount={stats?.pendingCheck || 0}
                dueSoonCount={stats?.dueSoon || 0}
              />
            </section>

            <section>
              <AlertsPanel alerts={alerts} />
            </section>
          </div>
        )}

        {/* Breeding Tab */}
        {activeTab === "breeding" && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-4 text-lg font-semibold">บันทึกการผสมพันธุ์</h2>
              <BreedingForm onSubmit={addRecord} />
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">รายการแม่พันธุ์</h2>
              {recordsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="size-8 text-primary" />
                </div>
              ) : recordsError ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                  เกิดข้อผิดพลาดในการโหลดข้อมูล
                </div>
              ) : (
                <ActiveRecords
                  records={transformedRecords}
                  onUpdateStatus={(id, status) => {
                    if (status === "delivered") {
                      setSelectedRecordId(id)
                      setDeliveryDialog(true)
                    } else {
                      updateRecordStatus(id, status)
                    }
                  }}
                />
              )}
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">วิเคราะห์ด้วย AI</h2>
              <AIAnalysis />
            </section>
          </div>
        )}

        {/* Sows Tab */}
        {activeTab === "sows" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">จัดการแม่พันธุ์และพ่อพันธุ์</h2>
            {recordsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="size-8 text-primary" />
              </div>
            ) : (
              <SowsManagement
                sows={sows}
                sires={sires}
                onAddSow={addSow}
                onAddSire={addSire}
                onUpdateSow={updateSow}
                onUpdateSire={updateSire}
                onDeleteSow={deleteSow}
                onDeleteSire={deleteSire}
              />
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">ปฏิทินการผสมพันธุ์</h2>
            {recordsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="size-8 text-primary" />
              </div>
            ) : (
              <CalendarView records={transformedRecords} />
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">รายงาน</h2>
            {recordsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="size-8 text-primary" />
              </div>
            ) : (
              <ReportsView records={transformedRecords} stats={reportStats} />
            )}
          </div>
        )}
      </main>

      {/* Delivery Dialog */}
      <DeliveryDialog
        open={deliveryDialog}
        onOpenChange={setDeliveryDialog}
        sowId={
          selectedRecordId
            ? transformedRecords.find((r) => r.id === selectedRecordId)?.sowId ||
              ""
            : ""
        }
        onSubmit={recordDelivery}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
