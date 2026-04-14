"use client";

import { useState, useCallback } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useLedger } from "@/hooks/useLedger";
import { useAuth } from "@/hooks/useAuth";
import { useWorkers } from "@/hooks/useWorkers";
import { extractFromText } from "@/lib/api";
import { ExtractResult, Worker } from "@/types";
import { fetchWorkerFinancials, classifyPayment } from "@/lib/smartPayment";
import { logVoiceEntry } from "@/lib/voiceLog";

import MicButton from "@/components/MicButton";
import SummaryStrip from "@/components/SummaryStrip";
import LedgerList from "@/components/LedgerList";
type Status = "idle" | "listening" | "processing" | "disambiguating" | "confirming" | "saved" | "error";

const statusLabel: Record<Status, string> = {
  idle:       "Tap karke bolo...",
  listening:  "Sun raha hoon...",
  processing: "Samajh raha hoon...",
  disambiguating: "Inme se kaunsa?",
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

  const [candidates, setCandidates] = useState<Worker[]>([]);
  const [targetWorker, setTargetWorker] = useState<Worker | "new" | null>(null);

  const auth   = useAuth();
  const ledger = useLedger(auth?.id);
  const { matchWorker, createWorker } = useWorkers(auth?.id);

  const { listening, transcript, start, stop, speak } = useVoice({
    onResult: async (text) => {
      setLastText(text);
      setStatus("processing");
      try {
        const extracted = await extractFromText(text);
        setResult(extracted);
        if (!extracted.name || extracted.amount_int === null) {
          setStatus("error");
          setErrorMsg("Naam ya amount samajh nahi aaya. Dobara bolo.");
          speak("Samajh nahi aaya, dobara bolo.");
          return;
        }

        const match = matchWorker(extracted.name);

        if (match.type === 'ambiguous') {
          setCandidates(match.candidates || []);
          setStatus('disambiguating');
          // Important: pause logic here. Wait for UI bottom sheet tap.
        } else if (match.type === 'new') {
          setTargetWorker('new');
          promptConfirmation(extracted, 'new');
        } else {
          setTargetWorker(match.worker || null);
          promptConfirmation(extracted, match.worker || null);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg("Backend se connect nahi ho pa raha.");
      }
    },
    onError: (e) => { setStatus("error"); setErrorMsg(e); },
  });

  const promptConfirmation = useCallback((res: ExtractResult, w: Worker | "new" | null) => {
    setStatus("confirming");
    
    // Construct spoken phrase
    const unitVoice = res.unit === 'days' ? 'din' : 'rupaye';
    const actionVoiceMap: Record<string, string> = {
      UDHAAR: 'udhaar', PAYMENT: 'payment', ADVANCE: 'advance', 
      RECEIPT: 'mila', MATERIAL: 'kharcha', ATTENDANCE: 'haajiri'
    };
    const actionVoice = actionVoiceMap[res.action] || res.action;

    // Use established worker name with qualifier if possible, else just extracted name
    const spokenName = w && w !== 'new' && w.qualifier ? `${w.name} ${w.qualifier}` : res.name;
    speak(`${spokenName} ka ${res.amount_int} ${unitVoice} ${actionVoice}. Sahi hai?`);
  }, [speak]);

  function handleSelectCandidate(w: Worker | "new") {
    if (!result) return;
    setTargetWorker(w);
    promptConfirmation(result, w);
  }

  function handleMicTap() {
    if (listening) { stop(); return; }
    if (status === "confirming" || status === "disambiguating") return;
    setResult(null); setErrorMsg(""); setStatus("listening"); setTargetWorker(null); start();
  }

  async function handleConfirm() {
    if (!result) return;
    try {
      let finalWorkerId: string | null = null;
      let finalWorker: Worker | null = null;

      if (targetWorker === "new" && result.name) {
        const newW = await createWorker(result.name, result.qualifier, null);
        if (newW) { finalWorkerId = newW.id; finalWorker = newW; }
      } else if (targetWorker && targetWorker !== 'new') {
        finalWorkerId = targetWorker.id;
        finalWorker = targetWorker;
      }

      await ledger.savePrediction(result, lastText, true);

      // Smart classification: only for PAYMENT or ADVANCE intents
      if ((result.action === 'PAYMENT' || result.action === 'ADVANCE') &&
          auth?.id && finalWorker && finalWorker.daily_rate) {

        const financials = await fetchWorkerFinancials(
          auth.id, finalWorkerId, result.name!, finalWorker.daily_rate
        );
        const classification = classifyPayment(result.amount_int!, financials);

        if (classification.type === 'SPLIT') {
          // Save two transactions: one PAYMENT + one ADVANCE
          await ledger.addTransaction(
            { ...result, action: 'PAYMENT', amount_int: classification.paymentAmount!, notes: classification.paymentNotes ?? null },
            lastText, finalWorkerId
          );
          await ledger.addTransaction(
            { ...result, action: 'ADVANCE', amount_int: classification.advanceAmount!, notes: classification.advanceNotes ?? null },
            lastText, finalWorkerId
          );
        } else {
          // Single transaction with smart notes
          await ledger.addTransaction(
            { ...result, action: classification.action!, amount_int: classification.amount!, notes: classification.notes ?? result.notes ?? null },
            lastText, finalWorkerId
          );
        }
      } else {
        // For all other intents (ATTENDANCE, MATERIAL, RECEIPT, UDHAAR) — save as-is
        await ledger.addTransaction(result, lastText, finalWorkerId);
      }

      setStatus("saved");
      speak("Likh diya!");
      logVoiceEntry({
        transcript: lastText,
        action: result.action,
        name: result.name,
        amount: result.amount_int,
        status: 'saved'
      });
      setTimeout(() => { setStatus("idle"); setResult(null); }, 2000);
    } catch (e) {
      console.error(e)
      setStatus("error"); setErrorMsg("Save karne mein problem aayi.");
    }
  }

  function handleCancel() {
    if (result) {
      ledger.savePrediction(result, lastText, false);
      logVoiceEntry({ transcript: lastText, action: result.action, name: result.name, amount: result.amount_int, status: 'cancelled' });
    }
    setStatus("idle"); setResult(null); setTargetWorker(null); speak("Cancel kar diya.");
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative">

      {/* Header */}
      <header className="bg-indigo-700 md:bg-transparent sticky top-0 z-40 shadow-lg md:shadow-none shadow-indigo-900/20"
        style={{ backdropFilter: 'blur(20px)' }}>
        <div className="flex justify-between items-center px-6 md:px-8 py-4">
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-headline font-black tracking-tight text-xl text-white">VedaVoice</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden md:block">
              <p className="text-indigo-200 md:text-on-surface-variant text-xs font-label uppercase tracking-widest">Namaste,</p>
              <p className="text-white md:text-on-surface font-bold font-headline">{auth?.name ?? 'Thekedar'} 🙏</p>
            </div>
            <Avatar url={auth?.avatarUrl ?? null} name={auth?.name ?? 'T'} />
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
          {result && status !== 'disambiguating' && (
            <div className="flex flex-wrap justify-center gap-2">
              {result.name && (
                <span className="px-4 py-2 bg-primary text-white text-xs font-bold font-label rounded-full uppercase tracking-tight">
                  {result.name} {result.qualifier ? `(${result.qualifier})` : ''}
                </span>
              )}
              {result.amount_int !== null && (
                <span className="px-4 py-2 bg-secondary-container text-on-secondary-container text-xs font-bold font-label rounded-full uppercase tracking-tight">
                  {result.unit === 'days' ? `${result.amount_int} day` : `₹${result.amount_int.toLocaleString('en-IN')}`}
                </span>
              )}
              <span className={`px-4 py-2 text-xs font-bold font-label rounded-full uppercase tracking-tight
                ${result.action === 'UDHAAR' || result.action === 'ADVANCE' || result.action === 'MATERIAL'
                  ? 'bg-error text-white'
                  : result.action === 'ATTENDANCE' ? 'bg-gray-500 text-white' : 'bg-tertiary-container text-on-tertiary-container'}`}>
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

        {/* Disambiguation Bottom Sheet */}
        {status === "disambiguating" && result && (
          <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] animate-slide-up border border-outline-variant pb-8 max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mx-auto my-3" />
            <div className="px-6 pb-4">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6">
                ⚠️ "{result.name}" se kaun?
              </h2>
              
              <div className="flex flex-col">
                {candidates.map(w => (
                  <button 
                    key={w.id}
                    onClick={() => handleSelectCandidate(w)}
                    className="w-full p-5 text-left text-lg border-b border-outline-variant/30 active:bg-surface-container transition-colors flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-on-surface">{w.name}</span>
                      {w.qualifier && <span className="text-outline ml-1 font-medium text-base">({w.qualifier})</span>}
                    </div>
                    {w.daily_rate && (
                      <span className="text-sm font-label font-bold text-on-surface-variant bg-surface-container py-1 px-2 rounded-lg">
                        ₹{w.daily_rate}/din
                      </span>
                    )}
                  </button>
                ))}
                
                <button 
                  onClick={() => handleSelectCandidate("new")}
                  className="w-full p-5 text-left text-lg text-primary font-bold active:bg-primary/10 transition-colors mt-2 rounded-xl"
                >
                  + Naya "{result.name}" {result.qualifier ? `(${result.qualifier})` : ''} banao
                </button>
              </div>
            </div>
          </div>
        )}

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
