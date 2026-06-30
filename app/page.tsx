import Link from "next/link";
import { QrCode, Brain, Bell, MapPin, Syringe, Shield, UserPlus, Tag, Search } from "lucide-react";
import { PawLogo } from "./components/paw-logo";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="min-h-[80vh] flex items-center relative" style={{ background: "linear-gradient(135deg, #FDFBF7 0%, #F5EDE6 100%)" }}>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4 animate-fade-up">
              <PawLogo size={28} />
              <span className="font-display font-bold text-lg text-[#2C1810]">PawPort</span>
            </div>

            <h1 className="font-display font-bold text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.1] text-[#2C1810]">
              <span className="inline-block animate-fade-up delay-100">Every</span>{" "}
              <span className="inline-block animate-fade-up delay-200">Cat</span>{" "}
              <span className="inline-block animate-fade-up delay-300">Deserves</span>{" "}
              <span className="inline-block animate-fade-up delay-400">a</span>{" "}
              <span className="inline-block animate-fade-up delay-500">Digital</span>{" "}
              <span className="inline-block animate-fade-up delay-600">Identity</span>
            </h1>

            <p className="mt-4 text-[#6B5B52] text-base sm:text-lg font-body leading-relaxed max-w-md animate-fade-in delay-800">
              One scan gives anyone instant access to your cat&apos;s profile, medical alerts, and emergency contacts. No app needed.
            </p>

            {/* Two-path split */}
            <div className="mt-8 grid sm:grid-cols-2 gap-3 animate-fade-up delay-1000">
              <Link href="/register" className="group block p-5 rounded-2xl border-2 border-[#E07A5F] bg-white hover:bg-[#FEF7F5] transition-all duration-200 active:scale-[0.98]">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className="text-[#E07A5F]" />
                  <span className="font-body font-semibold text-sm text-[#2C1810]">I want to protect my cat</span>
                </div>
                <p className="text-[12px] text-[#6B5B52] font-body leading-relaxed">Register, get a QR tag, track health, set up lost alerts</p>
                <span className="mt-3 inline-block btn-primary px-4 py-2 text-xs font-body font-semibold group-hover:opacity-90">Get Started Free</span>
              </Link>

              <Link href="/find" className="group block p-5 rounded-2xl border-2 border-[#81B29A] bg-white hover:bg-[#F0FAF5] transition-all duration-200 active:scale-[0.98]">
                <div className="flex items-center gap-2 mb-2">
                  <Search size={20} className="text-[#81B29A]" />
                  <span className="font-body font-semibold text-sm text-[#2C1810]">I found a cat</span>
                </div>
                <p className="text-[12px] text-[#6B5B52] font-body leading-relaxed">Enter a PIN or scan a QR code to see the owner&apos;s info</p>
                <span className="mt-3 inline-block px-4 py-2 text-xs font-body font-semibold rounded-[10px] bg-[#81B29A] text-white group-hover:opacity-90">Find Cat by PIN</span>
              </Link>
            </div>

            <p className="mt-4 text-xs text-[#6B5B52] font-body animate-fade-in delay-1200">
              Already have an account? <Link href="/login" className="text-[#E07A5F] hover:underline font-medium">Sign in</Link>
            </p>
          </div>

          {/* Right — floating cat image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-[340px] h-[420px] rounded-3xl overflow-hidden shadow-xl animate-float">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800"
                alt="Orange tabby cat looking up"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white py-4 border-y border-[#F0E6DF]">
        <div className="mx-auto max-w-4xl px-5 flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-xs sm:text-sm text-[#6B5B52] font-body">
          <span className="flex items-center gap-1.5"><QrCode size={15} className="text-[#E07A5F]" /> QR Code + PIN</span>
          <span className="hidden sm:inline text-[#E0D8D2]">|</span>
          <span className="flex items-center gap-1.5"><Brain size={15} className="text-[#E07A5F]" /> AI Health Analysis</span>
          <span className="hidden sm:inline text-[#E0D8D2]">|</span>
          <span className="flex items-center gap-1.5"><Bell size={15} className="text-[#E07A5F]" /> Temporal Workflows</span>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 sm:py-20 px-5" style={{ background: "#FDFBF7" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display font-bold text-2xl sm:text-[34px] text-center text-[#2C1810]">How It Works</h2>
          <p className="mt-1.5 text-center text-[#6B5B52] font-body text-sm">Three steps to keep your cat safe</p>

          <div className="mt-10 grid sm:grid-cols-3 gap-8 sm:gap-5 relative">
            <div className="hidden sm:block absolute top-7 left-[22%] right-[22%] h-px border-t-2 border-dashed border-[#E0D8D2]" />
            {[
              { icon: UserPlus, num: "1", title: "Register", desc: "Add photo, health info, emergency contacts. Get a QR code and 6-digit PIN." },
              { icon: Tag, num: "2", title: "Tag Collar", desc: "Print QR or write PIN on the collar. Any phone camera can scan it." },
              { icon: Bell, num: "3", title: "Stay Safe", desc: "Finders share GPS. Lost alerts escalate every 24h via Temporal." },
            ].map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="text-center relative">
                <div className="mx-auto w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 relative z-10">
                  <Icon size={18} className="text-[#E07A5F]" />
                </div>
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E07A5F] text-white text-[10px] font-bold font-body mb-1.5">{num}</div>
                <h3 className="font-body font-semibold text-[15px] text-[#2C1810]">{title}</h3>
                <p className="mt-1 text-[13px] text-[#6B5B52] font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 px-5 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display font-bold text-2xl sm:text-[34px] text-center text-[#2C1810]">Everything Your Cat Needs</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: QrCode, title: "QR Code + PIN", desc: "Unique QR and 6-digit PIN. No app download needed." },
              { icon: Brain, title: "AI Health Assistant", desc: "AI analysis with risk warnings and vet recommendations." },
              { icon: Bell, title: "Lost Cat Alerts", desc: "Temporal workflows escalate alerts every 24 hours." },
              { icon: MapPin, title: "GPS Sighting", desc: "Finders share location with one tap." },
              { icon: Syringe, title: "Medical Records", desc: "Vaccinations, allergies, dietary info in one place." },
              { icon: Shield, title: "Privacy Controls", desc: "You control what finders can see." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5">
                <Icon size={24} className="text-[#E07A5F]" />
                <h3 className="mt-2 font-body font-semibold text-[14px] text-[#2C1810]">{title}</h3>
                <p className="mt-1 text-[12px] text-[#6B5B52] font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-18 px-5 bg-[#2C1810] text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display font-bold text-2xl sm:text-[32px] text-white">Keep Your Cat Safe Today</h2>
          <p className="mt-2 text-base text-[#B8A49E] font-body">It takes less than 2 minutes to set up.</p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 font-body font-semibold text-sm">Create Free Account</Link>
            <Link href="/find" className="px-6 py-3 rounded-[10px] border-2 border-white/30 text-white font-body font-semibold text-sm hover:bg-white/10 transition-all duration-200 active:scale-[0.98]">Found a Cat? Enter PIN</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 px-5 bg-[#1A0F0A] border-t-2 border-[#E07A5F]">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PawLogo size={18} />
            <span className="font-display font-bold text-white text-sm">PawPort</span>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-[#8C7B75] text-[11px] font-body italic">Made with love for cats everywhere</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
