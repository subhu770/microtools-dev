"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, BookOpen, Layers, CheckCircle2, ArrowRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does this tool convert Pydantic v1 vs Pydantic v2 models?",
    answer:
      "This converter automatically detects both Pydantic v1 patterns (like inner class Config, @validator, and legacy Field syntax) and modern Pydantic v2 patterns (like model_config = ConfigDict(...), @field_validator, Annotated[T, Field(...)], and native pipe unions A | B). It strips out Python-specific validation logic and generates clean, standard TypeScript interfaces or types.",
  },
  {
    question: "Is my source code or sensitive schema uploaded to any server?",
    answer:
      "No. All parsing and TypeScript code generation executes 100% locally inside your browser using our client-side AST engine. No network requests or telemetry are sent to any server, making this tool completely secure for proprietary production schemas and enterprise codebases.",
  },
  {
    question: "How are default values and Optional fields handled?",
    answer:
      "In Pydantic, fields with default values (e.g. name: str = 'default' or tags: List[str] = Field(default_factory=list)) are not required when instantiating the model or receiving JSON payloads. Our converter marks these fields with the TypeScript optional modifier '?' (e.g., name?: string;). You can customize whether to map Optionals to 'null', 'undefined', or both.",
  },
  {
    question: "Does it support Python Enums, nested models, and inheritance?",
    answer:
      "Yes. Python Enum subclasses (e.g. class Status(str, Enum)) are converted to either standard TypeScript 'enum' declarations or TypeScript string union types based on your preferences. Nested Pydantic models (e.g. List[OrderItem] or Dict[str, UserProfile]) and class inheritance (class Admin(User)) are preserved as TypeScript 'extends' hierarchies.",
  },
  {
    question: "Can I use the generated TypeScript interfaces directly with FastAPI or Next.js?",
    answer:
      "Yes! The generated types align directly with the JSON serialization format produced by FastAPI, Django Ninja, and Pydantic. You can paste the generated code directly into your React, Next.js, Vue, Angular, or Node.js frontend codebase or API client layer for end-to-end type safety.",
  },
];

export function SeoContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <article className="mt-16 pt-12 border-t border-slate-800/80 text-slate-300">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Comprehensive Technical Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pydantic to TypeScript: Bridging Python Backends & Modern Frontends
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
          A deep dive into cross-language type synchronization between FastAPI, Python Pydantic models,
          and TypeScript interfaces without heavyweight code generation pipelines.
        </p>
      </div>

      {/* Grid of technical explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Section 1 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              01
            </div>
            <h3 className="text-lg font-semibold text-white">
              End-to-End Type Safety in Full-Stack Python
            </h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Modern full-stack architectures frequently pair high-speed Python backends (like{" "}
            <strong className="text-slate-200">FastAPI</strong>,{" "}
            <strong className="text-slate-200">Django Ninja</strong>, or{" "}
            <strong className="text-slate-200">Litestar</strong>) with TypeScript frontends (such as{" "}
            <strong className="text-slate-200">Next.js</strong>,{" "}
            <strong className="text-slate-200">React</strong>, and{" "}
            <strong className="text-slate-200">Vue</strong>). While Pydantic guarantees runtime data
            validation and serialization on the Python server, frontends require static TypeScript
            interfaces to prevent runtime runtime errors, enable IDE auto-completion, and streamline refactoring.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              02
            </div>
            <h3 className="text-lg font-semibold text-white">
              Pydantic v1 vs. Pydantic v2 Architectural Nuances
            </h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pydantic v2 introduced major paradigm shifts, including the Rust-powered{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">
              pydantic-core
            </code>
            , the deprecation of <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">class Config</code> in favor of{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">ConfigDict</code>, and the widespread adoption of standard Python 3.10+ PEP 604 union types (
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">str | None</code>) and PEP 593 Annotated metadata. Our converter transparently unifies both conventions into cohesive TypeScript interfaces.
          </p>
        </div>
      </div>

      {/* Type Mapping Reference Table */}
      <div className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">
            Python Pydantic to TypeScript Type Mapping Reference
          </h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300 font-mono">
                <th className="p-3.5 sm:p-4">Python / Pydantic Type</th>
                <th className="p-3.5 sm:p-4">TypeScript Equivalent</th>
                <th className="p-3.5 sm:p-4">Notes & Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">str, EmailStr, HttpUrl, UUID</td>
                <td className="p-3.5 sm:p-4 text-sky-400">string</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Serialized as ISO-standard strings in JSON.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">int, float, Decimal, PositiveInt</td>
                <td className="p-3.5 sm:p-4 text-sky-400">number</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Numeric types map directly to JavaScript number primitives.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">bool, StrictBool</td>
                <td className="p-3.5 sm:p-4 text-sky-400">boolean</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Standard boolean flag representation.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">datetime, date, time</td>
                <td className="p-3.5 sm:p-4 text-sky-400">string</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  ISO-8601 formatted datetime strings over JSON transport.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">Optional[T], T | None</td>
                <td className="p-3.5 sm:p-4 text-sky-400">T | null (or T?)</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Nullability strategy customizable between null & undefined.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">List[T], Sequence[T], Set[T]</td>
                <td className="p-3.5 sm:p-4 text-sky-400">T[]</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Array types with proper parentheses for union elements.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">Dict[K, V], Mapping[K, V]</td>
                <td className="p-3.5 sm:p-4 text-sky-400">Record&lt;K, V&gt;</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Key types restricted to valid JavaScript dictionary index types.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">Literal[&quot;A&quot;, &quot;B&quot;]</td>
                <td className="p-3.5 sm:p-4 text-sky-400">&quot;A&quot; | &quot;B&quot;</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  TypeScript exact string or number literal union.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-emerald-400">Field(..., description=&quot;...&quot;)</td>
                <td className="p-3.5 sm:p-4 text-sky-400">/** JSDoc comment */</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Field descriptions and docstrings converted to JSDoc comments.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-medium text-slate-200 hover:text-white transition-colors"
                aria-expanded={openFaq === idx}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-950 border border-indigo-500/20 text-center">
        <h4 className="text-lg font-bold text-white mb-2">Ready to speed up your development workflow?</h4>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mb-4">
          Paste your Pydantic schema above, adjust your output preferences, and copy clean TypeScript
          interfaces instantly.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>Zero Server Calls • 100% Client-Side • Sub-Millisecond Speed</span>
        </div>
      </div>
    </article>
  );
}
