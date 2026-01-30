"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export const WalletConnectBtn = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Only render the button once we are sure we are on the client
    if (!mounted) return <div className="w-32 h-10 bg-white/5 animate-pulse rounded-lg" />;

    return (
        <div className="flex items-center">
            <WalletMultiButton />
        </div>
    );
};