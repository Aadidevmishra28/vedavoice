'use client'

export default function SummaryStrip({
  totalUdhaar, todayMila, uniqueCustomers
}: { totalUdhaar: number; todayMila: number; uniqueCustomers: number }) {
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

  const cards = [
    { label: 'Kul Udhaar', value: fmt(totalUdhaar),        color: 'text-error'   },
    { label: 'Aaj Mila',   value: fmt(todayMila),           color: 'text-tertiary'},
    { label: 'Customers',  value: `${uniqueCustomers} log`, color: 'text-on-surface'},
  ]

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
      {cards.map(card => (
        <div
          key={card.label}
          className="flex-shrink-0 w-40 bg-surface-container-lowest p-5 rounded-2xl space-y-3 ghost-border"
        >
          <span className="block font-label text-[10px] font-bold uppercase tracking-widest text-outline">
            {card.label}
          </span>
          <p className={`text-2xl font-headline font-extrabold ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}