import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const sowId = searchParams.get("sowId")

  let query = supabase
    .from("medications")
    .select("*")
    .order("administered_date", { ascending: false })

  if (sowId) {
    query = query.eq("sow_id", sowId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("medications")
    .insert([{
      sow_id: body.sow_id,
      medication_name: body.medication_name,
      dosage: body.dosage,
      administered_date: body.administered_date,
      administered_by: body.administered_by,
      reason: body.reason,
      notes: body.notes,
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
