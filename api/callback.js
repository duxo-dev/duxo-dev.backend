const params = new URLSearchParams({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  grant_type: "authorization_code",
  code: code, // from Discord callback
  redirect_uri: "https://duxo-dev.backend.vercel.app/api/callback"
});

const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params.toString()
});
