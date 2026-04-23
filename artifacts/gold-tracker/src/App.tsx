import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Calculator,
  Globe,
  Coins,
  Clock,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  Activity,
  Mail,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { auth, onAuthStateChanged, signOut } from "@/firebase";
import type { User } from "firebase/auth";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import SubscriptionGate from "@/pages/SubscriptionGate";
import Payment from "@/pages/Payment";
import { api } from "@/lib/api";

interface Prices {
  usdPerGram: number;
  bdtPerGram: number;
  k22: number;
}

interface Point {
  time: string;
  price: number;
}

const GRAM_TO_BHORI = 11.664;
const TROY_OUNCE_TO_GRAM = 31.1035;

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [prices, setPrices] = useState<Prices>({
    usdPerGram: 0,
    bdtPerGram: 0,
    k22: 0,
  });
  const [history, setHistory] = useState<Point[]>([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  const [calcWeight, setCalcWeight] = useState<number>(1);
  const [calcUnit, setCalcUnit] = useState("gram");
  const [calcKarat, setCalcKarat] = useState<number>(22);

  const value = useMemo(() => {
    if (!prices.bdtPerGram) return 0;
    let g = Number(calcWeight);
    if (calcUnit === "bhori") g *= GRAM_TO_BHORI;
    if (calcUnit === "ounce") g *= TROY_OUNCE_TO_GRAM;
    return g * prices.bdtPerGram * (calcKarat / 24);
  }, [calcWeight, calcUnit, calcKarat, prices]);

  const fetchHistory = async () => {
    try {
      const r = await api.get<Point[]>("/prices/daily-history");
      if (r.data.length) setHistory(r.data);
    } catch {
      // no-op
    }
  };

  const fetchPrices = async () => {
    try {
      const [g, c] = await Promise.all([
        axios.get<{ price: number }>("https://api.gold-api.com/price/XAU"),
        axios.get<{ rates: Record<string, number> }>(
          "https://open.er-api.com/v6/latest/USD",
        ),
      ]);
      const usdToBdt = c.data.rates["BDT"];
      if (!usdToBdt) return;
      const bhoriBDT = (g.data.price / 42.5) * 16 * usdToBdt + 5000;
      const newBDT = bhoriBDT / GRAM_TO_BHORI;
      setPrices({
        usdPerGram: g.data.price / TROY_OUNCE_TO_GRAM,
        bdtPerGram: newBDT,
        k22: newBDT * (22 / 24),
      });
      setHistory((prev) => {
        const t = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (prev.length && prev[prev.length - 1]!.time === t) return prev;
        return [...prev, { time: t, price: Math.floor(newBDT) }].slice(-48);
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 1800);
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchPrices();
    const i = setInterval(fetchPrices, 10000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-mesh" />

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 2rem",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--glass-border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, hsl(var(--gold-bright)), hsl(var(--gold-deep)))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: pulse
                ? "0 0 24px hsla(45,95%,55%,0.7)"
                : "0 0 14px hsla(45,95%,55%,0.3)",
              transition: "box-shadow 0.5s",
            }}
          >
            <Sparkles size={18} color="#1a1300" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
              Gold Live Analytic
            </h1>
            <span
              style={{
                fontSize: "0.6rem",
                color: "hsl(var(--gold))",
                letterSpacing: "0.18em",
                fontWeight: 700,
              }}
            >
              <span className="live-dot" style={{ marginRight: 6 }} />
              LIVE • BANGLADESH MARKET
            </span>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: "transparent",
              border: "1px solid var(--glass-border)",
              padding: "0.5rem 0.85rem",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              color: "white",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, hsl(var(--gold-bright)), hsl(var(--gold-deep)))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserIcon size={14} color="#1a1300" />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {user.displayName || user.email?.split("@")[0]}
            </span>
            <ChevronDown size={14} color="#888" />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 200,
                  background: "hsl(var(--bg-elev))",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: 6,
                  zIndex: 200,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  onClick={onLogout}
                  style={{
                    padding: "10px 12px",
                    color: "#ff7b7b",
                    cursor: "pointer",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Logout Account
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "2rem" }}
        >
          <span className="badge badge-gold">
            <Activity size={11} /> 24-HOUR SPECTRUM ENGINE
          </span>
          <h1 className="hero" style={{ marginTop: "1rem" }}>
            The market, in real time.
          </h1>
          <p
            className="subtitle"
            style={{ marginTop: 8, maxWidth: 580 }}
          >
            Live Bangladesh gold pricing synchronized with global spot — refreshed
            every 10 seconds for jewelers and serious investors.
          </p>
        </motion.div>

        <div className="dashboard-grid">
          <motion.div
            animate={
              pulse
                ? {
                    scale: [1, 1.015, 1],
                  }
                : {}
            }
            className="glass-card fade-up"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Globe size={18} style={{ color: "hsl(var(--gold))" }} />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "hsl(var(--text-muted))",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Global Spot · BDT/Gram
              </span>
            </div>
            <div className="price-tag">
              ৳
              {prices.bdtPerGram
                ? Math.floor(prices.bdtPerGram).toLocaleString()
                : "—"}
            </div>
            <p style={{ marginTop: 8, fontSize: "0.78rem", color: "hsl(var(--text-muted))" }}>
              ${prices.usdPerGram?.toFixed(2)} USD per gram
            </p>
          </motion.div>

          <motion.div
            animate={pulse ? { scale: [1, 1.015, 1] } : {}}
            className="glass-card fade-up"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Coins size={18} style={{ color: "hsl(var(--gold))" }} />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "hsl(var(--text-muted))",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Jewelry Rate · 22K
              </span>
            </div>
            <div className="price-tag">
              ৳{prices.k22 ? Math.floor(prices.k22).toLocaleString() : "—"}
            </div>
            <p style={{ marginTop: 8, fontSize: "0.78rem", color: "hsl(var(--text-muted))" }}>
              ৳{prices.k22 ? Math.floor(prices.k22 * GRAM_TO_BHORI).toLocaleString() : "—"} per bhori
            </p>
          </motion.div>

          <div
            className="glass-card span-full fade-up"
            style={{ height: 380 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <TrendingUp size={20} style={{ color: "hsl(var(--gold))" }} />
                <h3 style={{ fontWeight: 700 }}>24-Hour Market Trend</h3>
              </div>
              <span className="badge badge-gold">
                <span className="live-dot" /> LIVE SYNC · 🇧🇩
              </span>
            </div>
            {history.length ? (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="gldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(45 95% 55%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(45 95% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#666"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    hide
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(230 22% 10%)",
                      border: "1px solid var(--gold-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    itemStyle={{ color: "hsl(var(--gold-bright))" }}
                    labelStyle={{ color: "#999" }}
                    formatter={(v: number) => `৳${v.toLocaleString()}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(45 95% 55%)"
                    strokeWidth={2.5}
                    fill="url(#gldGradient)"
                    dot={{ fill: "hsl(45 95% 55%)", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "85%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(var(--text-muted))",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <Loader2 className="spin" size={20} style={{ color: "hsl(var(--gold))" }} />
                <span style={{ fontSize: "0.85rem" }}>Building 24h spectrum…</span>
              </div>
            )}
          </div>

          <div className="glass-card span-full fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
              <Clock size={18} style={{ color: "hsl(var(--gold))" }} />
              <h3>মার্কেট দর সারসংক্ষেপ · Karat Protocol</h3>
            </div>
            <div className="scroll-area">
              <table>
                <thead>
                  <tr>
                    <th>Karat</th>
                    <th>Per Gram</th>
                    <th>Per Bhori (11.664g)</th>
                  </tr>
                </thead>
                <tbody>
                  {[22, 21, 18, 14.6].map((k) => (
                    <tr key={k}>
                      <td style={{ fontWeight: 700 }}>
                        {k === 14.6 ? "Traditional" : `${k}K`}
                      </td>
                      <td className="gold-text" style={{ fontWeight: 700 }}>
                        ৳ {prices.bdtPerGram ? Math.floor(prices.bdtPerGram * (k / 24)).toLocaleString() : "—"}
                      </td>
                      <td className="gold-text" style={{ fontWeight: 700 }}>
                        ৳ {prices.bdtPerGram ? Math.floor(prices.bdtPerGram * (k / 24) * GRAM_TO_BHORI).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card span-full fade-up" style={{ padding: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" }}>
              <Calculator size={18} style={{ color: "hsl(var(--gold))" }} />
              <h3>Precision Jewellers Valuation</h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "2rem",
                alignItems: "start",
              }}
            >
              <div className="auth-form">
                <div className="input-group">
                  <label>Weight</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="input-group">
                  <label>Unit</label>
                  <select
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value)}
                  >
                    <option value="gram">Grams</option>
                    <option value="bhori">Bhori</option>
                    <option value="ounce">Troy Ounce</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Purity</label>
                  <select
                    value={calcKarat}
                    onChange={(e) => setCalcKarat(Number(e.target.value))}
                  >
                    <option value={24}>24K (Pure)</option>
                    <option value={22}>22K</option>
                    <option value={21}>21K</option>
                    <option value={18}>18K</option>
                  </select>
                </div>
              </div>
              <div
                className="gold-card"
                style={{
                  padding: "2.5rem",
                  textAlign: "center",
                  boxShadow: "var(--gold-glow)",
                }}
              >
                <p
                  style={{
                    color: "hsl(var(--gold))",
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                  }}
                >
                  ESTIMATED VALUATION
                </p>
                <div
                  style={{
                    fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                    fontWeight: 800,
                    margin: "1rem 0 0.5rem",
                    letterSpacing: "-0.02em",
                  }}
                  className="gold-text"
                >
                  ৳{Math.floor(value).toLocaleString()}
                </div>
                <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.8rem" }}>
                  Bangladeshi Taka
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        style={{
          background: "rgba(0,0,0,0.4)",
          padding: "3.5rem 2rem 2rem",
          borderTop: "1px solid var(--glass-border)",
          marginTop: "3rem",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "3rem",
            padding: 0,
          }}
        >
          <div>
            <h4
              style={{
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 18,
                  background: "hsl(var(--gold))",
                  borderRadius: 2,
                }}
              />
              XPA GOLD ANALYTIC
            </h4>
            <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.7 }}>
              Real-time precision and analytical tools for the modern jeweler
              and gold investor.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: "1.5rem" }}>
              <Globe size={16} color="#666" />
              <Activity size={16} color="#666" />
              <ShieldCheck size={16} color="#666" />
              <Mail size={16} color="#666" />
            </div>
          </div>
          <div>
            <h5
              style={{
                marginBottom: "1.25rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "hsl(var(--gold))",
              }}
            >
              Quick Navigation
            </h5>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {["Market Rates", "Valuation Tools", "Live Spectrum", "Subscription Hub"].map(
                (l) => (
                  <li
                    key={l}
                    style={{
                      color: "#888",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    {l}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div style={{ textAlign: "right" }}>
            <h5 style={{ color: "#888", marginBottom: 10, fontSize: "0.7rem", letterSpacing: "0.15em", fontWeight: 700 }}>
              DEVELOPED BY
            </h5>
            <p
              className="gold-text"
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                letterSpacing: "0.05em",
              }}
            >
              XPA GOLD LIMITED
            </p>
            <p style={{ color: "#444", fontSize: "0.65rem", marginTop: 8, letterSpacing: "0.1em" }}>
              © 2026 PRECISION MARKET SYSTEM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Root() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [active, setActive] = useState(false);
  const [checking, setChecking] = useState(false);

  const syncAndCheck = async (u: User | null) => {
    if (!u || !u.email) return;
    setChecking(true);
    try {
      await api.post("/auth/sync", { email: u.email });
      const r = await api.get("/subscription", {
        headers: { "x-user-email": u.email },
      });
      setActive(Boolean(r.data.active));
    } catch {
      setActive(false);
    }
    setChecking(false);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await syncAndCheck(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setActive(false);
  };

  if (loadingAuth || checking) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="bg-mesh" />
        <Loader2 className="spin" size={32} style={{ color: "hsl(var(--gold))" }} />
        <h2
          className="gold-text"
          style={{ fontSize: "0.9rem", letterSpacing: "0.2em", fontWeight: 700 }}
        >
          ESTABLISHING 24H SPECTRUM…
        </h2>
      </div>
    );
  }

  if (!user) return <Auth onLogin={() => syncAndCheck(auth.currentUser)} />;
  if (!active) return <SubscriptionGate user={user} onLogout={handleLogout} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/" element={<Root />} />
      </Routes>
    </Router>
  );
}
