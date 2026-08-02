import { NextResponse } from "next/server"
import { unavailableMessage } from "@/lib/payments/config"

export async function POST() {
  return NextResponse.json({ error: unavailableMessage() }, { status: 503 })
}
