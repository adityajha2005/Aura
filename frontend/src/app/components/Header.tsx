import React from "react";

function Header() {
  return (
    <header className="w-full h-16 bg-transparent backdrop-blur-2xl flex items-center justify-between px-8">
      {/* Logo */}
      <div className="flex items-center">
        <div className="text-white text-2xl font-bold">
          <span className="text-red-800">A</span>URA
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex items-center space-x-8 border-1 border-gray-700 px-4 py-2 rounded-full">
        <a
          href="#"
          className="text-gray-300 hover:text-white transition-colors"
        >
          {/* active */}

          <div className="text-gray-100 border-1 border-gray-700 rounded-full px-3 py-1">
            Home
          </div>
        </a>
        <a
          href="#"
          className="text-gray-300 hover:text-white transition-colors"
        >
          DeFi Methods
        </a>
        <a
          href="#"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Exchange
        </a>
        <a
          href="#"
          className="text-gray-300 hover:text-white transition-colors"
        >
          NOS
        </a>
        <a
          href="#"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Pricing
        </a>
      </nav>

      {/* Right Side Buttons glassmorphic button*/}
      <div className="flex items-center space-x-4">
        <button
          className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 px-6 py-2 rounded-full text-white shadow-inner"
          style={{
            boxShadow:
              "inset 0 0 8px rgba(239, 68, 68, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Connect Wallet
        </button>
      </div>
    </header>
  );
}

export default Header;
