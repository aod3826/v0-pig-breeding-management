import { streamText, convertToModelMessages } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const supabase = await createClient()

  // Fetch breeding records for context
  const { data: records } = await supabase
    .from("breeding_records")
    .select("*")
    .order("breeding_date", { ascending: false })

  // Calculate stats for context
  const today = new Date()
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  const totalBreedings = records?.length || 0
  const pregnant = records?.filter((r) => r.status === "pregnant").length || 0
  const pendingCheck =
    records?.filter((r) => r.status === "pending-check").length || 0
  const dueSoon =
    records?.filter((r) => {
      if (r.status !== "pregnant") return false
      const dueDate = new Date(r.due_date)
      return dueDate >= today && dueDate <= sevenDaysLater
    }).length || 0

  const farmContext = `
คุณเป็นผู้ช่วย AI สำหรับระบบจัดการการผสมพันธุ์สุกร ตอบคำถามเป็นภาษาไทย

ข้อมูลฟาร์มปัจจุบัน:
- จำนวนการผสมพันธุ์ทั้งหมด: ${totalBreedings} ครั้ง
- กำลังตั้งท้อง: ${pregnant} ตัว
- รอตรวจท้อง: ${pendingCheck} ตัว
- รอคลอดใน 7 วัน: ${dueSoon} ตัว

รายละเอียดการผสมพันธุ์:
${JSON.stringify(records || [], null, 2)}

ช่วยวิเคราะห์ข้อมูล ให้คำแนะนำ และตอบคำถามเกี่ยวกับการจัดการฟาร์มสุกร
`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: farmContext,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
