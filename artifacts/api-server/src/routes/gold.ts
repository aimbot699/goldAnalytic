import { Router, type IRouter } from "express";
import axios from "axios";
import bcrypt from "bcryptjs";
import { pool, initDB } from "../lib/mysql";

const router: IRouter = Router();

initDB();

async function recordPrice(): Promise<void> {
  try {
    const gRes = await axios.get<{ price: number }>(
      "https://api.gold-api.com/price/XAU",
    );
    const curRes = await axios.get<{ rates: Record<string, number> }>(
      "https://open.er-api.com/v6/latest/USD",
    );
    const usdToBdt = curRes.data.rates["BDT"];
    if (!usdToBdt) return;
    const bhoriBDT = (gRes.data.price / 42.5) * 16 * usdToBdt + 5000;
    const pricePerGram = Math.floor(bhoriBDT / 11.664);
    await pool.query("INSERT INTO price_history (price) VALUES (?)", [
      pricePerGram,
    ]);
  } catch {
    // recorder skip
  }
}
setInterval(recordPrice, 30 * 60 * 1000);

router.get("/prices/daily-history", async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT price, recordedAt FROM price_history ORDER BY recordedAt DESC LIMIT 48",
    );
    res.json(
      rows.reverse().map((r) => ({
        time: new Date(r.recordedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: r.price,
      })),
    );
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password || password.length < 6)
    return res.status(400).json({ error: "Email and password (min 6 chars) required" });
  try {
    const [existing] = await pool.query<any[]>(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password, verified) VALUES (?, ?, ?)",
      [email, hash, true],
    );
    await pool.query(
      "INSERT IGNORE INTO subscriptions (email, active, planTitle) VALUES (?, ?, ?)",
      [email, false, "Guest Protocol"],
    );
    return res.json({ success: true, email });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT id, email, password FROM users WHERE email = ?",
      [email],
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });
    const user = rows[0];
    let ok = false;
    if (user.password === "FIREBASE_AUTH") {
      const hash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, user.id]);
      ok = true;
    } else {
      ok = await bcrypt.compare(password, user.password);
    }
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });
    return res.json({ success: true, email: user.email });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/auth/sync", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: "email required" });
  try {
    await pool.query(
      "INSERT IGNORE INTO subscriptions (email, active, planTitle) VALUES (?, ?, ?)",
      [email, false, "Guest Protocol"],
    );
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/subscription", async (req, res) => {
  const email = req.headers["x-user-email"] as string | undefined;
  if (!email) return res.json({ active: false });
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT * FROM subscriptions WHERE email = ?",
      [email],
    );
    if (rows.length === 0) return res.json({ active: false });
    const sub = rows[0];
    const now = new Date();
    const expiry = sub.expiryDate ? new Date(sub.expiryDate) : null;
    const isActive = Boolean(sub.active && (!expiry || expiry > now));
    return res.json({ active: isActive, expiryDate: sub.expiryDate, planTitle: sub.planTitle });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/orders/mine", async (req, res) => {
  const email = req.headers["x-user-email"] as string | undefined;
  if (!email) return res.json([]);
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT planId, status FROM orders WHERE email = ? AND status IN ('pending','approved')",
      [email],
    );
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/orders", async (req, res) => {
  const { planId, planTitle, price, senderNumber, trxId, paymentMethod, email } =
    req.body as Record<string, string | number>;
  if (!email || !planId)
    return res.status(400).json({ error: "Missing required fields" });
  try {
    const [dup] = await pool.query<any[]>(
      "SELECT id, status FROM orders WHERE email = ? AND planId = ? AND status IN ('pending','approved') LIMIT 1",
      [email, planId],
    );
    if (dup.length > 0) {
      const status = dup[0].status;
      return res.status(409).json({
        error:
          status === "approved"
            ? "You already own this plan."
            : "You already have a pending order for this plan. Please wait for verification.",
      });
    }
    await pool.query(
      "INSERT INTO orders (email, planId, planTitle, price, senderNumber, trxId, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [email, planId, planTitle, price, senderNumber, trxId, paymentMethod],
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/admin/users", async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT u.email as id, s.active, s.expiryDate, s.planTitle, u.createdAt FROM users u LEFT JOIN subscriptions s ON u.email = s.email ORDER BY u.createdAt DESC",
    );
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/admin/orders", async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT * FROM orders ORDER BY createdAt DESC",
    );
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/admin/approve-order", async (req, res) => {
  const { orderId, email, planId, planTitle } = req.body as Record<
    string,
    string | number
  >;
  try {
    const days =
      planId === "lifetime" ? 99999 : planId === "yearly" ? 365 : 30;
    const expiry = new Date(Date.now() + days * 86400000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await pool.query(
      "INSERT INTO subscriptions (email, active, expiryDate, planTitle) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE active = true, expiryDate = ?, planTitle = ?",
      [email, true, expiry, planTitle, expiry, planTitle],
    );
    if (orderId) {
      await pool.query("UPDATE orders SET status = 'approved' WHERE id = ?", [
        orderId,
      ]);
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/admin/reject-order", async (req, res) => {
  const { orderId } = req.body as { orderId?: number };
  try {
    await pool.query("UPDATE orders SET status = 'rejected' WHERE id = ?", [
      orderId,
    ]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/admin/toggle-sub", async (req, res) => {
  const { email, active } = req.body as { email: string; active: boolean };
  try {
    const expiry = active
      ? new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      : null;
    await pool.query(
      "INSERT INTO subscriptions (email, active, expiryDate, planTitle) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE active = ?, expiryDate = ?",
      [email, active, expiry, "Manual Control", active, expiry],
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
