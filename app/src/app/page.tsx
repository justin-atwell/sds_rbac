"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, utils } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../idl/sds_rbac.json";
import { useEffect, useState } from "react";
import { useRbac } from "@/hooks/useRbac";

export default function Home() {
  const { publicKey, wallet, connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const { connection } = useConnection();

  const { role, loading, revokeUser } = useRbac();

  const initializeAdmin = async () => {
    // 1. Safety check
    if (!publicKey || !wallet || !wallet.adapter) return;

    try {
      // 2. The Fix: Cast the adapter to 'any' or the specific Signer type
      const anchorWallet = {
        publicKey: publicKey,
        // We use 'as any' here to bypass the strict Adapter check 
        // because we know Phantom supports these methods.
        signTransaction: (tx: any) => (wallet.adapter as any).signTransaction(tx),
        signAllTransactions: (txs: any[]) => (wallet.adapter as any).signAllTransactions(txs),
      };

      const provider = new AnchorProvider(connection, anchorWallet as any, {
        commitment: "confirmed",
      });

      const program = new Program(idl as Idl, provider);

      // ... derivation and method call continue as before ...
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user-role"), publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeUser({ admin: {} })
        .accounts({
          userProfile: profilePda,
          targetUser: publicKey,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert("Success! You are now the Admin.");
      window.location.reload();
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const handleRevoke = async () => {
    if (!publicKey) return;
    const success = await revokeUser(publicKey);
    if (success) {
      alert("Role Revoked. SOL reclaimed.");
      window.location.reload();
    }
  };


  // Prevent hydration mismatch (standard practice for Solana dApps)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {!connection ? (
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
                {/* Dynamic Icon/Text */}
                <span className="text-purple-400 font-bold">
                  {loading ? "..." : role?.charAt(0) || "?"}
                </span>
              </div>
              <div>
                {/* DYNAMIC ROLE TEXT HERE */}
                <p className="text-2xl font-bold text-white">
                  {loading ? "Loading..." : role}
                </p>
                <p className="text-gray-500 text-sm italic">
                  {role === "Uninitialized" ? "Run setup to define your role" : "On-chain permissions active"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Area */}


          <div className="md:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-gray-400 font-medium">
              {role === "Uninitialized"
                ? "Your identity isn't on-chain yet."
                : `Welcome back, ${role}.`}
            </span>

            {role === "Uninitialized" && (
              <button
                onClick={initializeAdmin}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20"
              >
                Initialize Admin Profile
              </button>
            )}
            {role !== "Uninitialized" && (
              <button
                onClick={handleRevoke}
                className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors underline"
              >
                Revoke Identity & Reclaim Rent
              </button>
            )}

          </div>

        </div>
      )}
    </div>
  );
}