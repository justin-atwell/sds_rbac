"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch (standard practice for Solana dApps)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {!connected ? (
        /* The "Logged Out" Hero */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">
            Secure Your <span className="text-purple-500">Protocol.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            The next generation of Role-Based Access Control on Solana. 
            Connect your wallet to manage permissions for the SDS network.
          </p>
          <div className="pt-4 text-sm text-gray-500">
            Switch your wallet to <code className="bg-gray-800 px-2 py-1 rounded">Localhost</code> to begin.
          </div>
        </div>
      ) : (
        /* The "Logged In" Dashboard */
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
          
          {/* Identity Card */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-left shadow-2xl">
            <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-4">Connected Identity</h2>
            <div className="space-y-2">
              <p className="text-2xl font-mono text-white truncate">
                {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
              </p>
              <p className="text-gray-500 text-sm">Status: Verified on Cluster</p>
            </div>
          </div>

          {/* RBAC Role Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 backdrop-blur-xl text-left">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Assigned Role</h2>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                <span className="text-purple-400 font-bold">?</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Uninitialized</p>
                <p className="text-gray-500 text-sm italic">Run setup to define your role</p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-gray-400">Ready to test the RBAC constraints?</span>
            <button className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-purple-500 hover:text-white transition-all">
              Initialize Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}