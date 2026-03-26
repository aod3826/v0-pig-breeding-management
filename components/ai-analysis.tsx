"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { 
  Sparkles, 
  FileText, 
  Send, 
  TrendingUp,
  User,
  Bot
} from "lucide-react"
import { cn } from "@/lib/utils"

// Helper to get text from message parts
function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function AIAnalysis() {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [input, setInput] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      const response = await fetch("/api/ai/report", {
        method: "POST",
      })
      const data = await response.json()
      if (data.report) {
        setReport(data.report)
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage({ text: question })
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
                <h3 className="text-lg font-semibold">รายงาน AI ประจำเดือน</h3>
                <p className="text-base text-muted-foreground">
                  วิเคราะห์ข้อมูลและสร้างรายงานสรุปอัตโนมัติ
                </p>
              </div>
            </div>
            <Button 
              onClick={generateReport}
              disabled={isGeneratingReport}
              className="gap-2"
            >
              {isGeneratingReport ? (
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
                  <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
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
              <h3 className="text-lg font-semibold">ถาม AI เกี่ยวกับฟาร์ม</h3>
              <p className="text-base text-muted-foreground">
                วิเคราะห์และตอบคำถามจากข้อมูลในระบบ
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="size-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-4 py-3 text-base",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    )}
                  >
                    <pre className="whitespace-pre-wrap font-sans">
                      {getMessageText(message)}
                    </pre>
                  </div>
                  {message.role === "user" && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                    <Spinner className="size-4" />
                    <span className="text-base text-muted-foreground">กำลังพิมพ์...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="พิมพ์คำถาม เช่น 'อัตราการผสมติดเป็นอย่างไร' หรือ 'มีแม่พันธุ์ใกล้คลอดกี่ตัว'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] resize-none bg-background text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="size-12 shrink-0 self-end"
            >
              {isLoading ? (
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
                  className="text-sm"
              onClick={() => handleQuickQuestion("อัตราการผสมติดเป็นอย่างไร")}
              disabled={isLoading}
            >
              อัตราการผสมติด
            </Button>
            <Button
              variant="outline"
              size="sm"
                  className="text-sm"
              onClick={() => handleQuickQuestion("มีแม่พันธุ์ใกล้คลอดกี่ตัว")}
              disabled={isLoading}
            >
              แม่พันธุ์ใกล้คลอด
            </Button>
            <Button
              variant="outline"
              size="sm"
                  className="text-sm"
              onClick={() => handleQuickQuestion("ปัญหาและข้อแนะนำสำหรับฟาร์ม")}
              disabled={isLoading}
            >
              ข้อแนะนำ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
