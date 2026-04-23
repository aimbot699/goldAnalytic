import { useState, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle,
  Loader2,
  Info,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredUser } from "@/lib/auth";
import { api } from "@/lib/api";

const plans: Record<string, { title: string; price: number }> = {
  monthly: { title: "Monthly Access", price: 60 },
  yearly: { title: "Yearly Protocol", price: 400 },
  lifetime: { title: "Lifetime Protocol", price: 2000 },
};

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const planId = new URLSearchParams(location.search).get("plan") || "monthly";
  const plan = plans[planId] || plans.monthly!;

  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!trxId || !senderNumber) return setError("Please fill all fields.");
    if (!/^01[3-9]\d{8}$/.test(senderNumber))
      return setError("Invalid number. Use an 11-digit BD number.");

    setLoading(true);
    try {
      const user = getStoredUser();
      if (!user) throw new Error("Please log in again.");
      const r = await api.post("/orders", {
        email: user.email,
        planId,
        planTitle: plan.title,
        price: plan.price,
        senderNumber,
        trxId,
        paymentMethod,
      });
      if (r.data.success) setDone(true);
      else throw new Error(r.data.error || "Order failed.");
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-container">
        <div className="bg-mesh" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ maxWidth: 540, padding: "3rem", textAlign: "center" }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, hsl(var(--gold-bright)), hsl(var(--gold-deep)))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 0 40px hsla(45,95%,55%,0.4)",
            }}
          >
            <CheckCircle size={40} color="#1a1300" />
          </div>
          <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 8 }}>
            Order received
          </h1>
          <p className="subtitle" style={{ marginBottom: "2rem" }}>
            We received your <b style={{ color: "hsl(var(--gold))" }}>{plan.title}</b>{" "}
            payment of ৳{plan.price}. Verification typically completes within
            5–15 minutes.
          </p>
          <button onClick={() => navigate("/")} className="primary-btn">
            Back to dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="bg-mesh" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ maxWidth: 1000, width: "100%", padding: "2.5rem" }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            color: "hsl(var(--text-muted))",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            marginBottom: "1.5rem",
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="badge badge-gold" style={{ marginBottom: "1rem" }}>
            <Sparkles size={11} /> SECURE CHECKOUT
          </span>
          <h1 className="hero" style={{ fontSize: "2.5rem", marginBottom: 8 }}>
            {plan.title}
          </h1>
          <p style={{ color: "hsl(var(--gold))", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.05em" }}>
            PAYABLE: ৳ {plan.price.toLocaleString()} BDT
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
          <div>
            <h3 style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Info size={18} style={{ color: "hsl(var(--gold))" }} /> How to pay
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                {
                  n: 1,
                  text: (
                    <>
                      Send <b>৳ {plan.price}</b> to one of the numbers below using{" "}
                      <b>"Send Money"</b> (Personal).
                    </>
                  ),
                },
              ].map((s) => (
                <div
                  key={s.n}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "1rem 1.25rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--glass-border)",
                    borderLeft: "3px solid hsl(var(--gold))",
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      minWidth: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, hsl(var(--gold-bright)), hsl(var(--gold-deep)))",
                      color: "#1a1300",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    {s.n}
                  </div>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.55, color: "#cfcfcf" }}>{s.text}</p>
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    background: "rgba(255, 75, 145, 0.05)",
                    border: "1px solid rgba(255, 75, 145, 0.25)",
                    borderRadius: 12,
                  }}
                >
                  <p style={{ fontSize: "0.65rem", color: "#ff4b91", fontWeight: 800, letterSpacing: "0.1em" }}>
                    BKASH
                  </p>
                  <p style={{ fontSize: "1.15rem", fontWeight: 800, color: "white", marginTop: 4 }}>
                    01811565554
                  </p>
                </div>
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    background: "rgba(247, 147, 30, 0.05)",
                    border: "1px solid rgba(247, 147, 30, 0.25)",
                    borderRadius: 12,
                  }}
                >
                  <p style={{ fontSize: "0.65rem", color: "#f7931e", fontWeight: 800, letterSpacing: "0.1em" }}>
                    NAGAD
                  </p>
                  <p style={{ fontSize: "1.15rem", fontWeight: 800, color: "white", marginTop: 4 }}>
                    01617804837
                  </p>
                </div>
              </div>

              {[
                { n: 2, text: <>Copy the <b>Transaction ID</b> from the SMS.</> },
                { n: 3, text: <>Enter your <b>number</b> and <b>TrxID</b> to verify.</> },
              ].map((s) => (
                <div
                  key={s.n}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "1rem 1.25rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--glass-border)",
                    borderLeft: "3px solid hsl(var(--gold))",
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      minWidth: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, hsl(var(--gold-bright)), hsl(var(--gold-deep)))",
                      color: "#1a1300",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    {s.n}
                  </div>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.55, color: "#cfcfcf" }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "2rem",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
            }}
          >
            <h3 style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} style={{ color: "hsl(var(--gold))" }} /> Verify payment
            </h3>
            <form onSubmit={submit} className="auth-form">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: "12px 14px",
                      background: "rgba(255, 75, 75, 0.08)",
                      border: "1px solid rgba(255, 75, 75, 0.3)",
                      borderRadius: 10,
                      color: "#ff7b7b",
                      fontSize: "0.83rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="input-group">
                <label>Gateway</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>

              <div className="input-group">
                <label>Your number</label>
                <div style={{ position: "relative" }}>
                  <Smartphone
                    size={16}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "hsl(var(--gold))",
                      opacity: 0.7,
                    }}
                  />
                  <input
                    type="text"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label>Transaction ID</label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="e.g. 8GH4NKL92F"
                  required
                />
              </div>

              <button type="submit" className="primary-btn" disabled={loading} style={{ width: "100%", padding: "1rem" }}>
                {loading ? <Loader2 className="spin" size={18} /> : `Verify & Activate`}
              </button>

              <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "hsl(var(--text-muted))", textAlign: "center" }}>
                Verification typically takes 5–15 minutes.
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
