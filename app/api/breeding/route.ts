import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch all breeding records
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("breeding_records")
      .select("*")
      .order("breeding_date", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching breeding records:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a new breeding record
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      sow_id,
      sire_id,
      breeding_method,
      breeding_date,
      first_check_date,
      confirm_date,
      due_date,
      notes,
    } = body

    // Validate required fields
    if (!sow_id || !sire_id || !breeding_method || !breeding_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("breeding_records")
      .insert({
        sow_id,
        sire_id,
        breeding_method,
        breeding_date,
        first_check_date,
        confirm_date,
        due_date,
        status: "pending-check",
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating breeding record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
