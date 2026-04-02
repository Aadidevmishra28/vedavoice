"use client";

import { useState, useCallback } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useLedger } from "@/hooks/useLedger";
import { useAuth } from "@/hooks/useAuth";
import { extractFromText } from "@/lib/api";
import { ExtractResult } from "@/types";

import MicButton from "@/components/MicButton";
import SummaryStrip from "@/components/SummaryStrip";
import LedgerList from "@/components/LedgerList";

type Status = "idle" | "listening" | "processing" | "confirming" | "saved" | "error";

const statusLabel: Record<Status, string> = {
  idle:       "Tap karke bolo...",
  listening:  "Sun raha hoon...",
  processing: "Samajh raha hoon...",
  confirming: "Sahi hai?",
  saved:      "Likh diya! ✓",
  error:      "Kuch gadbad ho gayi",
};

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) return (
    <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400" />
  )
  return (
    <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-indigo-400
      flex items-center justify-center text-white font-headline font-bold text-sm">
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastText, setLastText] = useState("");

  const ledger = useLedger();
  const auth   = useAuth();

  const handleSpeechResult = useCallback(async (text: string) => {
    setLastText(text);
    setStatus("processing");
    try {
      const extracted = await extractFromText(text);
      setResult(extracted);
      if (!extracted.name || !extracted.amount_int) {
        setStatus("error");
        setErrorMsg("Naam ya amount samajh nahi aaya. Dobara bolo.");
        speak("Samajh nahi aaya, dobara bolo.");
        return;
      }
      setStatus("confirming");
      speak(`${extracted.name} ke ${extracted.amount_int} rupaye ${extracted.action === "UDHAAR" ? "udhaar" : "payment"}. Sahi hai?`);
    } catch {
      setStatus("error");
      setErrorMsg("Backend se connect nahi ho pa raha.");
    }
  }, []);

  const { listening, transcript, start, stop, speak } = useVoice({
    onResult: handleSpeechResult,
    onError: (e) => { setStatus("error"); setErrorMsg(e); },
  });

  function handleMicTap() {
    if (listening) { stop(); return; }
    if (status === "confirming") return;
    setResult(null); setErrorMsg(""); setStatus("listening"); start();
  }

  async function handleConfirm() {
    if (!result) return;
    try {
      await ledger.savePrediction(result, lastText, true);
      await ledger.addTransaction(result, lastText);
      setStatus("saved");
      speak("Likh diya!");
      setTimeout(() => { setStatus("idle"); setResult(null); }, 2000);
    } catch {
      setStatus("error"); setErrorMsg("Save karne mein problem aayi.");
    }
  }

  function handleCancel() {
    if (result) ledger.savePrediction(result, lastText, false);
    setStatus("idle"); setResult(null); speak("Cancel kar diya.");
  }

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <header className="bg-indigo-700 md:bg-transparent sticky top-0 z-40 shadow-lg md:shadow-none shadow-indigo-900/20"
        style={{ backdropFilter: 'blur(20px)' }}>
        <div className="flex justify-between items-center px-6 md:px-8 py-4">
          {/* Hidden on desktop since sidebar already has the logo */}
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-headline font-black tracking-tight text-xl text-white">VedaVoice</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden md:block">
              <p className="text-indigo-200 md:text-on-surface-variant text-xs font-label uppercase tracking-widest">Namaste,</p>
              <p className="text-white md:text-on-surface font-bold font-headline">{auth?.name ?? 'Dukandaar'} 🙏</p>
            </div>
            <Avatar url={auth?.avatarUrl ?? null} name={auth?.name ?? 'D'} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-8">

        {/* Summary bento cards */}
        <SummaryStrip
          totalUdhaar={ledger.totalUdhaar}
          todayMila={ledger.todayMila}
          uniqueCustomers={ledger.uniqueCustomers}
        />

        {/* Mic hero section */}
        <section className="flex flex-col items-center justify-center py-8 space-y-8">
          <MicButton listening={listening} status={status} onTap={handleMicTap} />

          {/* Status + transcript */}
          <div className="text-center space-y-3 w-full">
            <p className={`font-headline font-bold text-lg tracking-tight
              ${status === 'error' ? 'text-error' : 'text-primary'}`}>
              {status === 'error' ? errorMsg : statusLabel[status]}
            </p>
            {(transcript || lastText) && (
              <div className="bg-surface-container-low p-4 rounded-xl max-w-sm mx-auto">
                <p className="italic text-on-surface-variant text-sm leading-relaxed">
                  "{transcript || lastText}"
                </p>
              </div>
            )}
          </div>

          {/* Result pills */}
          {result && (
            <div className="flex flex-wrap justify-center gap-2">
              {result.name && (
                <span className="px-4 py-2 bg-primary text-white text-xs font-bold font-label rounded-full uppercase tracking-tight">
                  {result.name}
                </span>
              )}
              {result.amount_int && (
                <span className="px-4 py-2 bg-secondary-container text-on-secondary-container text-xs font-bold font-label rounded-full uppercase tracking-tight">
                  ₹{result.amount_int.toLocaleString('en-IN')}
                </span>
              )}
              <span className={`px-4 py-2 text-xs font-bold font-label rounded-full uppercase tracking-tight
                ${result.action === 'UDHAAR'
                  ? 'bg-error text-white'
                  : 'bg-tertiary-container text-on-tertiary-container'}`}>
                {result.action}
              </span>
            </div>
          )}

          {/* Confirm / Cancel */}
          {status === "confirming" && result && (
            <div className="w-full space-y-4 pt-4 max-w-sm">
              <button
                onClick={handleConfirm}
                className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl
                  active:scale-95 transition-transform flex items-center justify-center gap-2"
                style={{ boxShadow: '0 8px 20px rgba(42,20,180,0.25)' }}
              >
                Haan, sahi hai
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-2 text-on-surface-variant font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {status === "saved" && (
            <p className="text-tertiary font-headline font-bold">✓ Likh diya!</p>
          )}
        </section>

        {/* Recent transactions */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-headline font-bold text-on-surface">Abhi ke len-den</h2>
            <span className="text-xs font-label font-bold text-primary uppercase tracking-widest">Sab dekho</span>
          </div>
          <LedgerList
            transactions={ledger.transactions.slice(0, 5)}
            loading={ledger.loading}
          />
        </section>

      </main>
    </div>
  );
}
