use anchor_lang::prelude::*;

declare_id!("4VaxisFFjxbjD6gNDBjid7gaptQvNp1tpRTgGS5YfC22");

#[program]
pub mod owned_counter {
    use super::*;

    pub fn create(ctx: Context<Create>, seed: u64) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        c.authority = ctx.accounts.authority.key();
        c.value = 0;
        c.seed = seed;
        c.bump = ctx.bumps.counter;
        msg!(
            "OwnedCounter created with seed {} for authority {}",
            seed,
            c.authority
        );
        Ok(())
    }

    pub fn increment(ctx: Context<AuthOnly>) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        require_keys_eq!(
            c.authority,
            ctx.accounts.authority.key(),
            ErrorCode::NotOwner
        );
        c.value = c.value.checked_add(1).ok_or(ErrorCode::Overflow)?;
        msg!("OwnedCounter incremented to {}", c.value);
        Ok(())
    }

    pub fn set_value(ctx: Context<AuthOnly>, new_value: u64) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        require_keys_eq!(
            c.authority,
            ctx.accounts.authority.key(),
            ErrorCode::NotOwner
        );
        c.value = new_value;
        msg!("OwnedCounter value set to {}", new_value);
        Ok(())
    }
}

#[account]
pub struct OwnedCounter {
    pub authority: Pubkey,
    pub value: u64,
    pub seed: u64,
    pub bump: u8,
}

impl OwnedCounter {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 1;
}

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Create<'info> {
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = OwnedCounter::LEN,
        seeds = [b"owned", authority.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub counter: Account<'info, OwnedCounter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AuthOnly<'info> {
    #[account(mut)]
    pub counter: Account<'info, OwnedCounter>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("not owner")]
    NotOwner,
    #[msg("overflow")]
    Overflow,
}
