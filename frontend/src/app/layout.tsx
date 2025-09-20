import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import { StarsBackground } from "@/components/ui/stars-background";
import { ttFirsNeue, dmSans } from "@/lib/fonts";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Aura Protocol",
  description: "Aura Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased font-sans ${ttFirsNeue.variable} ${dmSans.variable}`}
      >
        <div className="min-h-screen w-full  relative overflow-hidden">
          <StarsBackground
            className="z-10"
            starDensity={0.0001}
            minTwinkleSpeed={0.3}
            maxTwinkleSpeed={1.2}
          />

          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundImage: `
       radial-gradient(circle at center, rgba(255, 0, 0, 0.18), transparent)
     `,
            }}
          />
          <Providers>
            <Header />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </div>
      </body>
    </html>
  );
}
