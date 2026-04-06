export type BreedingMethod = "artificial" | "natural"

export type SowStatus = "active" | "inactive" | "culled"

export interface Sow {
  id: string
  sowId: string
  name?: string
  birthDate?: Date
  status: SowStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Medication {
  id: string
  sowId: string
  medicationName: string
  dosage?: string
  administeredDate: Date
  administeredBy?: string
  reason?: string
  notes?: string
  createdAt: Date
}

export interface SowWithBreedingInfo extends Sow {
  currentStatus: BreedingStatus | null
  nextEvent: {
    type: "check" | "confirm" | "due" | null
    date: Date | null
    daysUntil: number | null
  }
  latestBreeding: BreedingRecord | null
}

export type BreedingStatus = 
  | "pending-check"  // รอตรวจท้อง
  | "pregnant"       // ตั้งท้อง
  | "repeat"         // ผสมซ้ำ (matches database)
  | "rebreed"        // ผสมซ้ำ (legacy)
  | "delivered"      // คลอดแล้ว
  | "failed"         // ล้มเหลว

export interface BreedingRecord {
  id: string
  sowId: string
  breedingMethod: BreedingMethod
  sireId: string
  breedingDate: Date
  firstCheckDate: Date    // +21 days
  confirmDate: Date       // +45 days
  dueDate: Date           // +114 days
  status: BreedingStatus
  createdAt: Date
  notes?: string
  pigletCount?: number    // จำนวนลูกสุกรเมื่อคลอด
  deliveredDate?: Date    // วันที่คลอดจริง
}

export interface DashboardStats {
  totalBreedings: number
  pregnantCount: number
  pendingCheckCount: number
  dueSoonCount: number
}

// Helper function to calculate important dates
export function calculateBreedingDates(breedingDate: Date) {
  const firstCheckDate = new Date(breedingDate)
  firstCheckDate.setDate(firstCheckDate.getDate() + 21)

  const confirmDate = new Date(breedingDate)
  confirmDate.setDate(confirmDate.getDate() + 45)

  const dueDate = new Date(breedingDate)
  dueDate.setDate(dueDate.getDate() + 114)

  return {
    firstCheckDate,
    confirmDate,
    dueDate,
  }
}

// Format date to Thai locale
export function formatDateThai(date: Date): string {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Get status label in Thai
export function getStatusLabel(status: BreedingStatus): string {
  const labels: Record<BreedingStatus, string> = {
    "pending-check": "รอตรวจท้อง",
    "pregnant": "ตั้งท้อง",
    "repeat": "ผสมซ้ำ",
    "rebreed": "ผสมซ้ำ",
    "delivered": "คลอดแล้ว",
    "failed": "ล้มเหลว",
  }
  return labels[status]
}

// Get status color class
export function getStatusColor(status: BreedingStatus): string {
  const colors: Record<BreedingStatus, string> = {
    "pending-check": "bg-warning/15 text-warning-foreground border-warning/30",
    "pregnant": "bg-success/15 text-success border-success/30",
    "repeat": "bg-destructive/15 text-destructive border-destructive/30",
    "rebreed": "bg-destructive/15 text-destructive border-destructive/30",
    "delivered": "bg-muted text-muted-foreground border-border",
    "failed": "bg-destructive/15 text-destructive border-destructive/30",
  }
  return colors[status]
}

// Get upcoming events for a breeding record
export interface UpcomingEvent {
  id: string
  sowId: string
  eventType: "first-check" | "confirm" | "due"
  eventDate: Date
  daysRemaining: number
  status: BreedingStatus
}

export function getUpcomingEvents(records: BreedingRecord[]): UpcomingEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const events: UpcomingEvent[] = []

  records.forEach((record) => {
    // Only include active records (pending-check or pregnant)
    if (record.status !== "pending-check" && record.status !== "pregnant") {
      return
    }

    const checkDays = (date: Date, type: UpcomingEvent["eventType"]) => {
      const eventDate = new Date(date)
      eventDate.setHours(0, 0, 0, 0)
      const daysRemaining = Math.ceil(
        (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      // Include events within the next 14 days or overdue (negative days)
      if (daysRemaining <= 14) {
        events.push({
          id: record.id,
          sowId: record.sowId,
          eventType: type,
          eventDate,
          daysRemaining,
          status: record.status,
        })
      }
    }

    if (record.status === "pending-check") {
      checkDays(record.firstCheckDate, "first-check")
    }
    if (record.status === "pregnant") {
      checkDays(record.dueDate, "due")
    }
  })

  // Sort by days remaining
  return events.sort((a, b) => a.daysRemaining - b.daysRemaining)
}

export function getEventLabel(eventType: UpcomingEvent["eventType"]): string {
  const labels: Record<UpcomingEvent["eventType"], string> = {
    "first-check": "ตรวจท้องครั้งที่ 1",
    "confirm": "ตรวจยืนยัน",
    "due": "กำหนดคลอด",
  }
  return labels[eventType]
}

export function getEventColorClass(eventType: UpcomingEvent["eventType"], daysRemaining: number): string {
  if (daysRemaining < 0) {
    return "bg-destructive/15 text-destructive border-destructive/30"
  }
  if (daysRemaining <= 3) {
    return "bg-warning/15 text-warning-foreground border-warning/30"
  }
  const colors: Record<UpcomingEvent["eventType"], string> = {
    "first-check": "bg-warning/10 text-accent border-warning/20",
    "confirm": "bg-info/10 text-info border-info/20",
    "due": "bg-success/10 text-success border-success/20",
  }
  return colors[eventType]
}
