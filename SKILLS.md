# Venturo Backend — Working Skills

## Enum/value changes
When renaming an enum value, grep for both the enum reference and any bare
string literal of the old value — some code compares raw strings instead
of the enum.

## Verification
Run `npx tsc --noEmit` after every edit round before reporting done.