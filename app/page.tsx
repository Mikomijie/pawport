import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          PawPort
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          A digital passport for your cat. One QR scan = instant access to your cat&apos;s profile, contact info, and vaccination records.
        </p>
        <p className="mt-2 text-lg text-indigo-600 font-medium">
          Keep your cat safe. Help them find their way home.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-md"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-2xl mb-2">📱</p>
            <h3 className="font-semibold">QR Code Tag</h3>
            <p className="mt-1 text-sm text-gray-600">
              Generate a unique QR code for your cat&apos;s collar. Anyone can scan it — no app needed.
            </p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-2xl mb-2">🚨</p>
            <h3 className="font-semibold">Lost Cat Alerts</h3>
            <p className="mt-1 text-sm text-gray-600">
              Mark your cat as lost and we&apos;ll automatically escalate alerts to nearby shelters every 24 hours.
            </p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-2xl mb-2">📍</p>
            <h3 className="font-semibold">Found Cat GPS</h3>
            <p className="mt-1 text-sm text-gray-600">
              Finders can share their exact GPS location with one tap so you know where your cat was last seen.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
