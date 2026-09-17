import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://microtools.dev"),
  title: {
    default: "MicroTools.dev — Fast, Zero-Telemetry Developer Tools",
    template: "%s | MicroTools.dev",
  },
  description:
    "Free, high-performance developer micro-tools running 100% in your browser. Pydantic to TypeScript converter, JSON tools, regex testers, and schema generators.",
  keywords: [
    "developer tools",
    "pydantic to typescript",
    "python to ts",
    "schema converter",
    "fastapi developer tools",
    "client-side devtools",
  ],
  authors: [{ name: "MicroTools Team" }],
  creator: "MicroTools.dev",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-600/30 selection:text-indigo-200">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
