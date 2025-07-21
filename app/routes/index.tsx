import { getCurrentPlayingTrack } from "~/data";
import SpotifyStatus from "~/components/SpotifyStatus";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs): Route.MetaDescriptors {
  return [
    { title: "Trung's Spotify Status" },
    {
      name: "description",
      content: "A website which displays my Spotify status.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const email = process.env.VITE_EMAIL || import.meta.env.VITE_EMAIL || "";
    const clientId = process.env.VITE_CLIENT_ID || import.meta.env.VITE_CLIENT_ID || "";
    const clientSecret =
      process.env.CLIENT_SECRET || import.meta.env.CLIENT_SECRET || "";

    const trackData = await getCurrentPlayingTrack(
      context.db,
      email,
      clientId,
      clientSecret
    );
    return { trackData };
  } catch (error) {
    console.error("Error loading track data:", error);
    return { trackData: null };
  }
}

export default function Home({ loaderData }: any) {
  return <SpotifyStatus initialTrackData={loaderData.trackData} />;
}
