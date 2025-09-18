/// This example demonstrates a basic use of an owned object.
/// Rules:
/// - anyone can create an owned counter
/// - only the owner can increment a counter by 1
/// - only the owner can set the counter value
module counter::owned_counter;

// === Imports ===
// No additional imports needed

// === Structs ===

/// An owned counter.
public struct OwnedCounter has key, store {
    id: UID,
    value: u64,
}

// === Public Functions ===

/// Create and transfer an OwnedCounter object to the sender.
public fun new(ctx: &mut TxContext): OwnedCounter {
    OwnedCounter {
        id: object::new(ctx),
        value: 0,
    }
}

/// Increment a counter by 1 (only owner can call this).
public fun increment(counter: &mut OwnedCounter) {
    counter.value = counter.value + 1;
}

/// Set value (only owner can call this since they own the object).
public fun set_value(counter: &mut OwnedCounter, value: u64) {
    counter.value = value;
}
