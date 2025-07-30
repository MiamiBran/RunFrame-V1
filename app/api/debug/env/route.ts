import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY

  return NextResponse.json({
    // Environment info
    nodeEnv: process.env.NODE_ENV,
    platform: process.platform,

    // API Key analysis
    hasApiKey: !!apiKey,
    apiKeyType: typeof apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 10) || "none",
    apiKeySuffix: apiKey?.substring(-10) || "none",
    startsWithSk: apiKey?.startsWith("sk-") || false,

    // Validation checks
    isString: typeof apiKey === "string",
    hasLength: (apiKey?.length || 0) > 20,
    trimmedLength: apiKey?.trim?.()?.length || 0,

    // Environment variables count
    totalEnvVars: Object.keys(process.env).length,

    timestamp: new Date().toISOString(),
  })
}
