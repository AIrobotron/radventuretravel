const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function authConfig() {
  return {
    username: process.env.ALUMNI_LOGIN_USERNAME || "",
    password: process.env.ALUMNI_LOGIN_PASSWORD || "",
    secret: process.env.ALUMNI_AUTH_SECRET || "",
  };
}

export function authConfigured() {
  const { username, password, secret } = authConfig();
  return Boolean(username && password && secret);
}

export async function createAuthToken(username: string) {
  const { secret } = authConfig();
  if (!secret) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(username));
  return `${username}.${toHex(signature)}`;
}

export async function validAuthToken(token: string | undefined) {
  if (!token || !authConfigured()) return false;
  const { username } = authConfig();
  return token === (await createAuthToken(username));
}
