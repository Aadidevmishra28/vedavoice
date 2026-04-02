'use client'

export default function MicButton({
  listening, status, onTap
}: { listening: boolean; status: string; onTap: () => void }) {
  const isActive = listening || status === 'processing'

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
      {isActive && (
        <span className="absolute w-28 h-28 rounded-full bg-primary opacity-5 mic-pulse" />
      )}
      {/* Inner pulse ring */}
      {isActive && (
        <span className="absolute w-24 h-24 rounded-full bg-primary opacity-10 mic-pulse"
          style={{ animationDelay: '0.3s' }} />
      )}
      {/* Idle decorative rings */}
      {!isActive && (
        <>
          <span className="absolute w-32 h-32 rounded-full bg-indigo-100 opacity-60" />
          <span className="absolute w-28 h-28 rounded-full bg-indigo-50 opacity-80" />
        </>
      )}
      {/* Button */}
      <button
        onClick={onTap}
        className="relative w-24 h-24 rounded-full mic-gradient flex items-center
          justify-center active:scale-90 transition-transform z-10"
        style={{ boxShadow: '0 20px 40px rgba(42,20,180,0.25)' }}
      >
        <span
          className="material-symbols-outlined text-white text-4xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          mic
        </span>
      </button>
    </div>
  )
}