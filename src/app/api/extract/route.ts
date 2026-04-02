import { NextRequest, NextResponse } from 'next/server'
 
export async function POST(req: NextRequest) {
  const body = await req.json()
 
  const fastapiUrl = process.env.FASTAPI_URL ?? 'http://localhost:8000'
 
  const res = await fetch(`${fastapiUrl}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
 
  if (!res.ok) {
    return NextResponse.json({ error: 'Backend error' }, { status: 502 })
  }
 
  const data = await res.json()
  return NextResponse.json(data)
}