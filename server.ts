import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = `${process.env.APP_URL || 'http://localhost:3000'}/auth/spotify/callback`;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`;

// Spotify Auth Routes
app.get("/api/auth/spotify/url", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private user-library-read user-top-read";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID!,
    scope: scope,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });
  res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
});

app.get("/auth/spotify/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
// ...

    const { access_token, refresh_token, expires_in } = response.data;

    res.cookie("spotify_access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: expires_in * 1000,
    });

    res.cookie("spotify_refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Spotify connected successfully! This window will close.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Spotify Auth Error:", error.response?.data || error.message);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/spotify/token", (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  res.json({ access_token: token });
});

app.get("/api/spotify/me", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(401).json({ error: "Token expired or invalid" });
  }
});

app.get("/api/spotify/playlists", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

app.get("/api/spotify/liked-tracks", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/tracks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch liked tracks" });
  }
});

app.get("/api/spotify/featured-playlists", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/browse/featured-playlists", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch featured playlists" });
  }
});

app.get("/api/spotify/top-artists", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top artists" });
  }
});

app.get("/api/spotify/made-for-you", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    // Category ID for "Made For You" is 0JQ5DAqbMKFHOzu99WzbFq
    const response = await axios.get("https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFHOzu99WzbFq/playlists?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch made for you playlists" });
  }
});

app.get("/api/spotify/new-releases", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/browse/new-releases?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch new releases" });
  }
});

app.get("/api/spotify/top-tracks", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    // Global Top 50 Playlist ID: 37i9dQZEVXbMDoHDw22tNq
    const response = await axios.get("https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDw22tNq/tracks?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

// Google/YouTube Auth Routes
app.get("/api/auth/google/url", (req, res) => {
  const scope = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ].join(" ");
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "consent"
  });
  
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
});

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token, refresh_token, expires_in } = response.data;

    res.cookie("google_access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: expires_in * 1000,
    });

    if (refresh_token) {
      res.cookie("google_refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>YouTube Music connected successfully! This window will close.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Google Auth Error:", error.response?.data || error.message);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/youtube/me", async (req, res) => {
  const token = req.cookies.google_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(401).json({ error: "Token expired or invalid" });
  }
});

app.get("/api/youtube/playlists", async (req, res) => {
  const token = req.cookies.google_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/playlists", {
      params: {
        part: "snippet,contentDetails",
        mine: true,
        maxResults: 50
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch YouTube playlists" });
  }
});

app.get("/api/youtube/liked-videos", async (req, res) => {
  const token = req.cookies.google_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        part: "snippet,contentDetails",
        myRating: "like",
        maxResults: 50
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch liked videos" });
  }
});

app.get("/api/youtube/playlist-items/:playlistId", async (req, res) => {
  const token = req.cookies.google_access_token;
  const { playlistId } = req.params;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
      params: {
        part: "snippet,contentDetails",
        playlistId: playlistId,
        maxResults: 50
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlist items" });
  }
});

app.get("/api/spotify/search", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  const { q } = req.query;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      params: { q, type: "track", limit: 20 },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to search Spotify" });
  }
});

app.get("/api/spotify/recommendations", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  const { seed_tracks, seed_artists, seed_genres } = req.query;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/recommendations", {
      params: { seed_tracks, seed_artists, seed_genres, limit: 20 },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Spotify recommendations" });
  }
});

app.get("/api/youtube/search", async (req, res) => {
  const token = req.cookies.google_access_token;
  const { q } = req.query;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: q,
        type: "video",
        videoCategoryId: "10", // Music category
        maxResults: 20
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to search YouTube" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("spotify_access_token");
  res.clearCookie("spotify_refresh_token");
  res.clearCookie("google_access_token");
  res.clearCookie("google_refresh_token");
  res.json({ success: true });
});

// Vite middleware setup
async function startServer() {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("sync-play", ({ roomId, song, position }) => {
      socket.to(roomId).emit("sync-play", { song, position });
    });

    socket.on("sync-pause", (roomId) => {
      socket.to(roomId).emit("sync-pause");
    });

    socket.on("sync-seek", ({ roomId, position }) => {
      socket.to(roomId).emit("sync-seek", position);
    });

    socket.on("chat-message", ({ roomId, message, user }) => {
      io.to(roomId).emit("chat-message", { message, user, timestamp: Date.now() });
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
