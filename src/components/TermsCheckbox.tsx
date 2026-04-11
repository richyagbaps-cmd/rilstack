"use client";
import { useState } from "react";

export default function TermsCheckbox({ agreed, setAgreed }: { agreed: boolean; setAgreed: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-[#4A5B6E] mt-4">
      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required />
      I agree to the <a href="/terms" target="_blank" className="underline text-[#00e096]">Terms and Conditions</a>
    </label>
  );
}
