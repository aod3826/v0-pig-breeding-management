import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let query = supabase
      .from("sows")
      .select(
        `*,
        breeding_records(
          id, 
          breeding_date, 
          status, 
          expected_due_date
        )`
      )
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching sows:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/sows:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { sow_id, name, breed, birth_date, status, notes } = body

    if (!sow_id) {
      return NextResponse.json(
        { error: "sow_id is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("sows")
      .insert([
        {
          sow_id,
          name,
          breed,
          birth_date,
          status: status || "active",
          notes,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error creating sow:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/sows:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
