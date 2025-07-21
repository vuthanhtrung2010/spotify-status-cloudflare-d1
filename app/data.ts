import { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "~/database/schema";
import type { CurrentTrackData } from "./types";

export const caches = new Map();

interface TokenData {
  token: string | null;
  refreshToken: string | null;
}

export const getTokenData = async (
  db: DrizzleD1Database<typeof schema>,
  email: string,
): Promise<TokenData> => {
  let token;
  let refresh_token;
  if (caches.has("token") && caches.has("refresh_token")) {
    token = caches.get("token");
    refresh_token = caches.get("refresh_token");
  } else {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
    token = user?.token;
    refresh_token = user?.refreshToken;
    caches.set("token", token);
    caches.set("refresh_token", refresh_token);
  }

  return { token: token, refreshToken: refresh_token };
};

export const refreshAccessToken = async (
  db: DrizzleD1Database<typeof schema>,
  refreshToken: string | null,
  email: string,
  clientId: string,
  clientSecret: string,
): Promise<string | null> => {
  if (!refreshToken) return null;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { access_token: string };
    const access_token = data.access_token;

    // Set token everywhere
    await db
      .update(schema.users)
      .set({ token: access_token })
      .where(eq(schema.users.email, email));
    caches.set("token", access_token);
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    if (error instanceof Error && error.message.includes("400")) {
      console.log(
        "Refresh token is invalid or revoked. User needs to re-authenticate.",
      );
      // Clear stored tokens
      await db
        .update(schema.users)
        .set({ token: null, refreshToken: null })
        .where(eq(schema.users.email, email));
      caches.delete("token");
      caches.delete("refresh_token");
      throw new Error("REAUTHENTICATION_REQUIRED");
    }
    return null;
  }
};

export const createAuthorizeURL = (scopes: string[], clientId: string, redirectUri: string): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    state: 'state'
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const authorizationCodeGrant = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getCurrentPlayingTrack = async (
  db: DrizzleD1Database<typeof schema>,
  email: string,
  clientId: string,
  clientSecret: string,
): Promise<CurrentTrackData | null> => {
  try {
    const { token, refreshToken } = await getTokenData(db, email);
    if (!token) {
      return null;
    }

    let currentToken = token;

    const makeRequest = async (accessToken: string) => {
      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 204) {
        return { is_playing: false, item: null, progress_ms: null };
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("The access token expired");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    };

    try {
      const data = await makeRequest(currentToken) as any;
      
      if (data?.currently_playing_type === "ad") {
        return { is_playing: false, item: null, progress_ms: null };
      }

      if (!data?.is_playing || typeof data?.is_playing === "undefined") {
        return { is_playing: false, item: data?.item || null, progress_ms: data?.progress_ms || null };
      }

      return data as CurrentTrackData;
    } catch (error) {
      if (error instanceof Error && error.message.includes("The access token expired")) {
        console.log("Token expired, refreshing...");
        const newToken = await refreshAccessToken(db, refreshToken, email, clientId, clientSecret);
        if (newToken) {
          console.log("Token refreshed, retrying...");
          const refreshedData = await makeRequest(newToken) as CurrentTrackData;
          return refreshedData;
        } else {
          throw new Error("Failed to refresh token");
        }
      } else {
        throw error;
      }
    }
  } catch (e) {
    throw e;
  }
};

export const getMe = async (accessToken: string) => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
