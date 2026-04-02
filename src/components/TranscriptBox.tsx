// ─────────────────────────────────────────────────────────────────────────────
// TranscriptBox.tsx
// ─────────────────────────────────────────────────────────────────────────────
'use client'
export default function TranscriptBox({
  transcript, status, errorMsg
}: { transcript: string; status: string; errorMsg: string }) {
  const labels: Record<string, string> = {
    idle:        'Tap karke bolo',
    listening:   'Sun raha hoon...',
    processing:  'Samajh raha hoon...',
    confirming:  'Confirm karo',
    saved:       'Saved!',
    error:       errorMsg || 'Kuch gadbad ho gayi',
  }
 
  return (
    <div className="mt-4 w-full">
      <p className={`text-center text-sm font-medium mb-2
        ${status === 'error'     ? 'text-red-500'    :
          status === 'listening' ? 'text-indigo-600' :
          status === 'saved'     ? 'text-green-600'  : 'text-gray-500'}`}>
        {labels[status]}
      </p>
      {transcript && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 text-center">
          "{transcript}"
        </div>
      )}
    </div>
  )
}