"use client"

import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Plus,
  Users,
  Calendar,
  FileText,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: "dashboard" | "breeding" | "sows" | "calendar" | "reports"
  onTabChange: (tab: "dashboard" | "breeding" | "sows" | "calendar" | "reports") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "dashboard", label: "ภาพรวม", icon: Home },
    { id: "breeding", label: "ผสมพันธุ์", icon: Plus },
    { id: "sows", label: "แม่พันธุ์", icon: Users },
    { id: "calendar", label: "ปฏิทิน", icon: Calendar },
    { id: "reports", label: "รายงาน", icon: FileText },
  ] as const

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(id as typeof activeTab)}
            className={cn(
              "flex-1 flex-col gap-1 h-auto py-3 rounded-none border-0",
              activeTab === id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="size-5" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  )
}
