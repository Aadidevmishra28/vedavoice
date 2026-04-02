# 🎙️ VedaVoice (Smart Khata) - Frontend

VedaVoice is an AI-powered, voice-first ledger (Khata) application designed for modern shopkeepers and small businesses. It allows users to log transactions purely through Hinglish voice commands, eliminating the friction of manual data entry.

This repository contains **only the Next.js Frontend**. The NLP extraction model is deployed via a separate Hugging Face Spaces microservice.

---

## 🌟 Key Features

- **Voice-to-Ledger Engine:** Connects to a custom NLP model (VedaVoice-NER) to instantly parse Hinglish commands.
- **High-Fidelity UI/UX:** Stunning, responsive Next.js frontend built with Tailwind CSS, utilizing glassmorphism, fluid micro-animations, and Material Design 3 palettes.
- **Real-time Analytics:** Breathtaking metric charts and weekly tracking modules.
- **WhatsApp Integration:** 1-click WhatsApp reminders for pending Udhaar recoveries directly from the dashboard.
- **Robust Authentication:** Supabase-powered OAuth (Google) and Email/Password flows securely sandboxed behind Next.js Middleware.

## 🏗️ Architecture Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + Material Symbols
- **Database & Auth:** Supabase (PostgreSQL + RLS Policies)

## 🚀 Running Locally

```bash
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*

Ensure you have your `.env.local` configured with the Supabase keys and your `FASTAPI_URL` pointing to the live NLP model.

---

## 🛑 STRICT LICENSE WARNING

**WARNING: This repository is protected by a Custom Non-Commercial Educational License.**

This code, architecture, and its UI designs are provided strictly for **personal study and review only**. 

- 🚫 **No Commercial Use:** You may not monetize, host, or integrate this code into a business product.
- 🚫 **No Competitive Use:** You are strictly prohibited from duplicating, cloning, or submitting this project to hackathons, competitions, or incubators. 
- 🚫 **No Plagiarism:** Representing this codebase as your own work is explicitly illegal.

By viewing or downloading this repository, you legally agree to the terms outlined in the exact `LICENSE` file provided at the root of this repository.
