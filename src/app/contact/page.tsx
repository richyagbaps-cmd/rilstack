import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4fa] p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#2c3e5f] mb-4">Contact Us</h1>
        <ul className="text-[#4A5B6E] text-lg mb-8">
          <li>
            Email:{" "}
            <a
              href="mailto:rickinvestmentslimited@gmail.com"
              className="text-[#00e096] underline"
            >
              rickinvestmentslimited@gmail.com
            </a>
          </li>
          <li>
            Phone:{" "}
            <a href="tel:+2348116883025" className="text-[#00e096] underline">
              +234 811 688 3025
            </a>
          </li>
          <li>Address: Plot 233 Ago Palace Way, Okota, Lagos, Nigeria</li>
        </ul>
        <Link
          href="/"
          className="inline-block rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46]"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
