"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, PiggyBank, BarChart3, Calendar } from "lucide-react"

const navItems = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/sows", label: "แม่พันธุ์", icon: PiggyBank },
  { href: "/dashboard", label: "สถิติ", icon: BarChart3 },
  { href: "/calendar", label: "ปฏิทิน", icon: Calendar },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("size-5", isActive && "text-primary")} />
              <span className={cn("font-medium", isActive && "text-primary")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
