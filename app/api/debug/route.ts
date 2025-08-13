import { NextResponse } from "next/server"

export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  const keyLength = process.env.OPENAI_API_KEY?.length || 0
  const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 8) || "none"
  const keyValid = process.env.OPENAI_API_KEY?.startsWith("sk-") || false

  return NextResponse.json({
    hasOpenAIKey,
    keyLength,
    keyPrefix,
    keyValid,
    nodeEnv: process.env.NODE_ENV,
    runtime: typeof window === "undefined" ? "server" : "browser",
    timestamp: new Date().toISOString(),
    userAgent: process.env.HTTP_USER_AGENT || "unknown",
  })
}
