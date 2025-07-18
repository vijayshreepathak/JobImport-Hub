export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <nav className="flex justify-center py-6 bg-white/80 shadow-lg sticky top-0 z-10">
        <div className="flex gap-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-2 shadow-lg">
          <a
            href="/"
            className="text-white font-semibold text-lg px-4 py-2 rounded-full hover:bg-white hover:text-blue-700 transition"
          >
            Dashboard
          </a>
          <a
            href="/history"
            className="text-white font-semibold text-lg px-4 py-2 rounded-full hover:bg-white hover:text-purple-700 transition"
          >
            History
          </a>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto py-12 px-4">{children}</main>
    </div>
  );
}
