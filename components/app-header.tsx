"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "PigBreed Pro", subtitle: "ระบบจัดการการผสมพันธุ์" },
  "/sows": { title: "แม่พันธุ์", subtitle: "รายการแม่พันธุ์ทั้งหมด" },
  "/dashboard": { title: "สถิติฟาร์ม", subtitle: "กราฟและรายงาน" },
  "/calendar": { title: "ปฏิทิน", subtitle: "กำหนดการคลอด" },
}

interface AppHeaderProps {
  backHref?: string
  title?: string
  subtitle?: string
}

export function AppHeader({ backHref, title, subtitle }: AppHeaderProps) {
  const pathname = usePathname()
  
  // Check if we're on a detail page
  const isDetailPage = pathname.includes("/sows/") && pathname !== "/sows"
  const showBack = backHref || isDetailPage
  
  const pageInfo = pageTitles[pathname] || { title: title || "PigBreed Pro" }
  const displayTitle = title || pageInfo.title
  const displaySubtitle = subtitle || pageInfo.subtitle

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center gap-2 px-4">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            asChild
          >
            <Link href={backHref || "/sows"}>
              <ChevronLeft className="size-5" />
              <span className="sr-only">กลับ</span>
            </Link>
          </Button>
        )}
        
        {!showBack && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        )}
        
        <div className="flex-1">
          <h1 className="text-base font-semibold leading-none">{displayTitle}</h1>
          {displaySubtitle && (
            <p className="text-xs text-muted-foreground">{displaySubtitle}</p>
          )}
        </div>
      </div>
    </header>
  )
}
