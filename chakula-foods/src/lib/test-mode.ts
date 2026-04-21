/**
 * Test Mode helper
 *
 * The admin UI has `isTestMode = true` which bypasses login.
 * For the backend APIs to work the same way (so admin writes succeed without auth),
 * we allow requests when ADMIN_TEST_MODE is truthy OR when running in development.
 *
 * To disable test mode in production, set ADMIN_TEST_MODE=false explicitly.
 */

export function isAdminTestMode(): boolean {
  // Explicit override always wins
  if (process.env.ADMIN_TEST_MODE === "true") return true;
  if (process.env.ADMIN_TEST_MODE === "false") return false;

  // Default: enabled in non-production
  return process.env.NODE_ENV !== "production";
}

/**
 * Wraps getCurrentUser with a test-mode fallback admin user.
 * If test mode is on and no user is logged in, returns a synthetic admin.
 */
export async function getAdminOrTestUser() {
  const { getCurrentUser } = await import("./auth");
  const user = await getCurrentUser().catch(() => null);

  if (user && (user.role === "ADMIN" || user.role === "STAFF")) {
    return user;
  }

  if (isAdminTestMode()) {
    return {
      id: "test-admin",
      email: "test@admin.local",
      name: "Test Admin",
      phone: "0000000000",
      role: "ADMIN" as const,
      avatar: null,
      password: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      resetToken: null,
      resetTokenExp: null,
    };
  }

  return null;
}
