"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import {
  Copy,
  Check,
  Download,
  Trash2,
  Settings,
  Sparkles,
  Zap,
  Sliders,
  Code2,
  FileCode,
  RotateCcw,
  CheckCircle2,
  ArrowRightLeft,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  convertPydanticToTypeScript,
  ConversionOptions,
  ConversionResult,
} from "@/lib/converters/pydantic";
import { PYDANTIC_EXAMPLES, ExamplePreset } from "@/lib/presets/pydanticExamples";

export function PydanticConverterClient() {
  // State
  const [pythonCode, setPythonCode] = useState<string>(PYDANTIC_EXAMPLES[0].code);
  const [selectedExampleId, setSelectedExampleId] = useState<string>(PYDANTIC_EXAMPLES[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  // Conversion options
  const [options, setOptions] = useState<ConversionOptions>({
    outputType: "interface",
    exportTypes: true,
    optionalFieldsWithDefaults: true,
    nullabilityStrategy: "null",
    enumFormat: "enum",
    includeJSDoc: true,
    useFieldAlias: false,
    semicolons: true,
    dateType: "string",
  });

  const [isPending, startTransition] = useTransition();

  // Debounced conversion result
  const [conversionResult, setConversionResult] = useState<ConversionResult>(() => {
    const t0 = performance.now();
    const res = convertPydanticToTypeScript(PYDANTIC_EXAMPLES[0].code, {
      outputType: "interface",
      exportTypes: true,
      optionalFieldsWithDefaults: true,
      nullabilityStrategy: "null",
      enumFormat: "enum",
      includeJSDoc: true,
      useFieldAlias: false,
      semicolons: true,
      dateType: "string",
    });
    const t1 = performance.now();
    return res;
  });

  // Debounce conversion on input/options change (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const t0 = performance.now();
        const res = convertPydanticToTypeScript(pythonCode, options);
        const t1 = performance.now();
        setConversionResult(res);
        setExecTime(Math.max(0.1, Number((t1 - t0).toFixed(2))));
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [pythonCode, options]);

  // Handle preset change
  const handlePresetSelect = (preset: ExamplePreset) => {
    setSelectedExampleId(preset.id);
    setPythonCode(preset.code);
    showToast(`Loaded example: ${preset.name}`);
  };

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!conversionResult.code) return;
    try {
      await navigator.clipboard.writeText(conversionResult.code);
      setCopied(true);
      showToast("Copied TypeScript interfaces to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy to clipboard");
    }
  };

  // Download .ts file
  const handleDownload = () => {
    if (!conversionResult.code) return;
    const blob = new Blob([conversionResult.code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "types.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded types.ts file!");
  };

  // Clear code
  const handleClear = () => {
    setPythonCode("");
    setSelectedExampleId("");
    showToast("Cleared editor input");
  };

  // Compute line numbers
  const pythonLines = useMemo(() => {
    const count = pythonCode.split("\n").length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  }, [pythonCode]);

  const tsLines = useMemo(() => {
    const count = conversionResult.code.split("\n").length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  }, [conversionResult.code]);

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-slate-100 shadow-2xl shadow-indigo-950/80 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action / Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        {/* Preset Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
            Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PYDANTIC_EXAMPLES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedExampleId === preset.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Tools: Settings & Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              showSettings
                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                : "bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Configure output options"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Options</span>
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700/60 hover:bg-red-950/40 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
            title="Clear input"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Settings Drawer / Panel */}
      {showSettings && (
        <div className="mb-4 p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Conversion Preferences</h3>
            </div>
            <span className="text-xs text-slate-400">Updates dynamically in real-time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Output Declaration Type */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Output Structure</label>
              <select
                value={options.outputType}
                onChange={(e) =>
                  setOptions({ ...options, outputType: e.target.value as "interface" | "type" })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="interface">TypeScript Interface</option>
                <option value="type">TypeScript Type Alias</option>
              </select>
            </div>

            {/* Nullability Strategy */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Optional / Null Handling</label>
              <select
                value={options.nullabilityStrategy}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    nullabilityStrategy: e.target.value as "null" | "undefined" | "both",
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="null">T | null (Recommended for JSON)</option>
                <option value="undefined">T | undefined</option>
                <option value="both">T | null | undefined</option>
              </select>
            </div>

            {/* Enum Format */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Python Enum Format</label>
              <select
                value={options.enumFormat}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    enumFormat: e.target.value as "enum" | "union",
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="enum">TypeScript Enum (export enum)</option>
                <option value="union">Literal Union (type Role = &quot;ADMIN&quot;)</option>
              </select>
            </div>

            {/* Date Representation */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">DateTime Format</label>
              <select
                value={options.dateType}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    dateType: e.target.value as "string" | "Date",
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="string">string (ISO 8601)</option>
                <option value="Date">Date object</option>
              </select>
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={options.exportTypes}
                onChange={(e) => setOptions({ ...options, exportTypes: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Add &apos;export&apos; keyword</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={options.optionalFieldsWithDefaults}
                onChange={(e) =>
                  setOptions({ ...options, optionalFieldsWithDefaults: e.target.checked })
                }
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Mark default fields as optional (?)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={options.includeJSDoc}
                onChange={(e) => setOptions({ ...options, includeJSDoc: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Extract JSDoc / Descriptions</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={options.useFieldAlias}
                onChange={(e) => setOptions({ ...options, useFieldAlias: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Use Field(alias=&quot;...&quot;) as keys</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={options.semicolons}
                onChange={(e) => setOptions({ ...options, semicolons: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Include trailing semicolons</span>
            </label>
          </div>
        </div>
      )}

      {/* Two-Pane Editor Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Python Pydantic Input */}
        <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <div className="h-4 w-px bg-slate-700 mx-1"></div>
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                Python (Pydantic Schema)
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              {pythonLines.length} lines • {pythonCode.length} chars
            </div>
          </div>

          {/* Textarea with Line Numbers */}
          <div className="relative flex-1 min-h-[480px] bg-slate-950 flex">
            {/* Line numbers gutter */}
            <div className="select-none py-4 px-3 text-right bg-slate-950 text-slate-600 editor-font text-xs leading-6 border-r border-slate-800/80 w-12 shrink-0">
              {pythonLines.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Input textarea */}
            <textarea
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              placeholder="# Paste your Python Pydantic model here..."
              spellCheck={false}
              className="flex-1 w-full p-4 bg-transparent text-slate-100 editor-font text-xs sm:text-sm leading-6 resize-none focus:outline-none placeholder-slate-600 selection:bg-indigo-600/40 selection:text-white"
            />
          </div>
        </div>

        {/* Right Pane: TypeScript Output */}
        <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 font-mono">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                TypeScript Output (.ts)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {execTime}ms
              </span>
            </div>

            {/* Actions: Copy & Download */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!conversionResult.code}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                title="Copy generated TypeScript"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy TS"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!conversionResult.code}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Download types.ts"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Generated Code Display with Line Numbers */}
          <div className="relative flex-1 min-h-[480px] bg-slate-950 flex overflow-auto">
            {/* Line numbers gutter */}
            <div className="select-none py-4 px-3 text-right bg-slate-950 text-slate-600 editor-font text-xs leading-6 border-r border-slate-800/80 w-12 shrink-0">
              {tsLines.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Read-only output */}
            <div className="flex-1 p-4 overflow-x-auto">
              {conversionResult.error ? (
                <div className="text-red-400 text-xs font-mono p-3 bg-red-950/40 border border-red-800/60 rounded-lg">
                  {conversionResult.error}
                </div>
              ) : conversionResult.code ? (
                <pre className="editor-font text-xs sm:text-sm leading-6 text-slate-100 whitespace-pre">
                  <code>{conversionResult.code}</code>
                </pre>
              ) : (
                <div className="text-slate-600 text-xs font-mono py-6 text-center">
                  // Paste Python Pydantic models on the left to see TypeScript interfaces here
                </div>
              )}
            </div>
          </div>

          {/* Footer Stats Bar */}
          <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span>{conversionResult.classesParsed} models</span>
              <span>•</span>
              <span>{conversionResult.enumsParsed} enums</span>
              <span>•</span>
              <span>{conversionResult.typeAliasesParsed} aliases</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-3 h-3" />
              <span>Instant client-side parse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
