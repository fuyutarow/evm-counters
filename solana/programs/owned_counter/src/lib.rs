use anchor_lang::prelude::*;

declare_id!("Afj1Jid7Hwr9Pa7wUnZ4MHVq1MJQtd2Tk3jcTCHJh6rq");

#[program]
pub mod owned_counter {
    use super::*;

    pub fn create(ctx: Context<CreateCounter>, seed: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.owner = ctx.accounts.owner.key();
        counter.value = 0;
        counter.seed = seed;

        msg!(
            "OwnedCounter created with seed {} by owner {}",
            seed,
            counter.owner
        );
        Ok(())
    }

    pub fn increment(ctx: Context<CounterUpdate>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require_keys_eq!(counter.owner, ctx.accounts.owner.key(), ErrorCode::NotOwner);
        counter.value = counter.value.checked_add(1).ok_or(ErrorCode::Overflow)?;
        msg!("OwnedCounter incremented to {}", counter.value);
        Ok(())
    }

    pub fn set_value(ctx: Context<CounterUpdate>, new_value: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require_keys_eq!(counter.owner, ctx.accounts.owner.key(), ErrorCode::NotOwner);
        counter.value = new_value;
        msg!("OwnedCounter value set to {}", new_value);
        Ok(())
    }
}

#[account]
pub struct OwnedCounter {
    pub owner: Pubkey,
    pub value: u64,
    pub seed: u64,
}

impl OwnedCounter {
    pub const LEN: usize = 8 + 32 + 8 + 8;
}

#[derive(Accounts)]
pub struct CreateCounter<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = OwnedCounter::LEN
    )]
    pub counter: Account<'info, OwnedCounter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CounterUpdate<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner
    )]
    pub counter: Account<'info, OwnedCounter>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("not owner")]
    NotOwner,
    #[msg("overflow")]
    Overflow,
}
