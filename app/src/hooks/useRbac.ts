"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import rawIdl from "../idl/sds_rbac.json";

export const useRbac = () => {
    const { connection } = useConnection();
    const { publicKey, wallet } = useWallet();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
 
    useEffect(() => {
        const fetchRole = async () => {
            // If no wallet is connected, we can't check a role
            if (!publicKey || !wallet) {
                setRole(null);
                return;
            }

            setLoading(true);
            try {
                // 1. Setup the Connection Bridge
                const provider = new AnchorProvider(connection, wallet as any, { 
                    commitment: "confirmed" 
                });
                const program = new Program(rawIdl as Idl, provider);
console.log("Available accounts:", Object.keys(program.account));
                // 2. Find the PDA (The "Address" of your specific role on chain)
                const [profilePda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("user-role"), publicKey.toBuffer()],
                    program.programId
                );

                // 3. Try to fetch the account data
                const account = await (program.account as any).userProfile.fetch(profilePda);
                console.log("On-chain data found:", account);
                // Anchor Enums come back as objects like { admin: {} }
                // This line grabs the key name and capitalizes it
                const roleKey = Object.keys(account.role)[0];
                setRole(roleKey.charAt(0).toUpperCase() + roleKey.slice(1));

            } catch (error) {
                console.log("No RBAC profile found for this wallet yet.");
                setRole("Uninitialized");
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, [publicKey, connection, wallet]);

    return { role, loading };
};