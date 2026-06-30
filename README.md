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
│ (Prisma ORM)│  │              │ │              │
└──────────────┘  └──────────────┘ └──────────────┘
Temporal Workflows (Separate Process):
┌──────────────────────────────────────┐
│  Temporal Server (localhost:7233)    │
│  - Lost cat escalation (24h loop)    │
│  - Medication reminders              │
│  - Feeding reminders                 │
└──────────────────────────────────────┘
---

## 🔐 Security

### Implemented
✅ **Rate Limiting** — 5 login attempts per IP per 15 minutes (429 status)  
✅ **Content Security Policy** — restricts inline scripts, external resources  
✅ **Input Validation** — all form fields sanitized, length limits enforced  
✅ **SQL Injection Prevention** — Prisma parameterized queries only  
✅ **Secure Cookies** — httpOnly, secure, sameSite flags set  
✅ **Password Hashing** — bcryptjs with salt rounds  
✅ **API Key Protection** — OpenRouter key never exposed to client  
✅ **CORS Protection** — API routes validate origin  
✅ **No Sensitive Data in Responses** — passwords, API keys never returned  

### Responsible AI
✅ **AI Disclaimers** — Every AI response states "NOT a medical diagnosis"  
✅ **Confidence Scoring** — Health check shows confidence level based on data completeness  
✅ **Transparency** — Shows what data was used ("3 care logs, 2 vaccinations, weight recorded")  
✅ **Human Oversight** — "Report inaccurate" button on all AI results  
✅ **No Autonomous Decisions** — All AI outputs are recommendations only  

See `SECURITY.md` for detailed security audit.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite3

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
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-random-secret-string-here"
OPENROUTER_API_KEY="sk-or-your-key-from-openrouter.ai"
RESEND_API_KEY="re_your-key-from-resend.com"
TEMPORAL_ADDRESS="localhost:7233"
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

### Optional: Run Temporal Workflows

In separate terminals:

```bash
# Terminal 1: Start Temporal server
temporal server start-dev

# Terminal 2: Start Temporal worker
npx ts-node --project tsconfig.worker.json temporal/worker.ts
```

---

## 📱 Usage

### As a Cat Owner

1. **Register** — Create account with email and password
2. **Add cat** — Upload photo, enter breed, gender, age, weight, health info
3. **Get QR code** — Download or print from dashboard
4. **Attach to collar** — Print the QR code or write 6-digit PIN on collar tag
5. **Monitor health** — Log care events (feeding, water, medication)
6. **Get insights** — Click "AI Health Check" for confidence-scored analysis
7. **If lost** — Click "Mark as Lost" on the cat card
8. **Get notified** — When someone finds your cat and submits GPS, you get an email

### As a Finder

1. **Scan QR code** with phone camera, or go to pawport.com and enter PIN
2. **View profile** — See cat name, breed, owner contact, special care needs
3. **Share location** — Click "I Found This Cat" and allow GPS access
4. **Send message** — (Optional) Leave a note for the owner
5. **Owner gets notified** — Within seconds, owner receives email with your location

---

## 🎬 Demo Video

[Link to demo video showing full workflow]

---

## 🏆 Judging Criteria Coverage

| Criteria | Score | Implementation |
|----------|-------|-----------------|
| **Technical Execution (25%)** | ✅ | Next.js fullstack, Prisma, Temporal workflows, OpenRouter AI integration, email notifications |
| **Innovation & Creativity (20%)** | ✅ | AI health transparency with confidence scoring, GPS sighting system, privacy controls, AI chat & timeline |
| **Theme Relevance (15%)** | ✅ | Directly solves cat safety problem with QR code identification & health sharing |
| **Security (15%)** | ✅ | Rate limiting, CSP headers, input validation, secure auth, responsible AI design |
| **UX/UI (15%)** | ✅ | Mobile-first design, Playfair Display typography, terracotta color system, smooth interactions |
| **Documentation (10%)** | ✅ | README, SECURITY.md, inline code comments, architecture diagrams |

---

## 📝 Project Structure
pawport/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx             # Owner dashboard
│   │   ├── cat-card.tsx         # Cat card component
│   │   ├── register-cat-form.tsx
│   │   └── privacy-settings.tsx
│   ├── cat/[id]/
│   │   ├── page.tsx             # Public profile (for finders)
│   │   └── found-cat-button.tsx
│   ├── find/page.tsx            # PIN lookup page
│   └── api/
│       ├── auth/                # Auth endpoints
│       ├── cats/                # Cat CRUD
│       └── cats/[id]/           # Health check, chat, sighting, care log
├── lib/
│   ├── db.ts                    # Database client
│   ├── auth.ts                  # Session management
│   ├── validations.ts           # Input validators
│   ├── pin.ts                   # PIN generation
│   └── rate-limit.ts            # Rate limiting
├── prisma/
│   └── schema.prisma            # Database schema
├── temporal/
│   ├── workflows.ts             # Workflow definitions
│   ├── activities.ts            # Activity implementations
│   └── worker.ts                # Worker setup
├── public/
│   └── uploads/                 # User uploaded photos
├── .env                         # Environment variables
└── README.md                    # This file
---

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import `github.com/Mikomijie/pawport`
4. Add environment variables in Vercel dashboard
5. Deploy

The app will be live at `pawport.vercel.app`

---

## 🤝 Contributing

This is a hackathon project. For improvements:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open Pull Request

---

## 📄 License

MIT License — See LICENSE file for details

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
- **Vercel** — Hosting & deployment
- **Anthropic** — Claude AI assistance

---

## 📞 Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/Mikomijie/pawport/issues)
- Check [SECURITY.md](SECURITY.md) for security questions

---

**Last Updated:** June 30, 2026  
**Status:** Hackathon Submission Ready