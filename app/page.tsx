import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-8xl">🐾</div>
          <div className="absolute top-32 right-20 text-6xl rotate-12">🐾</div>
          <div className="absolute bottom-20 left-1/4 text-7xl -rotate-12">🐾</div>
          <div className="absolute bottom-10 right-10 text-5xl rotate-45">🐾</div>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm text-indigo-700 font-medium mb-6">
            <span>🏆</span> Built for World Cat Domination Day
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
            🐾 PawPort
          </h1>
          <p className="mt-3 text-xl sm:text-2xl text-indigo-600 font-semibold">
            Digital Health Passport for Your Cat
          </p>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            One QR scan gives anyone instant access to your cat&apos;s profile, medical alerts, emergency contacts, and vaccination records. No app download needed.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-8 py-4 text-white font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
            <Link
              href="/find"
              className="rounded-xl border-2 border-gray-200 px-8 py-4 text-gray-700 font-semibold text-lg hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              🔍 I Found a Cat
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900">How It Works</h2>
          <p className="mt-2 text-center text-gray-500">Three simple steps to keep your cat safe</p>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl mb-4">
                📝
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold text-gray-900">Register Your Cat</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add your cat&apos;s profile, photo, medical info, and emergency contacts. Get a unique 6-digit PIN and QR code.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl mb-4">
                🏷️
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold text-gray-900">Tag Their Collar</h3>
              <p className="mt-2 text-sm text-gray-500">
                Print the QR code or write the PIN on your cat&apos;s collar tag. Anyone with a phone camera can scan it.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl mb-4">
                🔔
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-900">Stay Connected</h3>
              <p className="mt-2 text-sm text-gray-500">
                If your cat goes missing, finders share their GPS location instantly. Automated alerts escalate every 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900">Everything Your Cat Needs</h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-3">📱</p>
              <h3 className="font-semibold text-gray-900">QR Code + PIN</h3>
              <p className="mt-1 text-sm text-gray-500">
                Unique QR code and 6-digit PIN. No app download needed to view your cat&apos;s profile.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-3">🧠</p>
              <h3 className="font-semibold text-gray-900">AI Health Assistant</h3>
              <p className="mt-1 text-sm text-gray-500">
                AI-powered health analysis with early risk warnings, hydration monitoring, and vet recommendations.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-3">🚨</p>
              <h3 className="font-semibold text-gray-900">Lost Cat Alerts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Temporal-powered workflows automatically escalate alerts to shelters every 24 hours until your cat is found.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-3">📍</p>
              <h3 className="font-semibold text-gray-900">GPS Sighting</h3>
              <p className="mt-1 text-sm text-gray-500">
                Finders share their exact location with one tap. See where your cat was last spotted on your dashboard.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-3">💉</p>
              <h3 className="font-semibold text-gray-900">Medical Records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vaccination records, allergies, dietary restrictions, and full medical history — all in one place.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-3">🔒</p>
              <h3 className="font-semibold text-gray-900">Privacy Controls</h3>
              <p className="mt-1 text-sm text-gray-500">
                You decide what&apos;s visible. Hide your phone, address, feeding schedule, or location from the public profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">Keep Your Cat Safe Today</h2>
          <p className="mt-3 text-indigo-100 text-lg">
            Join PawPort and give your cat a digital health passport. It takes less than 2 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-4 text-indigo-700 font-semibold text-lg hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/find"
              className="rounded-xl border-2 border-white/30 px-8 py-4 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Found a Cat? Enter PIN
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          🐾 PawPort — Built with ❤️ for the #HackTheKitty Hackathon
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Powered by Next.js · Temporal · AI Health Analysis · Aikido Security
        </p>
      </footer>
    </main>
  );
}
