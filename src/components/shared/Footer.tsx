import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0F6E56] rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">Medora</span>
        </div>
        <p className="text-xs text-gray-400">© 2026 Medora. All rights reserved.</p>
        <div className="flex gap-4 text-xs text-gray-400">
          <Link href="#" className="hover:text-gray-600 transition">Privacy</Link>
          <Link href="#" className="hover:text-gray-600 transition">Terms</Link>
          <Link href="#" className="hover:text-gray-600 transition">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
