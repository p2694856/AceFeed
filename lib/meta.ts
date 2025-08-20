// lib/meta.ts

export async function fetchPageAccessToken(
  pageId: string,
  systemUserToken: string
): Promise<string | null> {
  const res = await fetch(
    `https://graph.facebook.com/${pageId}?fields=access_token&access_token=${systemUserToken}`
  );
  const data = await res.json();

  if (data.access_token) {
    return data.access_token;
  }
  console.error("Failed to fetch access token:", data);
  return null;
}