import { useState, FormEvent } from "react";
import { Mail, Lock, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { login, register } from "@/lib/auth";

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
      onLogin();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err.message ||
          "Authentication failed. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-mesh" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
        style={{ maxWidth: 460, width: "100%", padding: "3rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              width: 72,
              height: 72,
              margin: "0 auto 1.5rem",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, hsla(45,95%,55%,0.15), hsla(45,95%,55%,0.04))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--gold-border)",
              boxShadow: "0 0 40px hsla(45,95%,55%,0.2)",
            }}
          >
            <img src="/logo.png" alt="Logo" style={{ width: "60%", height: "60%", objectFit: "contain" }} />
          </div>
          <h1 className="serif" style={{ fontSize: "2.2rem", marginBottom: 6 }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="subtitle">
            {isLogin
              ? "Sign in to access live gold rates"
              : "Join the precision market protocol"}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "12px 16px",
              background: "rgba(255, 75, 75, 0.08)",
              border: "1px solid rgba(255, 75, 75, 0.3)",
              borderRadius: 12,
              color: "#ff7b7b",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <div style={{ position: "relative" }}>
              <Mail
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ paddingLeft: 42 }}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: "1.75rem" }}>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (min 6 chars)"
                style={{ paddingLeft: 42 }}
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{ width: "100%", padding: "1rem" }}
          >
            {loading ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <>
                <Sparkles size={16} />
                {isLogin ? "Sign in" : "Create account"}
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.88rem",
            color: "hsl(var(--text-muted))",
          }}
        >
          {isLogin ? "New here? " : "Already have an account? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            style={{
              color: "hsl(var(--gold))",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </motion.div>
    </div>
  );
}
