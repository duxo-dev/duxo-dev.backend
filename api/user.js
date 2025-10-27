export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "No token provided" });

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const userData = await userResponse.json();
  return res.status(200).json(userData);
}
