import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { CronParserClient } from "@/components/tools/CronParserClient";
import { CronSeoContent } from "@/components/tools/CronSeoContent";

export const metadata: Metadata = {
  title: "Cron Expression Parser & Schedule Simulator | Free Online Tool",
  description:
    "Parse, explain, and simulate cron expressions in real time. Compare next 5 runs between UTC and your local timezone completely client-side.",
  keywords: [
    "cron expression parser",
    "cron schedule simulator",
    "cron to human readable",
    "utc to local cron converter",
    "cron next run calculator",
    "cron syntax checker",
    "developer micro tools",
  ],
  alternates: {
    canonical: "https://microtools.dev/tools/cron-parser",
  },
  openGraph: {
    title: "Cron Expression Parser & Schedule Simulator | MicroTools.dev",
    description:
      "Parse, explain, and simulate cron expressions in real time. Compare next 5 runs between UTC and your local timezone completely client-side.",
    url: "https://microtools.dev/tools/cron-parser",
    siteName: "MicroTools.dev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Expression Parser & Schedule Simulator | Free Online Tool",
    description:
      "Parse, explain, and simulate cron expressions in real time with UTC and Local timezone comparison.",
  },
};

// Schema.org WebApplication JSON-LD
const cronJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Cron Expression Parser & Schedule Simulator",
  url: "https://microtools.dev/tools/cron-parser",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Client-side cron expression parser that translates 5-part cron syntax into plain English and computes upcoming execution schedules in both UTC and local timezone.",
  featureList: [
    "5-part standard POSIX cron syntax support",
    "Human-readable English schedule translation",
    "Next 5 execution schedule calculator for both UTC and Local timezone",
    "Live millisecond delta countdown timer",
    "100% client-side calculation with zero server telemetry",
  ],
  browserRequirements: "Requires JavaScript. Requires HTML5.",
};

export default function CronParserPage() {
  return (
    <main className="min-h-screen">
      {/* JSON-LD Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cronJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-500">Developer Tools</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-indigo-400 font-medium">Cron Expression Parser</span>
        </nav>

        {/* Hero & Title */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Standard 5-Part POSIX Cron
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              UTC & Local Timezone Simulation
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Cron Expression Parser & Simulator
          </h1>
          <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            Parse, translate, and verify cron expressions in real time. Inspect granular field breakdowns,
            generate human-readable explanations, and compare next execution timestamps between UTC and your local clock.
          </p>
        </div>

        {/* Client Interactive Component */}
        <CronParserClient />

        {/* 400+ Words Technical Documentation & FAQ */}
        <CronSeoContent />
      </div>
    </main>
  );
}
