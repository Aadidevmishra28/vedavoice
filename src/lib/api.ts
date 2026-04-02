import { ExtractResult } from '@/types'
 
export async function extractFromText(text: string): Promise<ExtractResult> {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
 
  if (!res.ok) throw new Error('Extraction failed')
  return res.json()
}