"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { 
  Sparkles, 
  FileText, 
  Send, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Calendar
} from "lucide-react"
import { BreedingRecord } from "@/lib/types"

interface AIAnalysisProps {
  records: BreedingRecord[]
}

export function AIAnalysis({ records }: AIAnalysisProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [isAsking, setIsAsking] = useState(false)

  // Calculate stats for demo report
  const pregnantCount = records.filter(r => r.status === "pregnant").length
  const pendingCount = records.filter(r => r.status === "pending-check").length
  const rebreedCount = records.filter(r => r.status === "rebreed").length
  const successRate = records.length > 0 
    ? Math.round(((pregnantCount + records.filter(r => r.status === "delivered").length) / records.length) * 100)
    : 0

  const generateReport = async () => {
    setIsGenerating(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const reportText = `📊 รายงานสรุปประจำเดือน มีนาคม 2569

📈 สถิติการผสมพันธุ์
• จำนวนการผสมทั้งหมด: ${records.length} ครั้ง
• อัตราการตั้งท้องสำเร็จ: ${successRate}%
• กำลังตั้งท้อง: ${pregnantCount} ตัว
• รอตรวจท้อง: ${pendingCount} ตัว
• ต้องผสมซ้ำ: ${rebreedCount} ตัว

💡 ข้อเสนอแนะ
${rebreedCount > 0 ? `• ควรตรวจสอบสาเหตุการผสมไม่ติดใน ${rebreedCount} ตัว อาจเกิดจากเวลาผสมไม่เหมาะสม หรือคุณภาพน้ำเชื้อ` : '• อัตราการผสมติดอยู่ในเกณฑ์ดี'}
• แนะนำให้ตรวจสอบสภาพแวดล้อมและอาหารของแม่พันธุ์ที่กำลังตั้งท้อง
• ควรเตรียมคอกคลอดสำหรับแม่พันธุ์ที่จะครบกำหนดภายใน 2 สัปดาห์

🎯 เป้าหมายเดือนหน้า
• เพิ่มอัตราการผสมติดให้ได้ 85%+
• ลดจำนวนการผสมซ้ำ
• ติดตามสุขภาพแม่พันธุ์ตั้งท้องอย่างใกล้ชิด`

    setReport(reportText)
    setIsGenerating(false)
  }

  const askQuestion = async () => {
    if (!question.trim()) return
    
    setIsAsking(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Demo AI responses based on keywords
    let response = ""
    const q = question.toLowerCase()
    
    if (q.includes("ผสม") && (q.includes("ติด") || q.includes("สำเร็จ"))) {
      response = `จากข้อมูลในระบบ อัตราการผสมติดอยู่ที่ ${successRate}% 

ปัจจัยที่ส่งผลต่อการผสมติด:
1. เวลาที่เหมาะสมในการผสม (12-24 ชม. หลังพบอาการเป็นสัด)
2. คุณภาพน้ำเชื้อ/พ่อพันธุ์
3. สภาพร่างกายแม่พันธุ์
4. อุณหภูมิและสภาพแวดล้อม`
    } else if (q.includes("คลอด") || q.includes("ใกล้คลอด")) {
      const dueSoonCount = records.filter(r => {
        const daysUntilDue = Math.ceil(
          (r.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return r.status === "pregnant" && daysUntilDue <= 14 && daysUntilDue >= 0
      }).length
      
      response = `มีแม่พันธุ์ที่จะคลอดภายใน 14 วัน จำนวน ${dueSoonCount} ตัว

สิ่งที่ควรเตรียม:
1. ทำความสะอาดคอกคลอด
2. เตรียมโคมไฟให้ความอบอุ่น
3. เตรียมอุปกรณ์ช่วยคลอด
4. ตรวจสุขภาพแม่พันธุ์ก่อนคลอด`
    } else if (q.includes("ปัญหา") || q.includes("แนะนำ")) {
      response = `📋 สรุปปัญหาและข้อแนะนำ:

${rebreedCount > 0 ? `⚠️ พบการผสมไม่ติด ${rebreedCount} ครั้ง
- ตรวจสอบระบบสืบพันธุ์แม่พันธุ์
- ทบทวนเวลาการผสม
- ตรวจคุณภาพน้ำเชื้อ` : '✅ ไม่พบปัญหาการผสมไม่ติด'}

💡 ข้อแนะนำทั่วไป:
- บันทึกข้อมูลอย่างสม่ำเสมอ
- ตรวจท้องตามกำหนด
- เตรียมคอกคลอดล่วงหน้า`
    } else {
      response = `ขอบคุณสำหรับคำถาม! 

จากข้อมูลในฟาร์มของคุณ:
• มีการผสมพันธุ์ทั้งหมด ${records.length} ครั้ง
• อัตราความสำเร็จ ${successRate}%
• มีแม่พันธุ์ตั้งท้อง ${pregnantCount} ตัว

หากต้องการข้อมูลเฉพาะเจาะจง ลองถามเกี่ยวกับ:
- อัตราการผสมติด
- แม่พันธุ์ใกล้คลอด
- ข้อแนะนำในการจัดการ`
    }
    
    setAnswer(response)
    setIsAsking(false)
    setQuestion("")
  }

  return (
    <div className="space-y-4">
      {/* Generate Report Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">รายงาน AI ประจำเดือน</h3>
                <p className="text-sm text-muted-foreground">
                  วิเคราะห์ข้อมูลและสร้างรายงานสรุปอัตโนมัติ
                </p>
              </div>
            </div>
            <Button 
              onClick={generateReport}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Spinner className="size-4" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  สร้างรายงาน
                </>
              )}
            </Button>
          </div>

          {/* Report Display */}
          {report && (
            <div className="mt-4 rounded-lg border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {report}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Chat */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-info/10">
              <TrendingUp className="size-5 text-info" />
            </div>
            <div>
              <h3 className="font-medium">ถาม AI เกี่ยวกับฟาร์ม</h3>
              <p className="text-sm text-muted-foreground">
                วิเคราะห์และตอบคำถามจากข้อมูลในระบบ
              </p>
            </div>
          </div>

          {/* Answer Display */}
          {answer && (
            <div className="mb-4 rounded-lg border border-info/20 bg-info/5 p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-info" />
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {answer}
                </pre>
              </div>
            </div>
          )}

          {/* Question Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="พิมพ์คำถาม เช่น 'อัตราการผสมติดเป็นอย่างไร' หรือ 'มีแม่พันธุ์ใกล้คลอดกี่ตัว'"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px] resize-none bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  askQuestion()
                }
              }}
            />
            <Button 
              onClick={askQuestion}
              disabled={isAsking || !question.trim()}
              size="icon"
              className="size-10 shrink-0 self-end"
            >
              {isAsking ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>

          {/* Quick Questions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setQuestion("อัตราการผสมติดเป็นอย่างไร")}
            >
              อัตราการผสมติด
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setQuestion("มีแม่พันธุ์ใกล้คลอดกี่ตัว")}
            >
              แม่พันธุ์ใกล้คลอด
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setQuestion("ปัญหาและข้อแนะนำ")}
            >
              ข้อแนะนำ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
