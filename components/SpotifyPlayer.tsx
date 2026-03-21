"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayerInstance;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (ms: number) => Promise<void>;
  addListener: (event: string, cb: (data: unknown) => void) => void;
  removeListener: (event: string) => void;
}

interface TrackState {
  name: string;
  artist: string;
  albumArt: string;
  paused: boolean;
  position: number;
  duration: number;
}

interface Playlist {
  id: string;
  name: string;
  uri: string;
  total: number;
  image: string;
}

interface Track {
  id: string;
  name: string;
  uri: string;
  artist: string;
  duration: number;
  image: string;
}

async function fetchToken(): Promise<string | null> {
  const res = await fetch("/api/spotify/token");
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ?? null;
}

async function transferPlayback(deviceId: string, token: string) {
  await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
}

export default function SpotifyPlayer() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState<TrackState | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const tokenRef = useRef<string | null>(null);
  const positionRef = useRef(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchToken().then((t) => { setToken(t); tokenRef.current = t; });
  }, []);

  const getToken = useCallback((cb: (t: string) => void) => {
    fetchToken().then((t) => { if (t) { tokenRef.current = t; cb(t); } });
  }, []);

  // Init SDK
  useEffect(() => {
    if (!token) return;

    const init = () => {
      const player = new window.Spotify.Player({
        name: "Mi Mejor Versión",
        getOAuthToken: getToken,
        volume: 0.7,
      });

      player.addListener("ready", (data) => {
        const { device_id } = data as { device_id: string };
        setDeviceId(device_id);
        setReady(true);
        transferPlayback(device_id, token);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) { setTrack(null); return; }
        const s = state as {
          paused: boolean; position: number; duration: number;
          track_window: { current_track: { name: string; artists: { name: string }[]; album: { images: { url: string }[] } } };
        };
        const t = s.track_window.current_track;
        const newTrack: TrackState = {
          name: t.name,
          artist: t.artists.map((a) => a.name).join(", "),
          albumArt: t.album.images[0]?.url ?? "",
          paused: s.paused,
          position: s.position,
          duration: s.duration,
        };
        setTrack(newTrack);
        positionRef.current = s.position;
        if (tickRef.current) clearInterval(tickRef.current);
        if (!s.paused) {
          tickRef.current = setInterval(() => {
            positionRef.current += 1000;
            setTrack((prev) => prev ? { ...prev, position: positionRef.current } : prev);
          }, 1000);
        }
      });

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      init();
    } else {
      window.onSpotifyWebPlaybackSDKReady = init;
      if (!document.querySelector('script[src*="spotify-player"]')) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      playerRef.current?.disconnect();
    };
  }, [token, getToken]);

  const openPlaylists = async () => {
    if (showPlaylists) { setShowPlaylists(false); return; }
    setShowPlaylists(true);
    if (playlists.length > 0) return;
    setLoadingPlaylists(true);
    try {
      const res = await fetch("/api/spotify/playlists");
      if (res.ok) {
        const items = await res.json();
        setPlaylists((items ?? []).map((p: {
          id: string; name: string; uri: string;
          tracks?: { total: number };
          items?: { total: number };
          images?: { url: string }[] | null;
        }) => ({
          id: p.id,
          name: p.name,
          uri: p.uri,
          total: p.tracks?.total ?? p.items?.total ?? 0,
          image: p.images?.[0]?.url ?? "",
        })));
      } else {
        const err = await res.json();
        console.error("Spotify playlists error:", err);
      }
    } catch (e) {
      console.error("openPlaylists error:", e);
    }
    setLoadingPlaylists(false);
  };

  const openPlaylist = async (pl: Playlist) => {
    setSelectedPlaylist(pl);
    setTracks([]);
    setLoadingTracks(true);
    const res = await fetch(`/api/spotify/playlist-tracks/${pl.id}`);
    if (res.ok) setTracks(await res.json());
    setLoadingTracks(false);
  };

  const playTrack = async (trackUri: string, playlistUri: string) => {
    const t = tokenRef.current ?? token;
    if (!t || !deviceId) return;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ context_uri: playlistUri, offset: { uri: trackUri } }),
    });
    setShowPlaylists(false);
    setSelectedPlaylist(null);
  };

  if (!token) {
    return (
      <div className="spotify-bar" style={{ padding: "10px 16px" }}>
        <a href="/api/spotify/auth" className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <span style={{ color: "#1DB954", fontSize: 18 }}>♫</span>
          Conectar Spotify
        </a>
      </div>
    );
  }

  const progress = track && track.duration > 0 ? (track.position / track.duration) * 100 : 0;
  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Playlist / Tracks panel */}
      {showPlaylists && (
        <div className="spotify-panel">
          <div className="flex items-center gap-2" style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
            {selectedPlaylist && (
              <button onClick={() => setSelectedPlaylist(null)} style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1 }}>←</button>
            )}
            <span className="text-xs font-medium truncate" style={{ color: "var(--muted)" }}>
              {selectedPlaylist ? selectedPlaylist.name : "Tus playlists"}
            </span>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 280 }}>
            {!selectedPlaylist ? (
              loadingPlaylists ? (
                <div className="text-xs text-center py-6" style={{ color: "var(--muted)" }}>Cargando...</div>
              ) : playlists.length === 0 ? (
                <div className="text-xs text-center py-6" style={{ color: "var(--muted)" }}>No se encontraron playlists</div>
              ) : playlists.map((pl) => (
                <button key={pl.id} onClick={() => openPlaylist(pl)}
                  className="flex items-center gap-3 w-full text-left transition-opacity hover:opacity-80"
                  style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                  {pl.image
                    ? <img src={pl.image} alt="" width={36} height={36} style={{ borderRadius: 4, flexShrink: 0 }} />
                    : <div style={{ width: 36, height: 36, borderRadius: 4, background: "var(--border)", flexShrink: 0 }} />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{pl.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--muted)" }}>{pl.total} canciones</div>
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>›</span>
                </button>
              ))
            ) : (
              loadingTracks ? (
                <div className="text-xs text-center py-6" style={{ color: "var(--muted)" }}>Cargando canciones...</div>
              ) : tracks.map((t, i) => (
                <button key={t.id} onClick={() => playTrack(t.uri, selectedPlaylist.uri)}
                  className="flex items-center gap-3 w-full text-left transition-opacity hover:opacity-80"
                  style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)" }}>
                  <span className="text-[10px] flex-shrink-0 w-5 text-right" style={{ color: "var(--muted)" }}>{i + 1}</span>
                  {t.image
                    ? <img src={t.image} alt="" width={32} height={32} style={{ borderRadius: 3, flexShrink: 0 }} />
                    : <div style={{ width: 32, height: 32, borderRadius: 3, background: "var(--border)", flexShrink: 0 }} />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{t.name}</div>
                    <div className="text-[10px] truncate" style={{ color: "var(--muted)" }}>{t.artist}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Player bar */}
      <div className="spotify-bar">
        {track && (
          <div style={{ height: 2, background: "var(--border)" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#1DB954", transition: "width 1s linear" }} />
          </div>
        )}
        <div className="flex items-center gap-3" style={{ padding: "8px 12px" }}>
          {/* Album art or idle state */}
          {track?.albumArt ? (
            <img src={track.albumArt} alt="" width={36} height={36} style={{ borderRadius: 4, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#1DB954", fontSize: 16 }}>♫</span>
            </div>
          )}

          {/* Track info */}
          <div className="flex-1 min-w-0">
            {track ? (
              <>
                <div className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{track.name}</div>
                <div className="text-[10px] truncate" style={{ color: "var(--muted)" }}>{track.artist}</div>
              </>
            ) : (
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {ready ? "Elige una playlist →" : "Conectando..."}
              </div>
            )}
          </div>

          {/* Time */}
          {track && (
            <div className="text-[10px] flex-shrink-0 hidden sm:block" style={{ color: "var(--muted)" }}>
              {fmt(track.position)} / {fmt(track.duration)}
            </div>
          )}

          {/* Playlist button */}
          <button onClick={openPlaylists}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-100"
            style={{ color: showPlaylists ? "#1DB954" : "var(--muted)", fontSize: 16 }}
            title="Playlists">
            ☰
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => playerRef.current?.previousTrack()}
              className="p-1.5 rounded-lg transition-opacity hover:opacity-100 opacity-60"
              style={{ color: "var(--foreground)" }}>⏮</button>
            <button onClick={() => playerRef.current?.togglePlay()}
              className="p-1.5 rounded-full flex items-center justify-center"
              style={{ background: "#1DB954", color: "#000", width: 28, height: 28, fontSize: 12 }}>
              {track?.paused !== false ? "▶" : "⏸"}
            </button>
            <button onClick={() => playerRef.current?.nextTrack()}
              className="p-1.5 rounded-lg transition-opacity hover:opacity-100 opacity-60"
              style={{ color: "var(--foreground)" }}>⏭</button>
          </div>
        </div>
      </div>
    </>
  );
}
