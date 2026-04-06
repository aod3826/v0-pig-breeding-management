"use client"

import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts"
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Baby,
  RefreshCw,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface DashboardData {
  stats: {
    totalBreedings: number
    pregnant: number
    pendingCheck: number
    delivered: number
    repeat: number
    failed: number
    dueSoon: number
  }
  monthlyData: Array<{
    month: string
    breedings: number
    successful: number
    failed: number
  }>
  statusDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  upcomingDue: Array<{
    sowId: string
    dueDate: string
    daysUntil: number
  }>
}

// Color palette
const COLORS = {
  primary: "#22c55e",
  warning: "#f59e0b",
  muted: "#94a3b8",
  destructive: "#ef4444",
  info: "#3b82f6",
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardData>(
    "/api/dashboard",
    fetcher,
    { refreshInterval: 60000 }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader />
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8 text-primary" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader />
        <div className="container px-4 py-8">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const { stats, monthlyData, statusDistribution, upcomingDue } = data

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <main className="container space-y-6 px-4 py-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Activity}
            label="การผสมทั้งหมด"
            value={stats.totalBreedings}
            iconColor="text-info"
          />
          <StatCard
            icon={CheckCircle2}
            label="ตั้งท้อง"
            value={stats.pregnant}
            iconColor="text-primary"
          />
          <StatCard
            icon={Clock}
            label="รอตรวจท้อง"
            value={stats.pendingCheck}
            iconColor="text-warning"
          />
          <StatCard
            icon={Baby}
            label="รอคลอด 7 วัน"
            value={stats.dueSoon}
            iconColor="text-destructive"
          />
        </div>

        {/* Monthly Breeding Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              สถิติการผสมรายเดือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                breedings: {
                  label: "การผสม",
                  color: COLORS.info,
                },
                successful: {
                  label: "สำเร็จ",
                  color: COLORS.primary,
                },
                failed: {
                  label: "ไม่สำเร็จ",
                  color: COLORS.destructive,
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="successful"
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    name="สำเร็จ"
                  />
                  <Bar
                    dataKey="failed"
                    fill={COLORS.destructive}
                    radius={[4, 4, 0, 0]}
                    name="ไม่สำเร็จ"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        {statusDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="size-4" />
                สัดส่วนสถานะปัจจุบัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={statusDistribution.reduce((acc, item) => {
                  acc[item.name] = { label: item.name, color: item.color }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Due List */}
        {upcomingDue.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Baby className="size-4" />
                กำหนดคลอดเร็ว ๆ นี้
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingDue.map((item) => (
                <Link
                  key={item.sowId}
                  href={`/sows/${item.sowId}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium">{item.sowId}</span>
                  <span className={
                    item.daysUntil <= 3 ? "text-destructive font-medium" :
                    item.daysUntil <= 7 ? "text-warning font-medium" :
                    "text-muted-foreground"
                  }>
                    {item.daysUntil === 0 ? "วันนี้" :
                     item.daysUntil === 1 ? "พรุ่งนี้" :
                     `อีก ${item.daysUntil} วัน`}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {stats.totalBreedings === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">ยังไม่มีข้อมูลการผสมพันธุ์</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เริ่มบันทึกการผสมพันธุ์ที่หน้าหลักเพื่อดูสถิติ
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value,
  iconColor = "text-primary"
}: { 
  icon: React.ElementType
  label: string
  value: number
  iconColor?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${iconColor}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
