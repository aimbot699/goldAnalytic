import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Phone,
  Mail,
  Check,
  User as UserIcon,
  ChevronDown,
  LogOut,
  Sparkles,
  Crown,
  Infinity as InfinityIcon,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

interface MyOrder {
  planId: string;
  status: string;
}

export default function SubscriptionGate({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<MyOrder[]>("/orders/mine", { headers: { "x-user-email": user.email } })
      .then((r) => setMyOrders(r.data))
      .catch(() => setMyOrders([]));
  }, [user.email]);

  const orderStatus = (planId: string) =>
    myOrders.find((o) => o.planId === planId)?.status;

  const plans = [
    {
      id: "monthly",
      title: "Monthly",
      price: 60,
      period: "per month",
      icon: Sparkles,
      popular: false,
      features: [
        "Live gold rates (10s refresh)",
        "24-hour market trends",
        "All karat valuations",
        "Precision calculator",
      ],
    },
    {
      id: "yearly",
      title: "Yearly",
      price: 400,
      period: "per year",
      icon: Crown,
      popular: true,
      features: [
        "Everything in Monthly",
        "Save ৳320 per year",
        "Priority data sync",
        "Premium member badge",
      ],
    },
    {
      id: "lifetime",
      title: "Lifetime",
      price: 2000,
      period: "one-time",
      icon: InfinityIcon,
      popular: false,
      features: [
        "Everything in Yearly",
        "Pay once, use forever",
        "All future updates",
        "Founders circle access",
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-mesh" />
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 2rem",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--glass-border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 0 8px hsla(45,95%,55%,0.4))",
            }}
          >
            <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
              GOLDBAZARPRICE GOLD ANALYTIC
            </h1>
            <span
              style={{
                fontSize: "0.6rem",
                color: "hsl(var(--gold))",
                letterSpacing: "0.15em",
                fontWeight: 700,
              }}
            >
              SUBSCRIPTION REQUIRED
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
                background: "linear-gradient(135deg, hsl(var(--gold-bright)), hsl(var(--gold-deep)))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserIcon size={14} color="#1a1300" />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {user.email?.split("@")[0]}
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
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#ff7b7b",
                    cursor: "pointer",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <LogOut size={15} /> Logout
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="container" style={{ paddingTop: "3rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <ShieldAlert
            size={50}
            style={{ color: "hsl(var(--gold))", marginBottom: "1.25rem" }}
          />
          <h1 className="hero" style={{ marginBottom: "0.75rem" }}>
            Unlock the full market.
          </h1>
          <p className="subtitle" style={{ maxWidth: 560, margin: "0 auto" }}>
            High-frequency gold pricing, professional valuations, and 24-hour
            spectrum data — built for jewelers and serious investors.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "4rem",
            paddingTop: 18,
          }}
        >
          {plans.map((p, i) => {
            const Icon = p.icon;
            const status = orderStatus(p.id);
            const disabled = !!status;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={disabled ? {} : { y: -6 }}
                className={p.popular ? "gold-card" : "glass-card"}
                style={{
                  padding: "2rem",
                  position: "relative",
                  border: p.popular
                    ? "1px solid hsl(var(--gold))"
                    : undefined,
                  boxShadow: p.popular
                    ? "0 0 60px hsla(45,95%,55%,0.18)"
                    : undefined,
                  opacity: disabled ? 0.85 : 1,
                  overflow: "visible",
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -14,
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(var(--gold-bright)), hsl(var(--gold-deep)))",
                        color: "#1a1300",
                        border: "none",
                        boxShadow: "0 6px 18px hsla(45,95%,55%,0.45)",
                        padding: "0.4rem 0.95rem",
                        fontSize: "0.68rem",
                      }}
                    >
                      ★ MOST POPULAR
                    </span>
                  </div>
                )}

                <Icon
                  size={28}
                  style={{ color: "hsl(var(--gold))", marginBottom: "1rem" }}
                />
                <h3
                  className="serif"
                  style={{ fontSize: "1.6rem", marginBottom: 4 }}
                >
                  {p.title}
                </h3>
                <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  {p.period}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: "1.75rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "hsl(var(--text-muted))" }}>
                    ৳
                  </span>
                  <span
                    style={{
                      fontSize: "3rem",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                    }}
                    className="gold-text"
                  >
                    {p.price.toLocaleString()}
                  </span>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    marginBottom: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        fontSize: "0.88rem",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      <Check size={14} style={{ color: "hsl(var(--gold))", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {disabled ? (
                  <button
                    disabled
                    className="ghost-btn"
                    style={{
                      width: "100%",
                      cursor: "not-allowed",
                      opacity: 0.85,
                      background:
                        status === "approved"
                          ? "hsla(142,70%,45%,0.1)"
                          : "hsla(45,95%,55%,0.08)",
                      borderColor:
                        status === "approved"
                          ? "hsla(142,70%,45%,0.4)"
                          : "var(--gold-border)",
                      color:
                        status === "approved"
                          ? "hsl(142,70%,55%)"
                          : "hsl(var(--gold))",
                    }}
                  >
                    {status === "approved" ? (
                      <>
                        <CheckCircle2 size={15} /> Active
                      </>
                    ) : (
                      <>
                        <Clock size={15} /> Awaiting verification
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/payment?plan=${p.id}`)}
                    className={p.popular ? "primary-btn" : "ghost-btn"}
                    style={{ width: "100%" }}
                  >
                    Choose {p.title}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
          style={{
            padding: "2rem",
            background:
              "linear-gradient(135deg, hsla(45,95%,55%,0.04), transparent)",
            border: "1px solid var(--gold-border)",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div>
              <h3 style={{ marginBottom: 4 }}>Need direct assistance?</h3>
              <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.88rem" }}>
                Contact our team for instant activation.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={18} style={{ color: "hsl(var(--gold))" }} />
                <div>
                  <p style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Mobile
                  </p>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>01616685710</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Mail size={18} style={{ color: "hsl(var(--gold))" }} />
                <div>
                  <p style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Email
                  </p>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>arpitsarkern@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
