"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarIcon, Syringe, PiggyBank, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { 
  BreedingMethod, 
  BreedingRecord, 
  calculateBreedingDates, 
  formatDateThai 
} from "@/lib/types"

interface BreedingFormProps {
  onSubmit: (record: Omit<BreedingRecord, "id" | "createdAt">) => void
}

export function BreedingForm({ onSubmit }: BreedingFormProps) {
  const [sowId, setSowId] = useState("")
  const [method, setMethod] = useState<BreedingMethod>("artificial")
  const [sireId, setSireId] = useState("")
  const [breedingDate, setBreedingDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Calculate important dates
  const calculatedDates = useMemo(() => {
    return calculateBreedingDates(breedingDate)
  }, [breedingDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sowId.trim() || !sireId.trim()) {
      return
    }

    onSubmit({
      sowId: sowId.trim(),
      breedingMethod: method,
      sireId: sireId.trim(),
      breedingDate,
      firstCheckDate: calculatedDates.firstCheckDate,
      confirmDate: calculatedDates.confirmDate,
      dueDate: calculatedDates.dueDate,
      status: "pending-check",
    })

    // Reset form
    setSowId("")
    setSireId("")
    setBreedingDate(new Date())
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            {/* Sow ID */}
            <Field>
              <FieldLabel htmlFor="sowId">เบอร์หูแม่พันธุ์</FieldLabel>
              <Input
                id="sowId"
                placeholder="เช่น S-001"
                value={sowId}
                onChange={(e) => setSowId(e.target.value)}
                className="bg-background"
              />
            </Field>

            {/* Breeding Method */}
            <Field>
              <FieldLabel>วิธีผสม</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={method === "artificial" ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-2",
                    method === "artificial" && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setMethod("artificial")}
                >
                  <Syringe className="size-4" />
                  ผสมเทียม
                </Button>
                <Button
                  type="button"
                  variant={method === "natural" ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-2",
                    method === "natural" && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setMethod("natural")}
                >
                  <PiggyBank className="size-4" />
                  ผสมจริง
                </Button>
              </div>
            </Field>

            {/* Sire ID */}
            <Field>
              <FieldLabel htmlFor="sireId">
                {method === "artificial" ? "รหัสน้ำเชื้อ" : "รหัสพ่อพันธุ์"}
              </FieldLabel>
              <Input
                id="sireId"
                placeholder={method === "artificial" ? "เช่น SP-101" : "เช่น B-001"}
                value={sireId}
                onChange={(e) => setSireId(e.target.value)}
                className="bg-background"
              />
            </Field>

            {/* Breeding Date */}
            <Field>
              <FieldLabel>วันที่ผสม</FieldLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background",
                      !breedingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {breedingDate ? (
                      format(breedingDate, "d MMMM yyyy", { locale: th })
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={breedingDate}
                    onSelect={(date) => {
                      if (date) {
                        setBreedingDate(date)
                        setIsCalendarOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>

          {/* Calculated Dates Display */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="mb-3 text-sm font-medium text-primary">วันสำคัญที่คำนวณได้</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-md bg-background p-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-accent">
                  21
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ตรวจท้องครั้งที่ 1</p>
                  <p className="text-sm font-medium">
                    {formatDateThai(calculatedDates.firstCheckDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-background p-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-info/20 text-xs font-bold text-info">
                  45
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ตรวจยืนยัน</p>
                  <p className="text-sm font-medium">
                    {formatDateThai(calculatedDates.confirmDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-background p-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-success/20 text-xs font-bold text-success">
                  114
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">กำหนดคลอด</p>
                  <p className="text-sm font-medium">
                    {formatDateThai(calculatedDates.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={!sowId.trim() || !sireId.trim()}
          >
            <Check className="size-4" />
            บันทึกการผสมพันธุ์
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
