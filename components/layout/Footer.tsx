import Link from "next/link";
import { Code2, ShieldCheck, Cpu, Terminal, Clock, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-base font-bold text-white">
                Micro<span className="text-indigo-400">Tools</span>.dev
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              High-performance, zero-latency micro-tools designed specifically for software engineers.
              All data transformations execute locally in your web browser with zero backend telemetry.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Server Uploads</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Cpu className="w-4 h-4" />
                <span>100% Client-Side Engine</span>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Micro Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/tools/pydantic-to-typescript"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Pydantic to TypeScript
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/cron-parser"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Cron Expression Parser
                </Link>
              </li>
            </ul>
          </div>

          {/* Open Source / Tech */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Stack & Performance
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between">
                <span>Framework</span>
                <span className="text-slate-200 font-mono">Next.js 15 (App Router)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Styling</span>
                <span className="text-slate-200 font-mono">Tailwind CSS</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Engine</span>
                <span className="text-slate-200 font-mono">Pure Client TypeScript</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Hosting</span>
                <span className="text-slate-200 font-mono">Static Edge CDN</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MicroTools.dev — Built for fast full-stack development.</p>
          <p className="flex items-center gap-1">
            Privacy Guaranteed: Your source code and data never leave your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
