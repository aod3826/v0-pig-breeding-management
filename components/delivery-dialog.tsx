"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { DeliveryData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sowId: string
  onSubmit: (data: DeliveryData) => void
}

export function DeliveryDialog({
  open,
  onOpenChange,
  sowId,
  onSubmit,
}: DeliveryDialogProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [litterBorn, setLitterBorn] = useState("")
  const [litterAlive, setLitterAlive] = useState("")
  const [litterDead, setLitterDead] = useState("")
  const [litterMummy, setLitterMummy] = useState("")
  const [birthWeight, setBirthWeight] = useState("")

  const handleSubmit = () => {
    if (!litterBorn.trim()) return

    onSubmit({
      actualDeliveryDate: date,
      litterSizeBorn: parseInt(litterBorn) || 0,
      litterSizeAlive: parseInt(litterAlive) || 0,
      litterSizeDead: parseInt(litterDead) || 0,
      litterSizeMummy: parseInt(litterMummy) || 0,
      avgBirthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
    })

    // Reset form
    setDate(new Date())
    setLitterBorn("")
    setLitterAlive("")
    setLitterDead("")
    setLitterMummy("")
    setBirthWeight("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>บันทึกผลการคลอด - {sowId}</DialogTitle>
        </DialogHeader>
        <FieldGroup className="space-y-4">
          <Field>
            <FieldLabel>วันที่คลอด</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {date ? (
                    format(date, "d MMMM yyyy", { locale: th })
                  ) : (
                    <span>เลือกวันที่</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>ลูกเกิด (ตัว)*</FieldLabel>
              <Input
                type="number"
                min="0"
                value={litterBorn}
                onChange={(e) => setLitterBorn(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field>
              <FieldLabel>ลูกเป็น (ตัว)</FieldLabel>
              <Input
                type="number"
                min="0"
                value={litterAlive}
                onChange={(e) => setLitterAlive(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field>
              <FieldLabel>ลูกตาย (ตัว)</FieldLabel>
              <Input
                type="number"
                min="0"
                value={litterDead}
                onChange={(e) => setLitterDead(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field>
              <FieldLabel>ลูกมัมมี่ (ตัว)</FieldLabel>
              <Input
                type="number"
                min="0"
                value={litterMummy}
                onChange={(e) => setLitterMummy(e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>น้ำหนักแรกเกิดเฉลี่ย (กก.)</FieldLabel>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={birthWeight}
              onChange={(e) => setBirthWeight(e.target.value)}
              placeholder="เช่น 1.2"
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!litterBorn.trim()}
          >
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
