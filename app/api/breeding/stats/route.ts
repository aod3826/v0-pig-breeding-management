import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all breeding records
    const { data: records, error } = await supabase
      .from("breeding_records")
      .select("*")

    if (error) {
      console.error("Error fetching stats:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate statistics
    const today = new Date()
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(today.getDate() + 7)

    const totalBreedings = records?.length || 0
    const pregnant = records?.filter((r) => r.status === "pregnant").length || 0
    const pendingCheck =
      records?.filter((r) => r.status === "pending-check").length || 0

    // Count records due within 7 days
    const dueSoon =
      records?.filter((r) => {
        if (r.status !== "pregnant") return false
        const dueDate = new Date(r.due_date)
        return dueDate >= today && dueDate <= sevenDaysLater
      }).length || 0

    return NextResponse.json({
      totalBreedings,
      pregnant,
      pendingCheck,
      dueSoon,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
