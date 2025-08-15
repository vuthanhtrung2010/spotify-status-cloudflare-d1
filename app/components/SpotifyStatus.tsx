import React, { useEffect, useState } from "react";
import type { CurrentTrackData } from "~/types";

export default function SpotifyStatus({
  initialTrackData,
}: Readonly<{ initialTrackData: CurrentTrackData | null }>) {
  const [trackData, setTrackData] = useState<CurrentTrackData | null>(
    initialTrackData,
  );

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/current-track?t=${Date.now()}`);
        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`);
        }
        const newTrackData = (await res.json()) as CurrentTrackData;
        setTrackData(newTrackData);
      } catch (error) {
        console.error("Error fetching track data:", error);
      }
    };

    fetchData().then(() => {}); // Fetch immediately on mount
    const id = setInterval(fetchData, 1000);
    return () => clearInterval(id);
  }, []);

  if (!trackData?.is_playing) {
    return (
      <div className="modern-container">
        <div className="modern-card not-playing-card">
          <div className="spotify-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#1ed760">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <p className="not-playing-text">No music playing right now</p>
          <p className="not-playing-subtitle">Check back in a moment</p>
        </div>
      </div>
    );
  }

  const track = trackData.item;

  // Format time helper
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((trackData.progress_ms as number) / (track?.duration_ms as number)) * 100;

  return (
    <div className="modern-container">
      <div className="modern-card playing-card">
        {/* Background blur effect */}
        <div 
          className="card-background"
          style={{
            backgroundImage: `url(${track?.album?.images[0].url})`,
          }}
        ></div>
        
        {/* Main content */}
        <div className="card-content">
          {/* Album art with modern styling */}
          <div className="album-art-container">
            <img
              src={track?.album?.images[0].url as string}
              alt={`${track?.name} album art`}
              className="album-art"
            />
            <div className="album-art-shadow"></div>
          </div>

          {/* Track information */}
          <div className="track-info">
            <div className="track-header">
              <div className="spotify-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ed760">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span>Now Playing</span>
              </div>
            </div>

            <h1 className="track-title">
              <a href={track?.external_urls.spotify} className="track-link">
                {track?.name}
              </a>
            </h1>

            <p className="artist-names">
              {track?.artists?.map((artist, index) => (
                <span key={artist.id}>
                  <a href={artist.external_urls.spotify} className="artist-link">
                    {artist.name}
                  </a>
                  {index < (track?.artists?.length as number) - 1 && ", "}
                </span>
              ))}
            </p>

            <p className="album-title">
              <a href={track?.album?.external_urls.spotify} className="album-link">
                {track?.album?.name}
              </a>
            </p>

            {/* Modern progress bar */}
            <div className="progress-section">
              <div className="time-info">
                <span className="current-time">{formatTime(trackData.progress_ms as number)}</span>
                <span className="total-time">{formatTime(track?.duration_ms as number)}</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
                <div className="progress-thumb" style={{ left: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
