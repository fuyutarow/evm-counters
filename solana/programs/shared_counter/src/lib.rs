use anchor_lang::prelude::*;

declare_id!("5v1W7sNkrufDdRND19rxtMWmLXEXWbwTRy4mq7Dk3B6m");

#[program]
pub mod shared_counter {
    use super::*;

    pub fn create(ctx: Context<Create>, seed: u64) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        c.value = 0;
        c.seed = seed;
        c.bump = ctx.bumps.counter;
        msg!(
            "SharedCounter created with seed {} by creator {}",
            seed,
            ctx.accounts.creator.key()
        );
        Ok(())
    }

    pub fn increment(ctx: Context<AnyCaller>) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        c.value = c.value.checked_add(1).ok_or(ErrorCode::Overflow)?;
        msg!(
            "SharedCounter incremented to {} by {}",
            c.value,
            ctx.accounts.caller.key()
        );
        Ok(())
    }

    pub fn set_value(ctx: Context<AnyCaller>, new_value: u64) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        c.value = new_value;
        msg!(
            "SharedCounter value set to {} by {}",
            new_value,
            ctx.accounts.caller.key()
        );
        Ok(())
    }
}

#[account]
pub struct SharedCounter {
    pub value: u64,
    pub seed: u64,
    pub bump: u8,
}

impl SharedCounter {
    pub const LEN: usize = 8 + 8 + 8 + 1;
}

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Create<'info> {
    pub creator: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = SharedCounter::LEN,
        seeds = [b"shared", creator.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub counter: Account<'info, SharedCounter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AnyCaller<'info> {
    #[account(mut)]
    pub counter: Account<'info, SharedCounter>,
    pub caller: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("overflow")]
    Overflow,
}
