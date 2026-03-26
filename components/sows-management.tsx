"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  Users,
  X,
} from "lucide-react"
import { Sow, Sire } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SowsManagementProps {
  sows: Sow[]
  sires: Sire[]
  onAddSow?: (sow: Omit<Sow, "id" | "createdAt" | "updatedAt">) => void
  onAddSire?: (sire: Omit<Sire, "id" | "createdAt" | "updatedAt">) => void
  onUpdateSow?: (id: string, data: Partial<Sow>) => void
  onUpdateSire?: (id: string, data: Partial<Sire>) => void
  onDeleteSow?: (id: string) => void
  onDeleteSire?: (id: string) => void
}

export function SowsManagement({
  sows,
  sires,
  onAddSow,
  onAddSire,
  onUpdateSow,
  onUpdateSire,
  onDeleteSow,
  onDeleteSire,
}: SowsManagementProps) {
  const [tab, setTab] = useState("sows")
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})

  const handleAddSow = () => {
    setEditingId(null)
    setFormData({ sowId: "", name: "", breed: "", status: "active" })
    setShowDialog(true)
  }

  const handleAddSire = () => {
    setEditingId(null)
    setFormData({ sireId: "", name: "", breed: "", sireType: "natural", status: "active" })
    setShowDialog(true)
  }

  const handleSaveSow = () => {
    if (!formData.sowId.trim()) return
    if (editingId) {
      onUpdateSow?.(editingId, formData)
    } else {
      onAddSow?.(formData)
    }
    setShowDialog(false)
  }

  const handleSaveSire = () => {
    if (!formData.sireId.trim()) return
    if (editingId) {
      onUpdateSire?.(editingId, formData)
    } else {
      onAddSire?.(formData)
    }
    setShowDialog(false)
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sows">แม่พันธุ์ ({sows.length})</TabsTrigger>
          <TabsTrigger value="sires">พ่อพันธุ์/น้ำเชื้อ ({sires.length})</TabsTrigger>
        </TabsList>

        {/* Sows Tab */}
        <TabsContent value="sows" className="space-y-4 mt-6">
          <Button onClick={handleAddSow} className="w-full gap-2">
            <Plus className="size-4" />
            เพิ่มแม่พันธุ์ใหม่
          </Button>

          {sows.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <Empty>
                  <EmptyMedia variant="icon">
                    <Users className="size-5 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>ยังไม่มีแม่พันธุ์</EmptyTitle>
                  <EmptyDescription>
                    เพิ่มแม่พันธุ์เพื่อเริ่มจัดการฟาร์ม
                  </EmptyDescription>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sows.map((sow) => (
                <Card key={sow.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{sow.sowId}</span>
                          <Badge
                            variant={
                              sow.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {sow.status === "active"
                              ? "ใช้งาน"
                              : sow.status === "inactive"
                                ? "พักการใช้"
                                : "ตัดสต๊อก"}
                          </Badge>
                        </div>
                        {sow.name && (
                          <p className="text-sm text-muted-foreground">
                            {sow.name}
                          </p>
                        )}
                        {sow.breed && (
                          <p className="text-xs text-muted-foreground">
                            สายพันธุ์: {sow.breed}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingId(sow.id)
                              setFormData(sow)
                              setShowDialog(true)
                            }}
                            className="gap-2"
                          >
                            <Edit2 className="size-4" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteSow?.(sow.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sires Tab */}
        <TabsContent value="sires" className="space-y-4 mt-6">
          <Button onClick={handleAddSire} className="w-full gap-2">
            <Plus className="size-4" />
            เพิ่มพ่อพันธุ์/น้ำเชื้อใหม่
          </Button>

          {sires.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <Empty>
                  <EmptyMedia variant="icon">
                    <Users className="size-5 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>ยังไม่มีพ่อพันธุ์/น้ำเชื้อ</EmptyTitle>
                  <EmptyDescription>
                    เพิ่มพ่อพันธุ์หรือน้ำเชื้อเพื่อเริ่มการผสมพันธุ์
                  </EmptyDescription>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sires.map((sire) => (
                <Card key={sire.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {sire.sireId}
                          </span>
                          <Badge
                            variant={
                              sire.sireType === "natural"
                                ? "outline"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {sire.sireType === "natural"
                              ? "ผสมจริง"
                              : "น้ำเชื้อ"}
                          </Badge>
                          <Badge
                            variant={
                              sire.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {sire.status === "active"
                              ? "ใช้งาน"
                              : "พักการใช้"}
                          </Badge>
                        </div>
                        {sire.name && (
                          <p className="text-sm text-muted-foreground">
                            {sire.name}
                          </p>
                        )}
                        {sire.breed && (
                          <p className="text-xs text-muted-foreground">
                            สายพันธุ์: {sire.breed}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingId(sire.id)
                              setFormData(sire)
                              setShowDialog(true)
                            }}
                            className="gap-2"
                          >
                            <Edit2 className="size-4" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteSire?.(sire.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tab === "sows"
                ? editingId
                  ? "แก้ไขแม่พันธุ์"
                  : "เพิ่มแม่พันธุ์ใหม่"
                : editingId
                  ? "แก้ไขพ่อพันธุ์/น้ำเชื้อ"
                  : "เพิ่มพ่อพันธุ์/น้ำเชื้อใหม่"}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>
                {tab === "sows" ? "เบอร์หูแม่พันธุ์" : "รหัสพ่อพันธุ์/น้ำเชื้อ"}
              </FieldLabel>
              <Input
                value={formData[tab === "sows" ? "sowId" : "sireId"] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [tab === "sows" ? "sowId" : "sireId"]: e.target.value,
                  })
                }
                placeholder="เช่น S-001"
              />
            </Field>
            <Field>
              <FieldLabel>ชื่อ (ไม่บังคับ)</FieldLabel>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ชื่อเล่น"
              />
            </Field>
            <Field>
              <FieldLabel>สายพันธุ์ (ไม่บังคับ)</FieldLabel>
              <Input
                value={formData.breed || ""}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                placeholder="เช่น Landrace, Yorkshire"
              />
            </Field>
            {tab === "sires" && (
              <Field>
                <FieldLabel>ประเภท</FieldLabel>
                <div className="flex gap-2">
                  <Button
                    variant={
                      formData.sireType === "natural"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFormData({ ...formData, sireType: "natural" })
                    }
                    className="flex-1"
                  >
                    ผสมจริง
                  </Button>
                  <Button
                    variant={
                      formData.sireType === "ai" ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData({ ...formData, sireType: "ai" })
                    }
                    className="flex-1"
                  >
                    น้ำเชื้อ
                  </Button>
                </div>
              </Field>
            )}
          </FieldGroup>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={() =>
                tab === "sows" ? handleSaveSow() : handleSaveSire()
              }
              disabled={
                !formData[tab === "sows" ? "sowId" : "sireId"]?.trim()
              }
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
