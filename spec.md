# SiteForge — PhonePe Payment UI Overhaul + PIN Security

## Current State

- Chat tab has a `PhonePayDialog` component (link → confirm → done steps) but it has no PIN security
- When a user sends a numeric message in chat, the receiver sees a "Pay ₹X via PhonePe" button
- Marketplace PhonePe payment section has a basic UPI input + simulate button with no PIN
- Chat polls for new messages every 5 seconds (5000ms), unread count polls every 10 seconds
- Users can link PhonePe UPI in Settings tab, which auto-fills the chat pay dialog
- No 4-digit PIN exists anywhere in the codebase

## Requested Changes (Diff)

### Add
- **4-digit PIN setup flow**: When a user links their PhonePe account (in Settings or when first paying), prompt them to set a 4-digit PIN. Store PIN in localStorage keyed by principal.
- **PIN verification step**: In `PhonePayDialog` (chat) and marketplace PhonePe checkout, add a PIN entry step before completing payment. Show numeric keypad (PhonePe style) or 4 PIN digit boxes.
- **PhonePe-style UI redesign**: 
  - Purple gradient header with PhonePe logo/icon, recipient avatar with initials
  - Clean amount display (large ₹ amount centered)
  - Recipient UPI shown prominently
  - 4-dot PIN entry boxes (••••) with a number pad
  - Green success screen with checkmark animation
- **PIN storage helpers**: `getPhonePePIN(principal)`, `savePhonePePIN(principal, pin)`, `hasPhonePePIN(principal)` in localStorage
- **Faster chat polling**: Reduce `refetchInterval` from 5000ms to 2000ms for messages, from 10000ms to 3000ms for unread count

### Modify
- `PhonePayDialog` in `ChatTab.tsx`: Redesign to PhonePe style, add PIN setup on first use (link step), add PIN confirm step before payment
- `useGetMessages` in `useQueries.ts`: Change `refetchInterval` from 5000 to 2000
- `useUnreadMessageCount` in `useQueries.ts`: Change `refetchInterval` from 10000 to 3000  
- Marketplace PhonePe payment section in `MarketplacePage.tsx`: Add PIN entry step before calling `handleAltPayment`
- Settings tab in `DashboardPage.tsx`: Add PIN setup/change option next to PhonePe UPI linking

### Remove
- Nothing removed

## Implementation Plan

1. Add PIN storage helpers alongside existing PhonePe UPI helpers in `ChatTab.tsx`
2. Redesign `PhonePayDialog` with PhonePe-style UI:
   - Step 1 (if no UPI): Link UPI + set 4-digit PIN
   - Step 2 (if UPI exists but no PIN): Set 4-digit PIN
   - Step 3: Confirm payment — show amount, recipient, enter PIN (4 dot inputs or numeric keypad)
   - Step 4: Success screen
3. Update `useQueries.ts` polling intervals (messages: 2000ms, unread: 3000ms)
4. Update Marketplace PhonePe checkout to require PIN before confirming
5. Update Settings PhonePe linking section to include PIN setup
