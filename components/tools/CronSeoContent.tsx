"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, BookOpen, Layers, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const CRON_FAQS: FaqItem[] = [
  {
    question: "What is the standard 5-part cron syntax?",
    answer:
      "Standard Unix/Linux cron expressions consist of five space-separated fields: [minute] [hour] [day-of-month] [month] [day-of-week]. Each field specifies when a recurring task or scheduled job should trigger. For example, '0 0 * * *' executes every day at midnight.",
  },
  {
    question: "How do step values (*/n) and ranges (a-b) work in cron?",
    answer:
      "The forward slash '/' operator specifies step values through a range. For instance, '*/15' in the minute field means every 15 minutes (0, 15, 30, 45). The hyphen '-' operator defines an inclusive range, such as '9-17' in the hour field to execute hourly between 9 AM and 5 PM.",
  },
  {
    question: "Why do cron jobs fail or drift around Daylight Saving Time (DST)?",
    answer:
      "When servers run in local timezones with Daylight Saving Time transitions, a 2:30 AM job might run twice during the 'fall back' transition or get skipped completely during the 'spring forward' transition. Best practice is to always configure server infrastructure and cron jobs in UTC, and use this simulator to verify your local time equivalents.",
  },
  {
    question: "How does Day of Month vs. Day of Week evaluate when both are specified?",
    answer:
      "In standard POSIX cron specification, if both day-of-month and day-of-week fields are specified with values other than asterisk (*), the cron daemon uses an OR relationship. The command will run on any day matching either the day-of-month OR the day-of-week condition.",
  },
  {
    question: "Is this cron simulator compatible with AWS EventBridge, GitHub Actions, and Google Cloud Scheduler?",
    answer:
      "Yes. Standard 5-part expressions evaluated here directly apply to Linux crontab, GitHub Actions workflow schedules, Kubernetes CronJobs, AWS EventBridge cron schedules, and Google Cloud Scheduler. (Note: AWS EventBridge also supports a 6th year field and the '?' wildcard).",
  },
];

export function CronSeoContent() {
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
          <span>Complete Technical Guide & Reference</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Mastering Cron Expressions: Syntax, Timezones & Cloud Scheduling
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
          A developer guide to constructing robust background tasks, understanding POSIX cron syntax,
          and avoiding subtle UTC versus local timezone execution pitfalls.
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
              Anatomy of the 5-Field Unix Cron Expression
            </h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Standard Unix cron expressions represent temporal schedules through five distinct parameters ordered from smallest to largest unit of time:{" "}
            <strong className="text-slate-200">Minute</strong> (0-59),{" "}
            <strong className="text-slate-200">Hour</strong> (0-23 in 24-hour format),{" "}
            <strong className="text-slate-200">Day of Month</strong> (1-31),{" "}
            <strong className="text-slate-200">Month</strong> (1-12 or JAN-DEC), and{" "}
            <strong className="text-slate-200">Day of Week</strong> (0-7, where both 0 and 7 represent Sunday).
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              02
            </div>
            <h3 className="text-lg font-semibold text-white">
              The UTC vs. Local Timezone Execution Trap
            </h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            In modern cloud environments like AWS Lambda, Kubernetes, or GitHub Actions, runners execute on UTC system clocks by default. Scheduling a job for <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">0 9 * * 1</code> in UTC means it executes at 9:00 AM UTC, which corresponds to 1:00 AM PST or 2:30 PM IST. Simulating UTC and Local time side-by-side eliminates misfires.
          </p>
        </div>
      </div>

      {/* Syntax Quick Reference Table */}
      <div className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">
            Cron Operator Quick Reference Cheat Sheet
          </h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300 font-mono">
                <th className="p-3.5 sm:p-4">Operator</th>
                <th className="p-3.5 sm:p-4">Name</th>
                <th className="p-3.5 sm:p-4">Example Expression</th>
                <th className="p-3.5 sm:p-4">Explanation & Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-indigo-400 font-bold">*</td>
                <td className="p-3.5 sm:p-4 text-slate-200">Wildcard (All)</td>
                <td className="p-3.5 sm:p-4 text-emerald-400">* * * * *</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Matches every allowed value in the target field (e.g. every minute, every hour).
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-indigo-400 font-bold">,</td>
                <td className="p-3.5 sm:p-4 text-slate-200">List (Union)</td>
                <td className="p-3.5 sm:p-4 text-emerald-400">0 0 1,15 * *</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Specifies discrete values. Runs on both day 1 and day 15 of every month.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-indigo-400 font-bold">-</td>
                <td className="p-3.5 sm:p-4 text-slate-200">Range</td>
                <td className="p-3.5 sm:p-4 text-emerald-400">0 9-17 * * 1-5</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Defines an inclusive range. Runs hourly from 09:00 through 17:00 on weekdays (Mon-Fri).
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 sm:p-4 text-indigo-400 font-bold">/</td>
                <td className="p-3.5 sm:p-4 text-slate-200">Step Interval</td>
                <td className="p-3.5 sm:p-4 text-emerald-400">*/15 * * * *</td>
                <td className="p-3.5 sm:p-4 font-sans text-slate-400">
                  Specifies incremental intervals. Triggers at minutes 0, 15, 30, and 45 of every hour.
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
          {CRON_FAQS.map((faq, idx) => (
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

      {/* Call to Action Guarantee */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-950 border border-indigo-500/20 text-center">
        <h4 className="text-lg font-bold text-white mb-2">Simulate Before You Deploy</h4>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mb-4">
          Verify your schedule expressions in real time, compare UTC vs local executions, and avoid
          accidental midnight production incidents.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero Server Dependencies • 100% Client-Side Engine • Private & Instant</span>
        </div>
      </div>
    </article>
  );
}
