export type BreedingMethod = "artificial" | "natural"

export type BreedingStatus = 
  | "pending-check"  // รอตรวจท้อง
  | "pregnant"       // ตั้งท้อง
  | "repeat"         // ผสมซ้ำ (matches database)
  | "rebreed"        // ผสมซ้ำ (legacy)
  | "delivered"      // คลอดแล้ว
  | "failed"         // ล้มเหลว

export type SowStatus = "active" | "inactive" | "culled"
export type SireStatus = "active" | "inactive"
export type SireType = "natural" | "ai"

// Sow (แม่พันธุ์)
export interface Sow {
  id: string
  sowId: string          // เบอร์หู
  name?: string
  breed?: string
  birthDate?: Date
  status: SowStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
  // Computed fields
  breedingCount?: number
  lastBreedingDate?: Date
}

// Sire (พ่อพันธุ์/น้ำเชื้อ)
export interface Sire {
  id: string
  sireId: string         // รหัสน้ำเชื้อ/พ่อพันธุ์
  name?: string
  breed?: string
  sireType: SireType     // natural = ผสมจริง, ai = น้ำเชื้อ
  status: SireStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Delivery data for recording birth results
export interface DeliveryData {
  actualDeliveryDate: Date
  litterSizeBorn: number
  litterSizeAlive: number
  litterSizeDead: number
  litterSizeMummy: number
  avgBirthWeight?: number
  notes?: string
}

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
  // Delivery fields
  actualDeliveryDate?: Date
  litterSizeBorn?: number
  litterSizeAlive?: number
  litterSizeDead?: number
  litterSizeMummy?: number
  avgBirthWeight?: number
}

// Alert types for notifications
export type AlertType = "first-check" | "confirm-check" | "due-soon" | "overdue"
export type AlertSeverity = "warning" | "info" | "danger"

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  date: Date
  record: BreedingRecord
}

// Report statistics
export interface MonthlyStats {
  month: string           // YYYY-MM
  totalBreedings: number
  pregnantCount: number
  deliveredCount: number
  rebreedCount: number
}

export interface StatusDistribution {
  status: BreedingStatus
  count: number
  percentage: number
}

export interface DeliveryStats {
  avgLitterSize: number
  avgAliveRate: number
  avgBirthWeight: number
  totalDeliveries: number
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
