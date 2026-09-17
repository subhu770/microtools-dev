"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  Clock,
  Calendar,
  Zap,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Globe,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { parseCron, formatCountdown, CronParseResult } from "@/lib/cronParser";

interface CronPreset {
  name: string;
  expression: string;
  description: string;
}

const CRON_PRESETS: CronPreset[] = [
  {
    name: "Every 15 minutes",
    expression: "*/15 * * * *",
    description: "Runs every 15 minutes throughout the day",
  },
  {
    name: "Daily at midnight UTC",
    expression: "0 0 * * *",
    description: "Executes once daily at 00:00 UTC",
  },
  {
    name: "Every Monday at 9 AM",
    expression: "0 9 * * 1",
    description: "Weekly trigger on Monday mornings at 09:00",
  },
  {
    name: "First day of month",
    expression: "0 0 1 * *",
    description: "Monthly run on the 1st of every month at midnight",
  },
  {
    name: "Every weekday business hours",
    expression: "0 9-17 * * 1-5",
    description: "Hourly between 9 AM and 5 PM, Mon-Fri",
  },
];

export function CronParserClient() {
  const [expression, setExpression] = useState<string>("*/15 * * * *");
  const [copiedExpr, setCopiedExpr] = useState<boolean>(false);
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [userTimezone, setUserTimezone] = useState<string>("UTC");

  const [isPending, startTransition] = useTransition();

  // Detect user timezone safely on client mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(tz || "Local");
    } catch {
      setUserTimezone("Local");
    }
  }, []);

  // Update ticker every second for accurate countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse cron result
  const parseResult: CronParseResult = useMemo(() => {
    return parseCron(expression, currentTime, 5);
  }, [expression, currentTime]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopyExpression = async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopiedExpr(true);
      showToast("Copied cron expression!");
      setTimeout(() => setCopiedExpr(false), 2000);
    } catch {
      showToast("Failed to copy");
    }
  };

  const handleCopyDescription = async () => {
    if (!parseResult.humanDescription) return;
    try {
      await navigator.clipboard.writeText(parseResult.humanDescription);
      setCopiedDesc(true);
      showToast("Copied human explanation!");
      setTimeout(() => setCopiedDesc(false), 2000);
    } catch {
      showToast("Failed to copy");
    }
  };

  const handleSelectPreset = (preset: CronPreset) => {
    setExpression(preset.expression);
    showToast(`Loaded preset: ${preset.name}`);
  };

  // Field tokens for interactive indicator
  const parts = expression.trim().split(/\s+/);
  const fieldNames = [
    { key: "minute", label: "Minute", range: "0-59", val: parts[0] || "*" },
    { key: "hour", label: "Hour", range: "0-23", val: parts[1] || "*" },
    { key: "dayOfMonth", label: "Day (Month)", range: "1-31", val: parts[2] || "*" },
    { key: "month", label: "Month", range: "1-12", val: parts[3] || "*" },
    { key: "dayOfWeek", label: "Day (Week)", range: "0-7 (Sun-Sat)", val: parts[4] || "*" },
  ];

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-slate-100 shadow-2xl shadow-indigo-950/80 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Preset Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
            Quick Presets:
          </span>
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                expression === preset.expression
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono ml-auto">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{userTimezone}</span>
        </div>
      </div>

      {/* Main Input & Explanation Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl mb-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full"></div>

        <div className="relative z-10">
          {/* Label and Expression Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="cron-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Cron Expression (5 Parts)</span>
              </label>
              <button
                type="button"
                onClick={handleCopyExpression}
                className="text-xs text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-mono"
              >
                {copiedExpr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExpr ? "Copied" : "Copy Expression"}</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="cron-input"
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="* * * * *"
                spellCheck={false}
                className={`w-full px-5 py-4 bg-slate-900/90 rounded-2xl border text-xl sm:text-2xl font-mono text-white tracking-wider focus:outline-none transition-all shadow-inner ${
                  parseResult.isValid
                    ? "border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    : "border-red-500/60 text-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                }`}
              />
            </div>
          </div>

          {/* 5 Field Visual Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 font-mono text-xs">
            {fieldNames.map((f) => {
              const isFieldErr = parseResult.errorField === f.key;
              return (
                <div
                  key={f.key}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isFieldErr
                      ? "bg-red-950/40 border-red-500/50 text-red-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">{f.label}</div>
                  <div className="text-base font-extrabold text-indigo-400 py-0.5">{f.val}</div>
                  <div className="text-[10px] text-slate-500">{f.range}</div>
                </div>
              );
            })}
          </div>

          {/* Error Message or Human-Readable Explanation Banner */}
          {!parseResult.isValid ? (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-red-200">Syntax Error</strong>
                <span>{parseResult.error}</span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/70 to-slate-900/90 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                    Human Schedule Translation
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                    &ldquo;{parseResult.humanDescription}&rdquo;
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyDescription}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDesc ? "Copied" : "Copy Explanation"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Next 5 Executions Schedule Table */}
      {parseResult.isValid && parseResult.nextExecutions.length > 0 && (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>Next 5 Execution Schedules & Timezone Comparison</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Simulated in real-time comparing UTC timestamps against your browser local clock.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                Live Delta Ticker
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/60">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-mono">
                  <th className="p-3.5 sm:p-4">#</th>
                  <th className="p-3.5 sm:p-4">Next Run (UTC)</th>
                  <th className="p-3.5 sm:p-4">Next Run (Your Local Time: {userTimezone})</th>
                  <th className="p-3.5 sm:p-4 text-right">Time Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {parseResult.nextExecutions.map((exec, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      idx === 0 ? "bg-indigo-950/20" : ""
                    }`}
                  >
                    <td className="p-3.5 sm:p-4 text-slate-500 font-bold">
                      {idx === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 text-[10px]">
                          NEXT
                        </span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-200">{exec.utcString}</td>
                    <td className="p-3.5 sm:p-4 text-indigo-300 font-semibold">{exec.localString}</td>
                    <td className="p-3.5 sm:p-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          idx === 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse-subtle"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        {exec.relativeCountdown}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
