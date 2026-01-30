import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import { WalletConnectBtn } from "@/components/WalletConnectBtn";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SDS RBAC | Dashboard",
  description: "Secure Role-Based Access Control on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <div className="flex flex-col min-h-screen">
            {/* Sexy Glassmorphic Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
              <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg rotate-12 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/50">
                    <div className="flex items-center gap-2">
                      {/* Logo stuff */}
                    </div>
                  </div>
                  <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    <div className="flex items-center">
                      <WalletConnectBtn />
                    </div>
                  </span>
                </div>

                {/* We'll put the Wallet Button in its own client component later */}
                <div id="wallet-button-portal"></div>
              </div>
            </nav>

            <main className="flex-grow container mx-auto px-6 py-8">
              {children}
            </main>

            <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm">
              © 2026 Solana Development Services. Built with Hedera-level precision.
            </footer>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}