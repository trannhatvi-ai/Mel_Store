"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Nov", bookings: 12, revenue: 38 },
  { month: "Dec", bookings: 18, revenue: 54 },
  { month: "Jan", bookings: 15, revenue: 49 },
  { month: "Feb", bookings: 22, revenue: 71 },
  { month: "Mar", bookings: 28, revenue: 86 },
  { month: "Apr", bookings: 34, revenue: 102 },
]

export function AdminChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E4B485" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#E4B485" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-bookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C99A70" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#C99A70" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(201,154,112,0.15)" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#4a4a4a", fontSize: 12 }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#4a4a4a", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(201,154,112,0.3)",
              background: "#fff",
              fontSize: 12,
            }}
            labelStyle={{ color: "#212121", fontWeight: 500 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#A87A52"
            strokeWidth={2}
            fill="url(#grad-revenue)"
            name="Revenue (M VND)"
          />
          <Area
            type="monotone"
            dataKey="bookings"
            stroke="#E4B485"
            strokeWidth={2}
            fill="url(#grad-bookings)"
            name="Bookings"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
