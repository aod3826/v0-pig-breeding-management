import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Get all breeding records
  const { data: records, error } = await supabase
    .from("breeding_records")
    .select("*")
    .order("breeding_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sevenDaysFromNow = new Date(today)
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  // Calculate stats
  const stats = {
    totalBreedings: records?.length || 0,
    pregnant: records?.filter(r => r.status === "pregnant").length || 0,
    pendingCheck: records?.filter(r => r.status === "pending-check").length || 0,
    delivered: records?.filter(r => r.status === "delivered").length || 0,
    repeat: records?.filter(r => r.status === "repeat" || r.status === "rebreed").length || 0,
    failed: records?.filter(r => r.status === "failed").length || 0,
    dueSoon: records?.filter(r => {
      if (r.status !== "pregnant") return false
      const dueDate = new Date(r.due_date)
      return dueDate >= today && dueDate <= sevenDaysFromNow
    }).length || 0,
  }

  // Monthly breeding data for charts (last 6 months)
  const monthlyData: { month: string; breedings: number; successful: number; failed: number }[] = []
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date()
    monthDate.setMonth(monthDate.getMonth() - i)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    
    const monthRecords = records?.filter(r => {
      const breedingDate = new Date(r.breeding_date)
      return breedingDate.getFullYear() === year && breedingDate.getMonth() === month
    }) || []

    const monthName = monthDate.toLocaleDateString("th-TH", { month: "short" })
    
    monthlyData.push({
      month: monthName,
      breedings: monthRecords.length,
      successful: monthRecords.filter(r => 
        r.status === "pregnant" || r.status === "delivered"
      ).length,
      failed: monthRecords.filter(r => 
        r.status === "repeat" || r.status === "rebreed" || r.status === "failed"
      ).length,
    })
  }

  // Status distribution for pie chart
  const statusDistribution = [
    { name: "รอตรวจท้อง", value: stats.pendingCheck, color: "#f59e0b" },
    { name: "ตั้งท้อง", value: stats.pregnant, color: "#22c55e" },
    { name: "คลอดแล้ว", value: stats.delivered, color: "#94a3b8" },
    { name: "ผสมซ้ำ", value: stats.repeat, color: "#ef4444" },
  ].filter(item => item.value > 0)

  // Upcoming due dates (next 30 days)
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  const upcomingDue = records
    ?.filter(r => {
      if (r.status !== "pregnant") return false
      const dueDate = new Date(r.due_date)
      return dueDate >= today && dueDate <= thirtyDaysFromNow
    })
    .map(r => ({
      sowId: r.sow_id,
      dueDate: r.due_date,
      daysUntil: Math.ceil(
        (new Date(r.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10) || []

  return NextResponse.json({
    stats,
    monthlyData,
    statusDistribution,
    upcomingDue,
  })
}
