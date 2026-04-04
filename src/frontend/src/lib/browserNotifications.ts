// Browser push notifications using the Web Notifications API (no service worker needed)

/**
 * Returns true if the browser supports the Notification API.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Requests notification permission from the browser.
 * Returns true if the user granted permission.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Returns the current notification permission state.
 * Returns 'unsupported' if the Notification API is not available.
 */
export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Shows a browser notification if:
 * 1. Permission is 'granted'
 * 2. The document is NOT focused (tab is in background)
 *
 * Uses `tag` to deduplicate — multiple notifications with the same tag
 * replace each other rather than stacking.
 * Auto-closes after 4 seconds.
 * Clicking the notification focuses the window.
 */
export function sendBrowserNotification(
  title: string,
  body: string,
  tag?: string,
): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;
  if (document.hasFocus()) return;

  try {
    const notification = new Notification(title, {
      body,
      tag: tag ?? "siteforge-notification",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });

    const timer = setTimeout(() => notification.close(), 4000);

    notification.onclick = () => {
      clearTimeout(timer);
      window.focus();
      notification.close();
    };

    notification.onclose = () => {
      clearTimeout(timer);
    };
  } catch {
    // Silently ignore — some browsers throw if notifications are not allowed
  }
}
