# SiteForge

## Current State
The app has in-app notification sounds for chat messages and payment requests (using Web Audio API). Chat polling runs every 2 seconds. No browser push notifications exist yet.

## Requested Changes (Diff)

### Add
- Browser push notifications (Web Push API) for:
  - New chat messages (when the tab is not active/focused)
  - Payment requests received in chat (numeric messages from other users)
- A notification permission request flow: prompt user to enable push notifications in the chat UI (or a settings toggle)
- A utility/hook to request permission and send browser notifications

### Modify
- `ChatTab.tsx`: When a new message or payment request arrives (detected via polling), also trigger a browser push notification if the document is not focused and permission is granted
- `notificationSounds.ts` (or a new file): Add `sendBrowserNotification(title, body, options?)` helper using the Notifications Web API

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/lib/browserNotifications.ts` with:
   - `requestNotificationPermission()`: asks the browser for push permission
   - `sendBrowserNotification(title, body, tag?)`: shows a browser notification if permission granted and tab is not focused
   - `isNotificationSupported()`: check if browser supports Notifications API
2. In `ChatTab.tsx`, import and wire up:
   - Show a "Enable notifications" button in the chat header (alongside the sound toggle), only if permission is not yet granted
   - When new messages arrive via polling (detected in `useEffect` that plays sounds), also call `sendBrowserNotification` if the tab is not focused
   - When a payment request arrives (numeric message), call `sendBrowserNotification` with a payment-specific title
3. No service worker needed -- use basic `new Notification(...)` API which works for foreground/background tabs in most browsers
