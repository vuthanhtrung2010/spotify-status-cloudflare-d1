import { redirect } from "react-router";
import { createAuthorizeURL } from "~/data";

export async function loader({ context }: any) {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-library-read",
    "user-read-recently-played",
    "user-top-read",
    "playlist-read-private",
    "playlist-modify-public",
    "user-read-playback-state",
    "user-read-currently-playing",
  ];
  
  const clientId = process.env.VITE_CLIENT_ID || import.meta.env.VITE_CLIENT_ID || '';
  const redirectUri = process.env.VITE_REDIRECT_URL || import.meta.env.VITE_REDIRECT_URL || '';
  
  const authorizeURL = createAuthorizeURL(scopes, clientId, redirectUri);
  return redirect(authorizeURL);
}

export default function Login() {
  // This component won't actually render since we redirect in the loader
  return null;
}
