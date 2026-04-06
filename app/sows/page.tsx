"use client"

import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { SowCards } from "@/components/sow-cards"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { BreedingRecord, BreedingStatus } from "@/lib/types"
import { Search } from "lucide-react"
import { useState, useMemo } from "react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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

function calculateDaysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getNextEvent(record: BreedingRecord): SowCardData["nextEvent"] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If delivered or failed, no next event
  if (record.status === "delivered" || record.status === "failed") {
    return { type: null, date: null, daysUntil: null }
  }

  const firstCheck = new Date(record.firstCheckDate)
  const confirm = new Date(record.confirmDate)
  const due = new Date(record.dueDate)

  // Determine next event based on status and dates
  if (record.status === "pending-check") {
    const daysUntil = calculateDaysUntil(firstCheck)
    if (daysUntil >= -7) {
      return { type: "check", date: firstCheck, daysUntil }
    }
    // If first check is past, show confirm
    return { type: "confirm", date: confirm, daysUntil: calculateDaysUntil(confirm) }
  }

  if (record.status === "pregnant") {
    const confirmDays = calculateDaysUntil(confirm)
    if (confirmDays >= -7) {
      return { type: "confirm", date: confirm, daysUntil: confirmDays }
    }
    // Show due date
    return { type: "due", date: due, daysUntil: calculateDaysUntil(due) }
  }

  // For repeat/rebreed, show they need to be rebred
  return { type: null, date: null, daysUntil: null }
}

function transformRecordsToSowCards(records: Record<string, unknown>[]): SowCardData[] {
  // Group records by sow_id and get the latest for each
  const sowMap = new Map<string, BreedingRecord>()

  for (const record of records) {
    const sowId = record.sow_id as string
    const breedingDate = new Date(record.breeding_date as string)
    
    const existing = sowMap.get(sowId)
    if (!existing || breedingDate > existing.breedingDate) {
      sowMap.set(sowId, {
        id: record.id as string,
        sowId: sowId,
        breedingMethod: record.breeding_method as "artificial" | "natural",
        sireId: record.sire_id as string,
        breedingDate: breedingDate,
        firstCheckDate: new Date(record.first_check_date as string),
        confirmDate: new Date(record.confirm_date as string),
        dueDate: new Date(record.due_date as string),
        status: record.status as BreedingStatus,
        createdAt: new Date(record.created_at as string),
        notes: record.notes as string | undefined,
      })
    }
  }

  // Convert to SowCardData array
  const sowCards: SowCardData[] = []
  for (const [sowId, record] of sowMap) {
    sowCards.push({
      sowId,
      currentStatus: record.status,
      nextEvent: getNextEvent(record),
      latestBreeding: record,
    })
  }

  // Sort by next event date (soonest first), then by sow ID
  sowCards.sort((a, b) => {
    if (a.nextEvent.daysUntil === null && b.nextEvent.daysUntil === null) {
      return a.sowId.localeCompare(b.sowId)
    }
    if (a.nextEvent.daysUntil === null) return 1
    if (b.nextEvent.daysUntil === null) return -1
    return a.nextEvent.daysUntil - b.nextEvent.daysUntil
  })

  return sowCards
}

export default function SowsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: records, error, isLoading } = useSWR<Record<string, unknown>[]>(
    "/api/breeding",
    fetcher,
    { refreshInterval: 30000 }
  )

  const sowCards = useMemo(() => {
    if (!records) return []
    return transformRecordsToSowCards(records)
  }, [records])

  const filteredSows = useMemo(() => {
    if (!searchQuery.trim()) return sowCards
    const query = searchQuery.toLowerCase()
    return sowCards.filter(sow => 
      sow.sowId.toLowerCase().includes(query)
    )
  }, [sowCards, searchQuery])

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <main className="container space-y-4 px-4 py-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาเบอร์หูแม่พันธุ์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>แม่พันธุ์ทั้งหมด {sowCards.length} ตัว</span>
          {searchQuery && (
            <span>พบ {filteredSows.length} รายการ</span>
          )}
        </div>

        {/* Sow Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        ) : (
          <SowCards sows={filteredSows} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}
