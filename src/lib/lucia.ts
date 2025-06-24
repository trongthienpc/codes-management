"use server";
import { Session, User } from "lucia";
import { cookies } from "next/headers";
import { lucia } from "./lucia-config";

/**
 * Sets the session cookie with the given session ID.
 * @param {string} sessionId - The session ID to set in the cookie.
 */
// async function setSessionCookie(sessionId: string) {
//   const cookieStore = cookies();
//   const sessionCookie = lucia.createSessionCookie(sessionId);
//   (await cookieStore).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
// }

/**
 * Clears the session cookie.
 */
// async function clearSessionCookie() {
//   const cookieStore = await cookies();
//   const sessionCookie = lucia.createBlankSessionCookie();
//   cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
// }

/**
 * Validates the current session and retrieves the associated user.
 * @returns {Promise<{ user: User; session: Session } | { user: null; session: null }>}
 */
export async function validateRequest(): Promise<
  { user: User; session: Session } | { user: null; session: null }
> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  // If no session ID is found, return null for both user and session
  if (!sessionId) {
    return { user: null, session: null };
  }

  // Validate the session using Lucia
  const { user, session } = await lucia.validateSession(sessionId);

  // If the session is invalid, clear the session cookie and return null
  if (!session) {
    // await clearSessionCookie();
    return { user: null, session: null };
  }

  // If the session is fresh, update the session cookie
  // if (session.fresh) {
  //   await setSessionCookie(session.id);
  // }

  return { user, session };
}
