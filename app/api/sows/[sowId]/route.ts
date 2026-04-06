import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sowId: string }> }
) {
  const { sowId } = await params
  const supabase = await createClient()

  // Get all breeding records for this sow
  const { data: breedingRecords, error: breedingError } = await supabase
    .from("breeding_records")
    .select("*")
    .eq("sow_id", sowId)
    .order("breeding_date", { ascending: false })

  if (breedingError) {
    return NextResponse.json({ error: breedingError.message }, { status: 500 })
  }

  // Get all medications for this sow
  const { data: medications, error: medicationsError } = await supabase
    .from("medications")
    .select("*")
    .eq("sow_id", sowId)
    .order("administered_date", { ascending: false })

  if (medicationsError) {
    return NextResponse.json({ error: medicationsError.message }, { status: 500 })
  }

  return NextResponse.json({
    sowId,
    breedingRecords: breedingRecords || [],
    medications: medications || [],
  })
}
