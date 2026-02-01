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
  const [targetWallet, setTargetWallet] = useState("");
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
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 selection:text-purple-200 p-4 md:p-8">
      {/* Top Navigation Bar */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg rotate-12" />
          <span className="text-xl font-black tracking-tighter uppercase">Solana Directory Service <span className="text-gray-500">RBAC</span></span>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs font-mono text-gray-400">
            {publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "Disconnected"}
          </span>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto">
        {!connected ? (
          /* The "Logged Out" Hero */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
              Secure Your <br /> Protocol.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
              Enterprise-grade Role Based Access Control for the SDS ecosystem.
              Deploy, manage, and revoke permissions with sub-second finality.
            </p>
            <div className="p-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full max-w-md" />
          </div>
        ) : (
          /* The "Logged In" Dashboard Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in zoom-in-95 duration-700">

            {/* Main Action Area (Left) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <div className="text-[120px] font-black text-white/5 select-none leading-none">01</div>
                </div>

                <div className="relative z-10">
                  <h2 className="text-4xl font-black mb-4 tracking-tight">
                    {role === "Uninitialized" ? "Initialize Identity" : "Access Granted"}
                  </h2>
                  <p className="text-gray-400 text-lg max-w-md mb-8">
                    {role === "Uninitialized"
                      ? "Your wallet is connected but has no on-chain role. Start by initializing your Super Admin profile."
                      : "Your session is authenticated. You have full administrative control over the SDS permission layers."}
                  </p>

                  {role === "Uninitialized" ? (
                    <button
                      onClick={initializeAdmin}
                      className="group relative px-8 py-4 bg-white text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                      <span className="relative z-10">INITIALIZE SUPER ADMIN</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold transition-all text-sm tracking-widest uppercase">
                        User Management
                      </button>
                      <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold transition-all text-sm tracking-widest uppercase text-gray-400">
                        Audit Logs
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Management Section */}
              <div className="mt-12 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-white">Team Ledger</h2>
                      <p className="text-gray-500 text-sm">Directly manage SDS network permissions</p>
                    </div>

                    {/* Target Wallet Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Wallet Address..."
                        value={targetWallet}
                        onChange={(e) => setTargetWallet(e.target.value)}
                        className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 transition-all w-64"
                      />
                      <button
                        onClick={() => {
                          if (targetWallet) revokeUser(new PublicKey(targetWallet));
                        }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-xl transition-all"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-2xl border border-white/5">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Identity</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {/* When you eventually map over a list of users, it will look like this: */}
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-300">
                            {publicKey?.toBase58().slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                              {role}
                            </span>
                          </td>

                          {/* THIS IS THE PLACEMENT */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setTargetWallet(publicKey?.toBase58() || "")}
                              className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-lg border border-white/10"
                            >
                              Select User
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Sub-grid for additional stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Network Status</p>
                    <p className="text-xl font-bold text-green-400">Operational</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contract Version</p>
                    <p className="text-xl font-bold text-white">v1.0.4-beta</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-mono text-purple-400">SOL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Sidebar (Right) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[100px] group-hover:bg-purple-600/40 transition-all duration-700" />

                <div className="relative z-10 text-left">
                  <div className="flex justify-between items-start mb-10">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Protocol Rank</h2>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${role === "Admin" ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-purple-500/50 text-purple-400 bg-purple-500/10"
                      }`}>
                      {role === "Uninitialized" ? "Offline" : "Verified"}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-10">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-[1px]">
                      <div className="h-full w-full rounded-2xl bg-[#09090b] flex items-center justify-center">
                        <span className="text-2xl font-black text-white">{loading ? "..." : role?.charAt(0) || "?"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white tracking-tight leading-none mb-1">{loading ? "..." : role}</p>
                      <p className="text-gray-500 text-sm font-medium italic">Level {role === "Admin" ? "3" : role === "Manager" ? "2" : role === "Developer" ? "1" : "0"}</p>
                    </div>
                  </div>

                  {role !== "Uninitialized" && (
                    <button
                      onClick={handleRevoke}
                      className="w-full py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/40 text-red-500/70 hover:text-red-400 text-xs font-black transition-all duration-300 tracking-[0.2em] uppercase"
                    >
                      REVOKE ACCESS & RESET
                    </button>
                  )}
                </div>
              </div>


              {/* Help / Docs Card */}
              <div className="p-8 rounded-[2rem] bg-gradient-to-t from-purple-900/10 to-transparent border border-white/5 text-left">
                <p className="text-xs font-bold text-purple-400 uppercase mb-3">Developer Quick-Action</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Need to manage team members? Use the <code className="text-white">targetUser</code> input in the management tab to assign new roles.
                </p>
              </div>
            </div>


          </div>
        )}
      </main>
    </div>
  );
}