"use client"

import useSWR, { mutate } from "swr"
import { DashboardCards } from "@/components/dashboard-cards"
import { BreedingForm } from "@/components/breeding-form"
import { ActiveRecords } from "@/components/active-records"
import { AIAnalysis } from "@/components/ai-analysis"
import { BreedingRecord, BreedingStatus } from "@/lib/types"
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
    confirmDate: new Date(record.confirm_date as string),
    dueDate: new Date(record.due_date as string),
    status: record.status as BreedingStatus,
    createdAt: new Date(record.created_at as string),
    notes: record.notes as string | undefined,
  }
}

export default function PigBreedingApp() {
  const { data: records, error, isLoading } = useSWR<Record<string, unknown>[]>(
    "/api/breeding",
    fetcher,
    { refreshInterval: 30000 }
  )

  const { data: stats } = useSWR<{
    totalBreedings: number
    pregnant: number
    pendingCheck: number
    dueSoon: number
  }>("/api/breeding/stats", fetcher, { refreshInterval: 30000 })

  const transformedRecords: BreedingRecord[] = records
    ? records.map(transformRecord)
    : []

  const addRecord = async (newRecord: Omit<BreedingRecord, "id" | "createdAt">) => {
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
          confirm_date: newRecord.confirmDate.toISOString().split("T")[0],
          due_date: newRecord.dueDate.toISOString().split("T")[0],
          notes: newRecord.notes,
        }),
      })

      if (response.ok) {
        // Revalidate both endpoints
        mutate("/api/breeding")
        mutate("/api/breeding/stats")
      }
    } catch (error) {
      console.error("Error adding record:", error)
    }
  }

  const updateRecordStatus = async (id: string, status: BreedingStatus) => {
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
      console.error("Error updating status:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
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

      <main className="container space-y-6 px-4 py-6">
        {/* Dashboard Stats */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">ภาพรวมฟาร์ม</h2>
          <DashboardCards
            totalBreedings={stats?.totalBreedings || 0}
            pregnantCount={stats?.pregnant || 0}
            pendingCheckCount={stats?.pendingCheck || 0}
            dueSoonCount={stats?.dueSoon || 0}
          />
        </section>

        {/* Breeding Form */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">บันทึกการผสมพันธุ์</h2>
          <BreedingForm onSubmit={addRecord} />
        </section>

        {/* Active Records */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">รายการแม่พันธุ์</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </div>
          ) : (
            <ActiveRecords
              records={transformedRecords}
              onUpdateStatus={updateRecordStatus}
            />
          )}
        </section>

        {/* AI Analysis */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">วิเคราะห์ด้วย AI</h2>
          <AIAnalysis />
        </section>
      </main>

      {/* Bottom spacing for mobile */}
      <div className="h-8" />
    </div>
  )
}
