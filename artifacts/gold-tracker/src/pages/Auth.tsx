import { useState, FormEvent } from "react";
import { Mail, Lock, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "@/firebase";
import { api } from "@/lib/api";

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = async (userEmail: string) => {
    try {
      const r = await api.post("/auth/sync", { email: userEmail });
      if (r.data.success) onLogin();
      else throw new Error("Registry handshake failed.");
    } catch (e: any) {
      setError(
        "Database offline. Please ensure the server is running.",
      );
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await sync(res.user.email!);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      await sync(res.user.email!);
    } catch (err: any) {
      setError(err.message);
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
            <ShieldCheck size={34} color="hsl(45 95% 55%)" />
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

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.9rem",
            background: "white",
            color: "#1f1f1f",
            border: "none",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: loading ? "wait" : "pointer",
            transition: "all 0.25s",
            marginBottom: "1.5rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "1.5rem 0",
            color: "hsl(var(--text-muted))",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--glass-border)" }} />
          OR EMAIL
          <div style={{ flex: 1, height: 1, background: "var(--glass-border)" }} />
        </div>

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
                placeholder="••••••••"
                style={{ paddingLeft: 42 }}
                required
                minLength={6}
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
