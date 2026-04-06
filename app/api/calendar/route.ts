import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  // Get year and month from query params, default to current
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())

  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of month

  // Get all active breeding records
  const { data: records, error } = await supabase
    .from("breeding_records")
    .select("*")
    .in("status", ["pending-check", "pregnant"])
    .order("due_date", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group events by date
  interface CalendarEvent {
    sowId: string
    type: "check" | "confirm" | "due"
    date: string
    status: string
  }

  const events: CalendarEvent[] = []

  for (const record of records || []) {
    const firstCheckDate = new Date(record.first_check_date)
    const confirmDate = new Date(record.confirm_date)
    const dueDate = new Date(record.due_date)

    // Add first check event
    if (firstCheckDate >= startDate && firstCheckDate <= endDate) {
      events.push({
        sowId: record.sow_id,
        type: "check",
        date: record.first_check_date,
        status: record.status,
      })
    }

    // Add confirm event
    if (confirmDate >= startDate && confirmDate <= endDate) {
      events.push({
        sowId: record.sow_id,
        type: "confirm",
        date: record.confirm_date,
        status: record.status,
      })
    }

    // Add due date event
    if (dueDate >= startDate && dueDate <= endDate) {
      events.push({
        sowId: record.sow_id,
        type: "due",
        date: record.due_date,
        status: record.status,
      })
    }
  }

  // Group by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  for (const event of events) {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = []
    }
    eventsByDate[event.date].push(event)
  }

  return NextResponse.json({
    year,
    month,
    events: eventsByDate,
  })
}
