// __Host- cookies are used in production to prevent Domain/path fixation.
// Development keeps the non-prefixed name because local HTTP cannot set Secure cookies.
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-a-punto-session" : "a-punto-session";
