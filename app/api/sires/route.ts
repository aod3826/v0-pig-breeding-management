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
    const sireType = searchParams.get("type")

    let query = supabase
      .from("sires")
      .select(
        `*,
        breeding_records(
          id,
          sow_id,
          breeding_date,
          status
        )`
      )
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (sireType) {
      query = query.eq("sire_type", sireType)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching sires:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/sires:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { sire_id, name, breed, sire_type, status, notes } = body

    if (!sire_id) {
      return NextResponse.json(
        { error: "sire_id is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("sires")
      .insert([
        {
          sire_id,
          name,
          breed,
          sire_type: sire_type || "natural",
          status: status || "active",
          notes,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error creating sire:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/sires:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
