"use client"

import { useState } from "react"
import { DashboardCards } from "@/components/dashboard-cards"
import { BreedingForm } from "@/components/breeding-form"
import { ActiveRecords } from "@/components/active-records"
import { AIAnalysis } from "@/components/ai-analysis"
import { BreedingRecord, BreedingStatus } from "@/lib/types"

// Helper function to create dates consistently
function createDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00.000Z")
}

// Mock data for demonstration - using ISO date strings for consistent hydration
const initialRecords: BreedingRecord[] = [
  {
    id: "1",
    sowId: "S-001",
    breedingMethod: "artificial",
    sireId: "B-101",
    breedingDate: createDate("2026-03-01"),
    firstCheckDate: createDate("2026-03-22"),
    confirmDate: createDate("2026-04-15"),
    dueDate: createDate("2026-06-23"),
    status: "pregnant",
    createdAt: createDate("2026-03-01"),
  },
  {
    id: "2",
    sowId: "S-002",
    breedingMethod: "natural",
    sireId: "B-102",
    breedingDate: createDate("2026-03-10"),
    firstCheckDate: createDate("2026-03-31"),
    confirmDate: createDate("2026-04-24"),
    dueDate: createDate("2026-07-02"),
    status: "pending-check",
    createdAt: createDate("2026-03-10"),
  },
  {
    id: "3",
    sowId: "S-003",
    breedingMethod: "artificial",
    sireId: "B-103",
    breedingDate: createDate("2026-02-01"),
    firstCheckDate: createDate("2026-02-22"),
    confirmDate: createDate("2026-03-18"),
    dueDate: createDate("2026-05-26"),
    status: "pregnant",
    createdAt: createDate("2026-02-01"),
  },
  {
    id: "4",
    sowId: "S-004",
    breedingMethod: "natural",
    sireId: "B-104",
    breedingDate: createDate("2026-03-18"),
    firstCheckDate: createDate("2026-04-08"),
    confirmDate: createDate("2026-05-02"),
    dueDate: createDate("2026-07-10"),
    status: "pending-check",
    createdAt: createDate("2026-03-18"),
  },
]

export default function PigBreedingApp() {
  const [records, setRecords] = useState<BreedingRecord[]>(initialRecords)

  const addRecord = (newRecord: Omit<BreedingRecord, "id" | "createdAt">) => {
    const record: BreedingRecord = {
      ...newRecord,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setRecords((prev) => [record, ...prev])
  }

  const updateRecordStatus = (id: string, status: BreedingStatus) => {
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, status } : record))
    )
  }

  // Calculate dashboard stats
  const totalBreedings = records.length
  const pregnantCount = records.filter((r) => r.status === "pregnant").length
  const pendingCheckCount = records.filter((r) => r.status === "pending-check").length
  
  const today = new Date()
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const dueSoonCount = records.filter((r) => {
    return r.status === "pregnant" && r.dueDate <= sevenDaysFromNow && r.dueDate >= today
  }).length

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
            totalBreedings={totalBreedings}
            pregnantCount={pregnantCount}
            pendingCheckCount={pendingCheckCount}
            dueSoonCount={dueSoonCount}
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
          <ActiveRecords records={records} onUpdateStatus={updateRecordStatus} />
        </section>

        {/* AI Analysis */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">วิเคราะห์ด้วย AI</h2>
          <AIAnalysis records={records} />
        </section>
      </main>

      {/* Bottom spacing for mobile */}
      <div className="h-8" />
    </div>
  )
}
