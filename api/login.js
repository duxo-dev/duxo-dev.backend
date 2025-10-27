export default async function handler(req, res) {
  const redirectUri = encodeURIComponent("https://duxo-dev-backend.vercel.app/api/callback");
  const clientId = "YOUR_DISCORD_CLIENT_ID"; // replace with yours

  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;

  return res.redirect(discordAuthUrl);
}
