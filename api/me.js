import jwt from "jsonwebtoken";
import { parse } from "cookie";

export default async function handler(req, res) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const token = cookies.session;
    if (!token) return res.status(401).json({ loggedIn: false });

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (e) {
      return res.status(401).json({ loggedIn: false, error: "Invalid token" });
    }

    // TODO: fetch real coin balance from DB by payload.uid
    // For now, return payload info
    return res.json({
      loggedIn: true,
      user: {
        id: payload.uid,
        username: payload.username,
        avatar: payload.avatar,
        coins: payload.coins
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
