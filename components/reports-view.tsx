"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { FileText, Printer } from "lucide-react"
import { BreedingRecord, MonthlyStats, StatusDistribution, DeliveryStats } from "@/lib/types"

interface ReportsViewProps {
  records: BreedingRecord[]
  stats?: {
    totalBreedings: number
    statusDistribution: StatusDistribution[]
    monthlyStats: MonthlyStats[]
    deliveryStats: DeliveryStats
  }
}

const statusColors: Record<string, string> = {
  "pending-check": "#f59e0b",
  pregnant: "#3b82f6",
  delivered: "#10b981",
  repeat: "#ef4444",
  failed: "#6b7280",
}

const statusLabels: Record<string, string> = {
  "pending-check": "รอตรวจท้อง",
  pregnant: "ตั้งท้อง",
  delivered: "คลอดแล้ว",
  repeat: "ผสมซ้ำ",
  failed: "ล้มเหลว",
}

export function ReportsView({ records, stats }: ReportsViewProps) {
  const chartData = useMemo(() => {
    if (!stats?.monthlyStats) return []

    return stats.monthlyStats.slice(0, 6).reverse().map((month) => ({
      month: month.month,
      totalBreedings: month.totalBreedings,
      pregnantCount: month.pregnantCount,
      deliveredCount: month.deliveredCount,
      rebreedCount: month.rebreedCount,
    }))
  }, [stats])

  const pieData = useMemo(() => {
    if (!stats?.statusDistribution) return []
    return stats.statusDistribution.map((item) => ({
      name: statusLabels[item.status] || item.status,
      value: item.count,
      color: statusColors[item.status] || "#6b7280",
    }))
  }, [stats])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Print */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">รายงานประจำเดือน</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="size-4" />
          พิมพ์
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                รวมการผสมพันธุ์
              </p>
              <p className="text-2xl font-bold">
                {stats?.totalBreedings || 0}
              </p>
              <p className="text-xs text-muted-foreground">ครั้ง</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                ตั้งท้อง
              </p>
              <p className="text-2xl font-bold text-info">
                {stats?.statusDistribution.find(
                  (s) => s.status === "pregnant"
                )?.count || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.statusDistribution.find(
                  (s) => s.status === "pregnant"
                )?.percentage || 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                คลอดแล้ว
              </p>
              <p className="text-2xl font-bold text-success">
                {stats?.statusDistribution.find(
                  (s) => s.status === "delivered"
                )?.count || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.statusDistribution.find(
                  (s) => s.status === "delivered"
                )?.percentage || 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                ผสมซ้ำ
              </p>
              <p className="text-2xl font-bold text-warning">
                {stats?.statusDistribution.find(
                  (s) => s.status === "repeat" || s.status === "re_breed"
                )?.count || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.statusDistribution.find(
                  (s) => s.status === "repeat" || s.status === "re_breed"
                )?.percentage || 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line Chart - Monthly Trends */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                แนวโน้มรายเดือน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalBreedings"
                    stroke="#3b82f6"
                    name="รวมการผสม"
                  />
                  <Line
                    type="monotone"
                    dataKey="pregnantCount"
                    stroke="#10b981"
                    name="ตั้งท้อง"
                  />
                  <Line
                    type="monotone"
                    dataKey="deliveredCount"
                    stroke="#f59e0b"
                    name="คลอดแล้ว"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pie Chart - Status Distribution */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                การกระจายสถานะ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name} (${value})`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delivery Statistics */}
      {stats?.deliveryStats && stats.deliveryStats.totalDeliveries > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              สถิติการคลอด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  ลูกเฉลี่ยต่อการคลอด
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {stats.deliveryStats.avgLitterSize.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">ตัว</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  อัตราอยู่รอด
                </p>
                <p className="mt-2 text-2xl font-bold text-success">
                  {stats.deliveryStats.avgAliveRate.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">%</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  น้ำหนักแรกเกิดเฉลี่ย
                </p>
                <p className="mt-2 text-2xl font-bold text-accent">
                  {stats.deliveryStats.avgBirthWeight.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">กก.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white;
            color: black;
          }
          
          .print\\:text-black {
            color: black !important;
          }
          
          .recharts-surface {
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}
