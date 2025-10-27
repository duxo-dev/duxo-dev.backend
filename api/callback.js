import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("No code");

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;
    const frontendUrl = process.env.FRONTEND_URL || "https://your-frontend.github.io";
    const guildId = process.env.GUILD_ID; // optional: require membership
    const botToken = process.env.BOT_TOKEN;

    // Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json({ error: "Token exchange failed", details: tokenData });

    // Fetch user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const user = await userRes.json();
    // user.id, user.username, user.discriminator, user.avatar

    // Optional: verify guild membership using the bot token (server-side only)
    if (guildId && botToken) {
      const guildMemberRes = await fetch(`https://discord.com/api/guilds/${guildId}/members/${user.id}`, {
        headers: { Authorization: `Bot ${botToken}` }
      });
      if (guildMemberRes.status === 404) {
        // user is NOT in the guild
        return res.redirect(`${frontendUrl}/?error=${encodeURIComponent("You must be in the server to use this site")}`);
      }
      // If 200 -> member exists. You can parse roles if needed.
    }

    // Create a JWT for session (replace with DB check for persistent coins)
    const jwtSecret = process.env.JWT_SECRET;
    // Example payload: give 1000 coins for new user — in production persist in DB
    const payload = {
      uid: user.id,
      username: `${user.username}#${user.discriminator}`,
      avatar: user.avatar,
      coins: 1000
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

    // Set an HTTP-only, Secure cookie (Vercel serves HTTPS)
    const cookie = serialize("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    res.setHeader("Set-Cookie", cookie);

    // Redirect back to frontend — frontend will call /api/me to get user info
    return res.redirect(`${frontendUrl}#loggedin`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
}
