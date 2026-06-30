# PawPort 🐾

**Digital Health Passport for Cats**

A comprehensive web platform that creates a digital identity and health record for every cat, enabling instant identification, health tracking, and safety features through QR codes and AI-powered health analysis.

**Live Demo:** [pawport.vercel.app](https://pawport.vercel.app)  
**GitHub:** [github.com/Mikomijie/pawport](https://github.com/Mikomijie/pawport)  
**Built for:** #hackthekitty 2026 Hackathon

---

## 🎯 Problem

Cats go missing. When they do, owners have no way to share critical health information (allergies, medications, microchip ID) with whoever finds them. Finders have no way to identify who the cat belongs to without an app download.

## ✨ Solution

PawPort gives every cat a **QR code + 6-digit PIN** that instantly connects finders to:
- Owner emergency contact
- Complete health profile (allergies, diet, medical history)
- Real-time GPS location sharing
- Care tracking and health insights

**No app download needed.** Anyone with a phone camera can help.

---

## 🚀 Features

### For Cat Owners
- **Register your cat** with photo, breed, age, weight, gender
- **Health records** — allergies, dietary restrictions, medical history, emergency contacts
- **QR Code + PIN** — print and attach to collar
- **Care tracking** — log feeding, water, medication, behavioral notes
- **AI Health Check** — get confidence-scored health insights based on care logs
- **Lost/Found workflow** — mark cat as lost, get instant email when found with GPS location
- **Privacy controls** — decide what's visible to finders (phone, address, feeding schedule, location)
- **Health timeline** — AI-generated narrative of your cat's health journey
- **AI chat assistant** — ask questions about your cat's health, diet, behavior

### For Finders
- **Scan QR code** — no login required, instant profile
- **Enter PIN** — if QR code is worn off, use the 6-digit PIN from collar tag
- **View cat profile** — see why the cat might be missing, any special care needs
- **Share GPS** — one tap to send your location to the owner
- **Care tips** — personalized guidance based on allergies and medical history

### Technical Features
- **Rate limiting** — 5 login attempts per 15 minutes per IP
- **Security headers** — Content Security Policy, X-Frame-Options, HSTS
- **Input sanitization** — all user inputs validated and sanitized
- **Session auth** — secure httpOnly cookies
- **Email notifications** — when finder reports cat spotted, owner gets email with map link
- **AI transparency** — health check shows confidence level and what data was used
- **Responsible AI** — every AI response includes disclaimer, never diagnoses

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, React |
| **Backend** | Next.js API routes, Node.js |
| **Database** | SQLite with Prisma ORM |
| **Authentication** | Session-based with bcryptjs |
| **AI** | OpenRouter API (DeepSeek R1 model) |
| **Workflows** | Temporal TypeScript SDK |
| **Email** | Resend (transactional email) |
| **Security** | Rate limiting, CSP headers, input validation |
| **Deployment** | Vercel |

---

## 📊 Architecture

```text
┌─────────────────────────────────────────────────┐
│         Browser / Mobile Camera                  │
│  (Scan QR → View Public Profile → Share GPS)    │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│       Next.js Frontend (Tailwind CSS)            │
│  Dashboard | Registration | Public Profile      │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│     Next.js API Routes (TypeScript)             │
│  /api/cats - CRUD operations                    │
│  /api/cats/[id]/health-check - AI analysis      │
│  /api/cats/[id]/chat - AI conversations         │
│  /api/cats/[id]/sighting - GPS submissions      │
│  /api/auth - Session management                 │
└────────────┬────────────────────────────────────┘
             │
      ┌──────┴──────────┬──────────────┐
      ↓                 ↓              ↓
┌──────────────┐  ┌──────────────┐ ┌──────────────┐
│   SQLite     │  │ OpenRouter   │ │   Resend     │
│   Database   │  │   API (AI)   │ │   (Email)    │
│ (Prisma ORM) │  │              │ │              │
└──────────────┘  └──────────────┘ └──────────────┘
```

Temporal Workflows run separately for lost cat escalation and reminders.

---

## 🔐 Security

### Implemented
✅ **Rate Limiting** — 5 login attempts per IP per 15 minutes  
✅ **Content Security Policy** — restricts inline scripts and external resources  
✅ **Input Validation** — all form fields sanitized with length limits  
✅ **SQL Injection Prevention** — Prisma parameterized queries only  
✅ **Secure Cookies** — httpOnly, secure, sameSite flags  
✅ **Password Hashing** — bcryptjs with salt rounds  
✅ **API Key Protection** — OpenRouter key never exposed to client  
✅ **File Upload Sanitization** — filenames sanitized to prevent directory traversal

### Responsible AI
✅ **AI Disclaimers** — Every response states "NOT a medical diagnosis"  
✅ **Confidence Scoring** — Health check shows confidence based on data  
✅ **Transparency** — Shows what data was analyzed  
✅ **Human Oversight** — "Report inaccurate" button on all AI results  
✅ **No Autonomous Decisions** — All AI outputs are recommendations only

See `SECURITY.md` for detailed audit.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone the repository:**

```bash
git clone https://github.com/Mikomijie/pawport.git
cd pawport
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-random-secret-string-here"
OPENROUTER_API_KEY="sk-or-your-key"
RESEND_API_KEY="re_your-key"
```

4. **Initialize database:**

```bash
npx prisma db push
npx prisma generate
```

5. **Start development server:**

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📱 Usage

### As a Cat Owner

1. Register with email and password
2. Add your cat with photo, breed, health info
3. Get QR code and PIN from dashboard
4. Attach QR code or write PIN on collar
5. Log care events (feeding, water, medication)
6. Get AI health insights
7. If lost, mark as lost and get notified when found

### As a Finder

1. Scan QR code or enter PIN at pawport.com
2. View cat profile and owner contact
3. Click "I Found This Cat"
4. Share your GPS location
5. Owner receives instant email

---

## 🏆 Judging Criteria

| Criteria | Implementation |
|----------|----------------|
| **Technical (25%)** | Next.js fullstack, Prisma, Temporal, OpenRouter AI, email |
| **Innovation (20%)** | AI transparency, GPS sighting, privacy controls, AI chat |
| **Theme (15%)** | Solves cat safety with QR code identification |
| **Security (15%)** | Rate limiting, CSP, input validation, responsible AI |
| **UX/UI (15%)** | Mobile-first, Playfair typography, terracotta design |
| **Documentation (10%)** | README, SECURITY.md, architecture diagrams |

---

## 📝 Project Structure

```text
pawport/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── dashboard/page.tsx       # Owner dashboard
│   ├── cat/[id]/page.tsx        # Public profile
│   ├── find/page.tsx            # PIN lookup
│   └── api/                     # API routes
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── validations.ts
│   └── rate-limit.ts
├── prisma/
│   └── schema.prisma
├── temporal/
│   ├── workflows.ts
│   ├── activities.ts
│   └── worker.ts
├── public/uploads/              # User photos
└── README.md
```

---

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Go to <https://vercel.com/new>
3. Import `github.com/Mikomijie/pawport`
4. Add environment variables
5. Deploy

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Michael Omijie**  
Built for #hackthekitty 2026 Hackathon  
GitHub: [@Mikomijie](https://github.com/Mikomijie)

---

## 🙏 Acknowledgments

- **Temporal** — Workflow orchestration
- **OpenRouter** — AI API integration
- **Resend** — Email delivery
- **Vercel** — Hosting
- **Anthropic** — Claude AI assistance

---

**Status:** Hackathon Submission Ready  
**Last Updated:** June 30, 2026