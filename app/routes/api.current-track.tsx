import { getCurrentPlayingTrack } from "~/data";
import type { Route } from "./+types/api.current-track";

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const trackData = await getCurrentPlayingTrack(
      context.db,
      process.env.VITE_EMAIL || import.meta.env.VITE_EMAIL || '',
      process.env.VITE_CLIENT_ID || import.meta.env.VITE_CLIENT_ID || '',
      process.env.CLIENT_SECRET || import.meta.env.CLIENT_SECRET || ''
    );
    
    return new Response(JSON.stringify(trackData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to fetch track data. Error: ${error}` }), 
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
