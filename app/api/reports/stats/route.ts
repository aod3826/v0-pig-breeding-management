import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get("month") // YYYY-MM format
    const year = searchParams.get("year")

    // Fetch all breeding records
    const { data: records, error: fetchError } = await supabase
      .from("breeding_records")
      .select("*")
      .order("breeding_date", { ascending: false })

    if (fetchError) {
      console.error("[v0] Error fetching records:", fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    if (!records || records.length === 0) {
      return NextResponse.json({
        totalBreedings: 0,
        statusDistribution: [],
        monthlyStats: [],
        deliveryStats: {
          avgLitterSize: 0,
          avgAliveRate: 0,
          avgBirthWeight: 0,
          totalDeliveries: 0,
        },
      })
    }

    // Filter by month if provided
    let filtered = records
    if (month) {
      filtered = records.filter((r) => {
        const recordMonth = new Date(r.breeding_date)
          .toISOString()
          .substring(0, 7)
        return recordMonth === month
      })
    } else if (year) {
      filtered = records.filter((r) => {
        const recordYear = new Date(r.breeding_date).getFullYear().toString()
        return recordYear === year
      })
    }

    // Calculate status distribution
    const statusCount: Record<string, number> = {}
    filtered.forEach((r) => {
      statusCount[r.status] = (statusCount[r.status] || 0) + 1
    })

    const statusDistribution = Object.entries(statusCount).map(
      ([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / filtered.length) * 100),
      })
    )

    // Calculate delivery statistics
    const delivered = filtered.filter((r) => r.actual_delivery_date)
    let avgLitterSize = 0
    let avgAliveRate = 0
    let avgBirthWeight = 0

    if (delivered.length > 0) {
      const totalLitterSize = delivered.reduce(
        (sum, r) => sum + (r.litter_size_born || 0),
        0
      )
      const totalAlive = delivered.reduce(
        (sum, r) => sum + (r.litter_size_alive || 0),
        0
      )
      const totalWeight = delivered.reduce(
        (sum, r) => sum + (r.avg_birth_weight || 0),
        0
      )

      avgLitterSize = parseFloat((totalLitterSize / delivered.length).toFixed(2))
      avgAliveRate = parseFloat(((totalAlive / totalLitterSize) * 100).toFixed(2))
      avgBirthWeight = parseFloat((totalWeight / delivered.length).toFixed(2))
    }

    // Calculate monthly statistics
    const monthlyMap: Record<string, any> = {}
    records.forEach((r) => {
      const monthKey = new Date(r.breeding_date).toISOString().substring(0, 7)
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          totalBreedings: 0,
          pregnantCount: 0,
          deliveredCount: 0,
          rebreedCount: 0,
        }
      }

      monthlyMap[monthKey].totalBreedings += 1
      if (r.status === "pregnant") monthlyMap[monthKey].pregnantCount += 1
      if (r.status === "delivered") monthlyMap[monthKey].deliveredCount += 1
      if (r.status === "re_breed" || r.status === "repeat") monthlyMap[monthKey].rebreedCount += 1
    })

    const monthlyStats = Object.values(monthlyMap).sort((a, b) =>
      b.month.localeCompare(a.month)
    )

    return NextResponse.json({
      totalBreedings: filtered.length,
      statusDistribution,
      monthlyStats,
      deliveryStats: {
        avgLitterSize,
        avgAliveRate,
        avgBirthWeight,
        totalDeliveries: delivered.length,
      },
    })
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/reports/stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
