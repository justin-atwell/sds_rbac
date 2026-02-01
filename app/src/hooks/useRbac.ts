"use client";

import { useEffect, useState, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import rawIdl from "../idl/sds_rbac.json";

export const useRbac = () => {
    const { connection } = useConnection();
    const { publicKey, wallet } = useWallet();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Memoize the program so it doesn't change every render
    const program = useMemo(() => {
        if (!connection || !wallet) return null;
        const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
        return new Program(rawIdl as Idl, provider);
    }, [connection, wallet]);

    useEffect(() => {
        const fetchRole = async () => {
            if (!publicKey || !program) return;
            setLoading(true);
            try {
                const [profilePda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("user-role"), publicKey.toBuffer()],
                    program.programId
                );
                const account = await (program.account as any).userProfile.fetch(profilePda);
                const roleKey = Object.keys(account.role)[0];
                setRole(roleKey.charAt(0).toUpperCase() + roleKey.slice(1));
            } catch (error) {
                setRole("Uninitialized");
            } finally {
                setLoading(false);
            }
        };
        fetchRole();
    }, [publicKey, program]);

    const revokeUser = async (targetPublicKey: PublicKey) => {
        if (!publicKey || !wallet?.adapter || !program) {
            console.error("Setup missing");
            return false;
        }

        try {
            // 1. Manually create the "Anchor-compatible" wallet
            const anchorWallet = {
                publicKey: publicKey,
                signTransaction: (tx: any) => (wallet.adapter as any).signTransaction(tx),
                signAllTransactions: (txs: any[]) => (wallet.adapter as any).signAllTransactions(txs),
            };

            // 2. Create a one-time provider for this transaction
            const provider = new AnchorProvider(connection, anchorWallet as any, {
                commitment: "confirmed"
            });

            // 3. Re-initialize the program with this signing provider
            const signingProgram = new Program(rawIdl as Idl, provider);

            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-role"), targetPublicKey.toBuffer()],
                signingProgram.programId
            );

            // 4. Execute the call
            await signingProgram.methods
                .revokeUser()
                .accounts({
                    userProfile: profilePda,
                    targetUser: targetPublicKey,
                    admin: publicKey,
                })
                .rpc();

            return true;
        } catch (err) {
            console.error("Revoke failed at RPC level:", err);
            return false;
        }
    };
    return { role, loading, revokeUser };
};