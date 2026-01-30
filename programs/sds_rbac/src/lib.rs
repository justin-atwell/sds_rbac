use anchor_lang::prelude::*;

declare_id!("9ubrJbz2XKeesFMX3kygwyfytFWa849jUJonPEEE1YAv"); // Ensure this matches your Anchor.toml

#[program]
pub mod sds_rbac {
    use super::*;

    // This creates the user profile with a specific role
    pub fn initialize_user(ctx: Context<InitializeUser>, role: Role) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.user = *ctx.accounts.target_user.key;
        user_profile.role = role;
        user_profile.bump = ctx.bumps.user_profile;
        Ok(())
    }

    // This is a protected function
    pub fn sensitive_operation(ctx: Context<SensitiveOp>) -> Result<()> {
        let user_profile = &ctx.accounts.user_profile;

        // The RBAC Check
        require!(user_profile.role == Role::Admin, ErrorCode::Unauthorized);

        msg!("Access Granted: Admin operation successful.");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(role: Role)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"user-role", target_user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub target_user: SystemAccount<'info>,
    #[account(mut,
    constraint = admin.key() == pubkey!("HFFLKkt1HdhjBKppTm9oLweNjjWhNqAEvzMur8QZbwdf") @ ErrorCode::NotSuperAdmin)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SensitiveOp<'info> {
    #[account(
        seeds = [b"user-role", user.key().as_ref()],
        bump = user_profile.bump,
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub user: Pubkey,
    pub role: Role,
    pub bump: u8,
}

#[derive(AnchorSerialize, InitSpace, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Role {
    Admin,
    Manager,
    Developer,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only the Super Admin can assign roles.")]
    NotSuperAdmin,
    #[msg("You do not have the Admin role required for this operation.")]
    Unauthorized
}
