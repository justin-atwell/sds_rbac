import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SdsRbac } from "../target/types/sds_rbac";
import { assert } from "chai";

describe("sds_rbac", () => {
  // Configure the client to use the local cluster variables from your .zshrc
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SdsRbac as Program<SdsRbac>;

  // Helper to define Roles in the format Rust expects
  const ROLES = {
    Admin: { admin: {} },
    Manager: { manager: {} },
    Developer: { developer: {} },
  };

  it("Initializes a user with a Developer role", async () => {
    try {
      await program.methods
        .initializeUser(ROLES.Developer)
        .accounts({
          // userProfile is auto-resolved by Anchor using seeds
          targetUser: provider.publicKey,
        })
        .rpc();

      console.log("User initialized as Developer successfully.");
    } catch (err) {
      console.error("Initialization failed:", err);
      throw err;
    }
  });

  it("Blocks a Developer from running an Admin-only operation", async () => {
    try {
      await program.methods
        .sensitiveOperation()
        .accounts({
          user: provider.publicKey,
        })
        .rpc();

      // If this line is reached, the security gate failed
      assert.fail("The transaction should have been rejected by the RBAC gate.");
    } catch (err: any) {
      // Check for our custom ErrorCode::Unauthorized (6000)
      assert.include(
        err.message,
        "Unauthorized",
        "Error message should contain 'Unauthorized'"
      );
      console.log("Verified: Developer was correctly blocked from sensitive operation.");
    }
  });

  it("Blocks a random hacker from assigning roles", async () => {
    // Generate a brand new wallet that has NO SOL and NO permissions
    const hacker = anchor.web3.Keypair.generate();

    // We need to give the hacker a tiny bit of SOL just to pay for the transaction 
    // (otherwise it fails on gas, not on your RBAC logic)
    const signature = await provider.connection.requestAirdrop(
      hacker.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );

    const latestBlockHash = await provider.connection.getLatestBlockhash();

    // The modern confirmation call
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });

    try {
      await program.methods
        .initializeUser({ admin: {} })
        .accounts({
          targetUser: hacker.publicKey,
          admin: hacker.publicKey, // The hacker tries to sign as the admin
        })
        .signers([hacker]) // Explicitly use the hacker's key to sign
        .rpc();

      assert.fail("The hacker successfully assigned themselves a role! Security breach!");
    } catch (err: any) {
      // Check for our custom "NotSuperAdmin" error
      assert.include(err.message, "NotSuperAdmin");
      console.log("Verified: Hacker was successfully blocked by the Super Admin constraint.");
    }
  });

});