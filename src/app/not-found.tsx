export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc]">
      <h1 className="text-5xl font-extrabold text-[#2c3e5f] mb-4">404</h1>
      <p className="text-lg text-[#4A5B6E] mb-8">
        This page could not be found.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-[#00e096] text-white rounded-lg font-bold shadow hover:bg-[#00c080] transition"
      >
        Go Home
      </a>
    </div>
  );
}
