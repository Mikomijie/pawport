import Link from "next/link";
import { QrCode, Brain, Bell, MapPin, Syringe, Shield, UserPlus, Tag, Search } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="min-h-screen flex items-center relative" style={{ background: "linear-gradient(135deg, #FDFBF7 0%, #F5EDE6 100%)" }}>
        {/* Floating badge */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E07A5F] text-[#E07A5F] text-xs font-medium font-body">
            #hackthekitty 2026
          </span>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <h1 className="font-display font-bold text-[36px] sm:text-[56px] leading-tight text-[#2C1810]">
              Every Cat Deserves a Digital Identity
            </h1>
            <p className="mt-5 text-[#6B5B52] text-lg sm:text-xl font-body leading-relaxed max-w-lg">
              One scan gives anyone instant access to your cat&apos;s profile, medical alerts, and emergency contacts. No app needed.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="btn-primary px-7 py-3.5 font-body font-semibold text-base text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/find"
                className="btn-outline px-7 py-3.5 font-body font-semibold text-base text-center flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Find a Cat by PIN
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#6B5B52] font-body">
              Already have an account?{" "}
              <Link href="/login" className="text-[#E07A5F] hover:underline font-medium">Sign in</Link>
            </p>
          </div>

          {/* Right — cat image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-[400px] h-[500px] rounded-3xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800"
                alt="Orange tabby cat looking up"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="bg-white py-5 border-y border-[#F0E6DF]">
        <div className="mx-auto max-w-4xl px-6 flex items-center justify-center gap-6 sm:gap-12 text-sm text-[#6B5B52] font-body">
          <span className="flex items-center gap-2"><QrCode size={16} className="text-[#E07A5F]" /> QR Code + PIN</span>
          <span className="hidden sm:inline text-[#E0D8D2]">|</span>
          <span className="flex items-center gap-2"><Brain size={16} className="text-[#E07A5F]" /> AI Health Analysis</span>
          <span className="hidden sm:inline text-[#E0D8D2]">|</span>
          <span className="flex items-center gap-2"><Bell size={16} className="text-[#E07A5F]" /> Temporal Workflows</span>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 px-6" style={{ background: "#FDFBF7" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display font-bold text-3xl sm:text-[40px] text-center text-[#2C1810]">How It Works</h2>
          <p className="mt-2 text-center text-[#6B5B52] font-body text-base">Three simple steps to keep your cat safe</p>

          <div className="mt-14 grid sm:grid-cols-3 gap-10 relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-px border-t-2 border-dashed border-[#E0D8D2]" />

            <div className="text-center relative">
              <div className="mx-auto w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 relative z-10">
                <UserPlus size={24} className="text-[#E07A5F]" />
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E07A5F] text-white text-sm font-bold font-body mb-3">1</div>
              <h3 className="font-body font-semibold text-lg text-[#2C1810]">Register Your Cat</h3>
              <p className="mt-2 text-sm text-[#6B5B52] font-body leading-relaxed">
                Add photo, health records, emergency contacts. Get a unique QR code and 6-digit PIN.
              </p>
            </div>

            <div className="text-center relative">
              <div className="mx-auto w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 relative z-10">
                <Tag size={24} className="text-[#E07A5F]" />
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E07A5F] text-white text-sm font-bold font-body mb-3">2</div>
              <h3 className="font-body font-semibold text-lg text-[#2C1810]">Tag Their Collar</h3>
              <p className="mt-2 text-sm text-[#6B5B52] font-body leading-relaxed">
                Print the QR code or write the PIN on the collar tag. Anyone with a phone camera can scan it instantly.
              </p>
            </div>

            <div className="text-center relative">
              <div className="mx-auto w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 relative z-10">
                <Bell size={24} className="text-[#E07A5F]" />
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E07A5F] text-white text-sm font-bold font-body mb-3">3</div>
              <h3 className="font-body font-semibold text-lg text-[#2C1810]">Stay Connected</h3>
              <p className="mt-2 text-sm text-[#6B5B52] font-body leading-relaxed">
                When your cat goes missing, finders share GPS instantly. Automated Temporal workflows escalate alerts every 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 sm:py-28 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display font-bold text-3xl sm:text-[40px] text-center text-[#2C1810]">Everything Your Cat Needs</h2>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: QrCode, title: "QR Code + PIN", desc: "Unique QR code and 6-digit PIN. No app download needed to view your cat's profile." },
              { icon: Brain, title: "AI Health Assistant", desc: "AI-powered health analysis with early risk warnings, hydration monitoring, and vet recommendations." },
              { icon: Bell, title: "Lost Cat Alerts", desc: "Temporal-powered workflows automatically escalate alerts to shelters every 24 hours until found." },
              { icon: MapPin, title: "GPS Sighting", desc: "Finders share their exact location with one tap. See where your cat was last spotted." },
              { icon: Syringe, title: "Medical Records", desc: "Vaccination records, allergies, dietary restrictions, and full medical history in one place." },
              { icon: Shield, title: "Privacy Controls", desc: "You decide what's visible. Hide phone, address, feeding schedule, or location from public view." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 transition-all duration-200">
                <Icon size={32} className="text-[#E07A5F]" />
                <h3 className="mt-3 font-body font-semibold text-base text-[#2C1810]">{title}</h3>
                <p className="mt-2 text-sm text-[#6B5B52] font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#2C1810] text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display font-bold text-3xl sm:text-[40px] text-white">Keep Your Cat Safe Today</h2>
          <p className="mt-3 text-lg text-[#B8A49E] font-body">
            Join PawPort and give your cat a digital health passport. It takes less than 2 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-4 font-body font-semibold text-base">
              Create Free Account
            </Link>
            <Link href="/find" className="px-8 py-4 rounded-[10px] border-2 border-white/30 text-white font-body font-semibold text-base hover:bg-white/10 transition-all duration-200">
              Found a Cat? Enter PIN
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#1A0F0A]">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-display font-bold text-white text-lg">PawPort</span>
            <p className="text-[#8C7B75] text-xs font-body mt-0.5">Built for the #hackthekitty hackathon</p>
          </div>
          <p className="text-[#8C7B75] text-xs font-body">
            Powered by Next.js · Temporal · Aikido Security · OpenRouter AI
          </p>
        </div>
      </footer>
    </main>
  );
}
