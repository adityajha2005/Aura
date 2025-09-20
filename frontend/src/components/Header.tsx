"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "AI DEX", path: "/ai-dex" },
    { name: "Launchpad", path: "/launchpad" },
    { name: "Magic Links", path: "/magic-links" },
    { name: "Governance", path: "/governance" },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };
  return (
    <header className="fixed w-full h-16 z-20 bg-transparent backdrop-blur-2xl flex items-center justify-between px-8  ">
      {/* Logo */}
      <div className="flex items-center">
        <div className="text-white text-2xl font-bold">
          <span className="text-red-800">A</span>URA
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex items-center space-x-2 bg-tranparent backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`transition-all duration-300 px-4 py-1 rounded-full ${
              isActive(item.path)
                ? "bg-transparent text-white border border-white/30 shadow-inner"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
            style={
              isActive(item.path)
                ? {
                    boxShadow:
                      "inset 0 0 16px rgba(239, 68, 68, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)",
                  }
                : {}
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Right Side Buttons glassmorphic button*/}
      <div className="flex items-center space-x-4">
        <button
          className=" backdrop-blur-md border border-white/20 hover:bg-white/10 transition-all duration-300 px-6 py-2 rounded-full text-white shadow-inner"
          style={{
            boxShadow:
              "inset 0 0 16px rgba(239, 68, 68, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Connect Wallet
        </button>
      </div>
    </header>
  );
}

export default Header;
