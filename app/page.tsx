import Link from "next/link";
import {
  Code2,
  Terminal,
  Clock,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/80">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Developer-First Micro-Tools Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            High-Performance Developer Tools.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Zero Server Latency.
            </span>
          </h1>

          <p className="mt-6 text-zinc-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Instant client-side transformations for modern software engineers. All parsers, conversions,
            and schedule simulators run strictly in your web browser with zero backend dependencies.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tools/pydantic-to-typescript"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center gap-2 group"
            >
              <span>Launch Pydantic to TS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/tools/cron-parser"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 shadow-xl transition-all flex items-center gap-2 group"
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Launch Cron Parser</span>
            </Link>
          </div>

          {/* Privacy & Speed Pillars */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">100% Private</h2>
                <p className="text-xs text-zinc-300 mt-1">
                  Data never leaves your browser. Zero server telemetry or logging.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Sub-Millisecond</h2>
                <p className="text-xs text-zinc-300 mt-1">
                  Real-time live debounced parsing and countdown ticker on every keystroke.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Static Edge</h2>
                <p className="text-xs text-zinc-300 mt-1">
                  Zero server API routes. Pure client-side JavaScript execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Micro-Tools Directory */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Micro-Tools Directory</h2>
            <p className="text-sm text-zinc-300 mt-1">
              Select a specialized developer tool to get started immediately.
            </p>
          </div>
          <span className="text-xs font-mono bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-1 rounded-full font-medium">
            2 Tools Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Tool Card 1: Pydantic to TypeScript */}
          <Link
            href="/tools/pydantic-to-typescript"
            className="group relative p-6 sm:p-7 rounded-2xl bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                  Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                Pydantic to TypeScript Converter
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-400" />
              </h3>

              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                Convert Python Pydantic v1 and v2 models into TypeScript interfaces and type definitions
                with instant live keystroke conversion and full edge-case type mapping.
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  Optional[T]
                </span>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  T | None
                </span>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  Field(...)
                </span>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  Enums
                </span>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  Dict[K, V]
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-blue-400 group-hover:text-blue-300 font-medium">Open Tool &rarr;</span>
              <span className="font-mono text-zinc-300">v1/v2 Ready</span>
            </div>
          </Link>

          {/* Tool Card 2: Cron Parser & Simulator */}
          <Link
            href="/tools/cron-parser"
            className="group relative p-6 sm:p-7 rounded-2xl bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                  New
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                Cron Expression Parser & Simulator
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-400" />
              </h3>

              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                Parse 5-part cron syntax into plain English, inspect field breakdowns, and simulate upcoming
                executions comparing UTC and Local timezones with live countdowns.
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  5-Part POSIX
                </span>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  Next 5 Runs
                </span>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  UTC vs Local
                </span>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg">
                  Human Translation
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-blue-400 group-hover:text-blue-300 font-medium">Open Tool &rarr;</span>
              <span className="font-mono text-zinc-300">Live Ticker</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
