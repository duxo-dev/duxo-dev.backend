import fetch from "node-fetch";

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided!");

  const clientId = "YOUR_DISCORD_CLIENT_ID";
  const clientSecret = "YOUR_DISCORD_CLIENT_SECRET";
  const redirectUri = "https://duxo-dev-backend.vercel.app/api/callback";

  // Exchange code for access token
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return res.status(400).json({ error: "Failed to get token", details: tokenData });
  }

  // Fetch user info
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const userData = await userResponse.json();

  // You can store or forward this user data to your frontend
  return res.redirect(`https://your-frontend.github.io?user=${encodeURIComponent(JSON.stringify(userData))}`);
}
