import Link from "next/link";

export default function TeamPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4fa] p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#2c3e5f] mb-4">Our Team</h1>
        <ul className="space-y-2 text-[#4A5B6E] text-lg mb-8">
          <li><span className="font-semibold">Agbapuru Chiso R. E. FA (CFA)</span> – Chief Executive Officer, Founder, Board Chairman</li>
          <li><span className="font-semibold">Iwuh Chidubem</span> – Chief Operations, Co-Founder, Board Member</li>
          <li><span className="font-semibold">Vicmanuel Somtolisa Love</span> – Chief Risk Officer, Board Secretary</li>
          <li><span className="font-semibold">Ojiaka Merit</span> – Chief Marketing Officer, Board Vice Chair, Managing Director</li>
          <li><span className="font-semibold">Ayobanjo Isreal</span> – Chief Financial Officer, Board Member</li>
          <li><span className="font-semibold">Agbapuru Chioma Esq.</span> – Chief Legal Officer, Company Secretary</li>
        </ul>
        <Link href="/" className="inline-block rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46]">Home</Link>
      </div>
    </div>
  );
}
