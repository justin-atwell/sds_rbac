Solana Directory Service (SDS) RBAC Terminal
Project Overview
The SDS RBAC Terminal is a decentralized identity management system built on the Solana blockchain. It enables secure, on-chain Role-Based Access Control (RBAC) by leveraging a hierarchical permission structure enforced at the smart contract level.

Technical Core
Hierarchical Roles: Implements a three-tier rank system—Admin (L3), Manager (L2), and Developer (L1)—defined within an Anchor/Rust enum.

On-Chain Enforcement: Employs strict Anchor constraints (admin_profile.role.level() > target_profile.role.level()) to ensure that administrative actions like revocation can only be performed by a higher-ranking entity.

Modern Glassmorphism UI: A high-fidelity dashboard built with Next.js 14 and Tailwind CSS v4, featuring real-time wallet connection and role detection.

Team Ledger: An interactive management interface that allows administrators to select network identities and perform role-based actions.

Tech Stack
Smart Contract: Anchor Framework / Rust

Frontend: Next.js 14 (App Router), TypeScript

Styling: Tailwind CSS v4

Libraries: @solana/web3.js, @coral-xyz/anchor, @solana/wallet-adapter

Getting Started
1. Environment Setup
Ensure you have the Solana Tool Suite and Anchor installed on your Mac.

Start a local validator: solana-test-validator

2. Installation
Bash

# Clone the repository
git clone https://github.com/[your-username]/sds_rbac.git
cd sds_rbac

# Install dependencies in the app directory
cd app
npm install
3. Deployment & Execution
Bash

# Build and deploy the Anchor program
anchor build && anchor deploy

# Start the development server
cd app
npm run dev
Testing the Hierarchy
This project is designed for multi-wallet testing to verify security boundaries:

Initialize Admin: Establish your primary wallet as the Level 3 root.

Create Test Identity: Generate a new keypair (solana-keygen new) and fund it via solana airdrop.

Manage: Use the Team Ledger to select the new wallet and attempt to initialize it or revoke its status.

Constraint Check: Verify that a Manager identity cannot revoke an Admin, as enforced by the Rust program logic.