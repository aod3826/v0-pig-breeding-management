import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Fetch all breeding records
    const { data: records, error } = await supabase
      .from("breeding_records")
      .select("*")
      .order("breeding_date", { ascending: false })

    if (error) {
      console.error("Error fetching records:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate comprehensive stats
    const today = new Date()
    const currentMonth = today.toLocaleString("th-TH", {
      month: "long",
      year: "numeric",
    })

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const monthlyRecords =
      records?.filter((r) => {
        const breedingDate = new Date(r.breeding_date)
        return breedingDate >= monthStart && breedingDate <= monthEnd
      }) || []

    const totalBreedings = records?.length || 0
    const pregnant = records?.filter((r) => r.status === "pregnant").length || 0
    const pendingCheck =
      records?.filter((r) => r.status === "pending-check").length || 0
    const delivered =
      records?.filter((r) => r.status === "delivered").length || 0
    const failed = records?.filter((r) => r.status === "failed").length || 0
    const repeat = records?.filter((r) => r.status === "repeat").length || 0

    const artificialCount =
      records?.filter((r) => r.breeding_method === "artificial").length || 0
    const naturalCount =
      records?.filter((r) => r.breeding_method === "natural").length || 0

    const successRate =
      totalBreedings > 0
        ? (((pregnant + delivered) / totalBreedings) * 100).toFixed(1)
        : 0

    const prompt = `
สร้างรายงานวิเคราะห์ฟาร์มสุกรประจำเดือน ${currentMonth} เป็นภาษาไทย

ข้อมูลสถิติ:
- จำนวนการผสมพันธุ์ทั้งหมด: ${totalBreedings} ครั้ง
- การผสมพันธุ์ในเดือนนี้: ${monthlyRecords.length} ครั้ง
- กำลังตั้งท้อง: ${pregnant} ตัว
- รอตรวจท้อง: ${pendingCheck} ตัว
- คลอดแล้ว: ${delivered} ตัว
- ผสมซ้ำ: ${repeat} ตัว
- ล้มเหลว: ${failed} ตัว
- ผสมเทียม: ${artificialCount} ครั้ง
- ผสมจริง: ${naturalCount} ครั้ง
- อัตราความสำเร็จ: ${successRate}%

รายละเอียดการผสมพันธุ์:
${JSON.stringify(records || [], null, 2)}

กรุณาสร้างรายงานที่ประกอบด้วย:
1. สรุปภาพรวมของฟาร์ม
2. การวิเคราะห์ประสิทธิภาพการผสมพันธุ์
3. แนวโน้มและรูปแบบที่พบ
4. คำแนะนำในการปรับปรุง
5. สิ่งที่ต้องดำเนินการในเดือนหน้า

ใช้รูปแบบที่อ่านง่าย มีหัวข้อชัดเจน
`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Save report to database
    const { error: saveError } = await supabase.from("ai_reports").insert({
      report_type: "monthly",
      report_month: currentMonth,
      content: text,
    })

    if (saveError) {
      console.error("Error saving report:", saveError)
    }

    return NextResponse.json({ report: text, month: currentMonth })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
