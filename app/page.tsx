import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-indigo-600">StudySync</span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          AI-Powered Study Network
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Find your perfect{" "}
          <span className="text-indigo-600">study partner</span> in seconds
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          StudySync matches you with compatible peers based on your courses,
          schedule, and learning style — then helps you prepare with AI-generated
          study guides.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-lg"
          >
            Start Studying Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors text-lg"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>
          Built for House of Edtech · Assignment Sep 2026.1 ·{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-600"
          >
            GitHub
          </a>{" "}
          ·{" "}
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-600"
          >
            LinkedIn
          </a>
        </p>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: "🎯",
    title: "Smart Matching Engine",
    description:
      "Our algorithm weighs course overlap, availability, trust scores, and past ratings to surface the most compatible study partners.",
  },
  {
    icon: "🤖",
    title: "AI Study Guides",
    description:
      "Paste your notes and instantly receive a structured summary plus 5–10 quiz questions, streamed live via Groq.",
  },
  {
    icon: "⭐",
    title: "Trust Score System",
    description:
      "Ratings and attendance track record evolve into a dynamic trust score, rewarding reliable partners.",
  },
];
