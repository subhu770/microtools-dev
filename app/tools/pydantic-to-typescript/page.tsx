import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Sparkles, Terminal, ShieldCheck } from "lucide-react";
import { PydanticConverterClient } from "@/components/tools/PydanticConverterClient";
import { SeoContent } from "@/components/tools/SeoContent";

export const metadata: Metadata = {
  title: "Pydantic to TypeScript Converter | Free Online Developer Tool",
  description:
    "Convert Python Pydantic v1 & v2 models into TypeScript interfaces and type definitions instantly in your browser. 100% client-side, zero backend dependencies, private & secure.",
  keywords: [
    "pydantic to typescript",
    "python to typescript converter",
    "pydantic v2 to ts interface",
    "fastapi typescript models",
    "pydantic schema to typescript",
    "pydantic converter",
    "python dataclass to typescript",
    "developer micro tools",
  ],
  alternates: {
    canonical: "https://microtools.dev/tools/pydantic-to-typescript",
  },
  openGraph: {
    title: "Pydantic to TypeScript Converter — Free & Private Developer Tool",
    description:
      "Transform Python Pydantic v1/v2 models to TypeScript interfaces with instant live debounce, full type mapping, and 100% client-side execution.",
    url: "https://microtools.dev/tools/pydantic-to-typescript",
    siteName: "MicroTools.dev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pydantic to TypeScript Converter | MicroTools.dev",
    description:
      "Convert Python Pydantic v1 & v2 models into TypeScript interfaces and types instantly. 100% private and client-side.",
  },
};

// Schema.org WebApplication JSON-LD
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pydantic to TypeScript Converter",
  url: "https://microtools.dev/tools/pydantic-to-typescript",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Instant client-side converter that transforms Python Pydantic v1 and v2 models into clean, idiomatic TypeScript interfaces and type definitions.",
  featureList: [
    "Pydantic v1 and v2 syntax compatibility",
    "Support for Optional[T], T | None, Union, List, and Dict types",
    "Automatic stripping of Field(...) and preservation of descriptions as JSDoc",
    "TypeScript interface and type alias generation",
    "100% client-side data privacy with zero server API routes",
  ],
  browserRequirements: "Requires JavaScript. Requires HTML5.",
};

export default function PydanticConverterPage() {
  return (
    <main className="min-h-screen">
      {/* JSON-LD Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          <span className="text-indigo-400 font-medium">Pydantic to TypeScript</span>
        </nav>

        {/* Hero & Title */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Pydantic v1 & v2 Compatible
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Server Dependencies
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Pydantic to TypeScript Converter
          </h1>
          <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            Instantly transform Python Pydantic models into clean TypeScript interfaces.
            Handles <code className="text-indigo-300 font-mono text-sm">Optional[T]</code>,{" "}
            <code className="text-indigo-300 font-mono text-sm">T | None</code>,{" "}
            <code className="text-indigo-300 font-mono text-sm">List[T]</code>,{" "}
            <code className="text-indigo-300 font-mono text-sm">Dict[K, V]</code>, Enums, default values, and strips{" "}
            <code className="text-indigo-300 font-mono text-sm">Field(...)</code> decorators with live keystroke conversion.
          </p>
        </div>

        {/* Client Interactive Converter Component */}
        <PydanticConverterClient />

        {/* 300+ Words Technical SEO & Documentation Section */}
        <SeoContent />
      </div>
    </main>
  );
}
