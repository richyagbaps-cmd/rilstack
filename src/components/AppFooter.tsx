import React from "react";
import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 py-6 mt-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <div className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Rilstack. All rights reserved.
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <Link href="/terms" className="underline hover:text-blue-700">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="underline hover:text-blue-700">
            Privacy Policy
          </Link>
          <Link href="/security" className="underline hover:text-blue-700">
            Security
          </Link>
        </div>
      </div>
    </footer>
  );
}
