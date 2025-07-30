export async function POST(req: Request) {
  // Stub for future Google OAuth calendar integration
  const event = await req.json()

  // Log the event for now
  console.log("Time block created:", event)

  return new Response("ok", { status: 200 })
}
