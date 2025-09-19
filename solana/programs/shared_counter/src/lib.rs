use anchor_lang::prelude::*;

declare_id!("6Zxr95zDqagjfR5JAdZ24dT3FTqzn5N2eaagGHXEbA22");

#[program]
pub mod shared_counter {
    use super::*;

    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.next_id = 1; // IDは1から開始
        registry.bump = ctx.bumps.registry;
        msg!("SharedCounterRegistry initialized");
        Ok(())
    }

    pub fn create(ctx: Context<Create>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        let counter = &mut ctx.accounts.counter;

        let id = registry.next_id;
        registry.next_id += 1;

        counter.value = 0;
        counter.id = id;

        msg!(
            "SharedCounter created with ID {} by creator {}",
            id,
            ctx.accounts.creator.key()
        );
        Ok(())
    }

    pub fn increment(ctx: Context<CounterAccess>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value = counter.value.checked_add(1).ok_or(ErrorCode::Overflow)?;
        msg!(
            "SharedCounter incremented to {} by {}",
            counter.value,
            ctx.accounts.caller.key()
        );
        Ok(())
    }

    pub fn set_value(ctx: Context<CounterAccess>, new_value: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value = new_value;
        msg!(
            "SharedCounter value set to {} by {}",
            new_value,
            ctx.accounts.caller.key()
        );
        Ok(())
    }
}

#[account]
pub struct SharedCounterRegistry {
    pub next_id: u64,
    pub bump: u8,
}

impl SharedCounterRegistry {
    pub const LEN: usize = 8 + 8 + 1;
}

#[account]
pub struct SharedCounter {
    pub value: u64,
    pub id: u64,
}

impl SharedCounter {
    pub const LEN: usize = 8 + 8 + 8;
}

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = SharedCounterRegistry::LEN,
        seeds = [b"shared_registry"],
        bump
    )]
    pub registry: Account<'info, SharedCounterRegistry>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Create<'info> {
    pub creator: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"shared_registry"],
        bump
    )]
    pub registry: Account<'info, SharedCounterRegistry>,
    #[account(
        init,
        payer = payer,
        space = SharedCounter::LEN
    )]
    pub counter: Account<'info, SharedCounter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CounterAccess<'info> {
    #[account(mut)]
    pub counter: Account<'info, SharedCounter>,
    pub caller: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("overflow")]
    Overflow,
    #[msg("invalid id")]
    InvalidId,
}
