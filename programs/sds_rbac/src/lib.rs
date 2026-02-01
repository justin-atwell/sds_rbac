use anchor_lang::prelude::*;

declare_id!("9ubrJbz2XKeesFMX3kygwyfytFWa849jUJonPEEE1YAv"); // Ensure this matches your Anchor.toml

#[program]
pub mod sds_rbac {
    use super::*;

    // This creates the user profile with a specific role
    pub fn initialize_user(ctx: Context<InitializeUser>, role: UserRole) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.user = *ctx.accounts.target_user.key;
        user_profile.role = role;
        user_profile.bump = ctx.bumps.user_profile;
        Ok(())
    }

    pub fn revoke_user(ctx: Context<RevokeUser>) -> Result<()> {
        let user_role = &ctx.accounts.user_profile.role;
        msg!("Revoking role: {:?}", user_role);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(role: UserRole)]
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
    #[account(mut, constraint = admin.key() == pubkey!("HFFLKkt1HdhjBKppTm9oLweNjjWhNqAEvzMur8QZbwdf") @ ErrorCode::NotSuperAdmin)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeUser<'info> {
    #[account(
        mut,
        close = admin, //retrieves that rent money
        seeds = [b"user-role", target_user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub target_user: SystemAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"user-role", admin.key().as_ref()],
        bump,
        constraint = admin_profile.role == UserRole::Admin @ ErrorCode::Unauthorized
    )]
    pub admin_profile: Account<'info, UserProfile>,
}

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub user: Pubkey,
    pub role: UserRole,
    pub bump: u8,
}

impl UserProfile {
    pub fn has_at_least(&self, required: UserRole) -> bool {
        self.role.level() >= required.level()
    }
}

#[derive(AnchorSerialize, InitSpace, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum UserRole {
    Admin,
    Manager,
    Developer,
}

impl UserRole {
    pub fn level(&self) -> u8 {
        match self {
            UserRole::Admin => 3,
            UserRole::Manager => 2,
            UserRole::Developer => 1,
        }
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only the Super Admin can assign roles.")]
    NotSuperAdmin,
    #[msg("You do not have the Admin role required for this operation.")]
    Unauthorized,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hierarchy_levels() {
        // FIXED: Use the .level() method we defined in the impl
        let admin = UserRole::Admin;
        let manager = UserRole::Manager;
        let developer = UserRole::Developer;

        // Admin checks
        assert!(admin.level() >= UserRole::Admin.level());
        assert!(admin.level() >= UserRole::Manager.level());

        // Manager checks
        assert!(manager.level() >= UserRole::Developer.level());
        assert!(!(manager.level() >= UserRole::Admin.level()));
    }
}
