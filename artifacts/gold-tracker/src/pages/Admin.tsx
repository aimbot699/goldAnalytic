import { useEffect, useState, FormEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  ListOrdered,
  Users,
  ArrowLeft,
  Clock,
  TrendingUp,
  DollarSign,
  Inbox,
  Settings as SettingsIcon,
  KeyRound,
  Save,
  RefreshCw,
  Search,
  Smartphone,
  Hash,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface Order {
  id: number;
  email: string;
  planTitle: string;
  planId: string;
  price: number;
  senderNumber: string;
  trxId: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  active: boolean | number;
  expiryDate: string | null;
  planTitle: string | null;
  createdAt: string;
}

const statKey = (label: string, value: string | number, Icon: any, color: string) => ({
  label,
  value,
  Icon,
  color,
});

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(
    typeof window !== "undefined" && localStorage.getItem("admin_auth") === "true",
  );
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "orders" | "users" | "settings">(
    "overview",
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actioning, setActioning] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [o, u] = await Promise.all([
        api.get<Order[]>("/admin/orders"),
        api.get<UserRow[]>("/admin/users"),
      ]);
      setOrders(o.data);
      setUsers(u.data);
    } catch {
      setError("Failed to load admin data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post("/admin/login", { password: pass });
      if (r.data?.success) {
        localStorage.setItem("admin_auth", "true");
        setAuthed(true);
      } else throw new Error(r.data?.error || "Incorrect");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Incorrect access code.");
    }
  };

  const approve = async (o: Order) => {
    setActioning(o.id);
    await api.post("/admin/approve-order", {
      orderId: o.id,
      email: o.email,
      planId: o.planId,
      planTitle: o.planTitle,
    });
    await fetchAll();
    setActioning(null);
  };

  const reject = async (id: number) => {
    setActioning(id);
    await api.post("/admin/reject-order", { orderId: id });
    await fetchAll();
    setActioning(null);
  };

  const toggleSub = async (email: string, active: boolean) => {
    await api.post("/admin/toggle-sub", { email, active: !active });
    fetchAll();
  };

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders],
  );
  const approvedOrders = useMemo(
    () => orders.filter((o) => o.status === "approved"),
    [orders],
  );
  const totalRevenue = useMemo(
    () => approvedOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0),
    [approvedOrders],
  );

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.email.toLowerCase().includes(q) ||
        o.trxId?.toLowerCase().includes(q) ||
        o.senderNumber?.toLowerCase().includes(q) ||
        o.planTitle?.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.id.toLowerCase().includes(q));
  }, [users, search]);

  if (!authed) {
    return (
      <div className="auth-container">
        <div className="bg-mesh" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ maxWidth: 420, padding: "3rem", width: "100%" }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <ShieldAlert
              size={42}
              style={{ color: "hsl(var(--gold))", marginBottom: "1rem" }}
            />
            <h1 className="serif" style={{ fontSize: "1.8rem" }}>
              Admin Console
            </h1>
            <p className="subtitle" style={{ marginTop: 6 }}>
              Restricted area. Enter access code.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(255, 75, 75, 0.08)",
                border: "1px solid rgba(255, 75, 75, 0.3)",
                borderRadius: 10,
                color: "#ff7b7b",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="auth-form">
            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label>Access Code</label>
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
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••"
                  style={{ paddingLeft: 42 }}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="primary-btn" style={{ width: "100%" }}>
              Access Console
            </button>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "hsl(var(--text-muted))",
                textAlign: "center",
              }}
            >
              Default password is <code style={{ color: "hsl(var(--gold))" }}>admin</code> — change it after first login.
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  const stats = [
    statKey("Pending", pendingOrders.length, Clock, "hsl(45 95% 55%)"),
    statKey("Approved", approvedOrders.length, CheckCircle, "hsl(142 70% 50%)"),
    statKey("Total Users", users.length, Users, "hsl(280 80% 65%)"),
    statKey("Revenue", `৳${totalRevenue.toLocaleString()}`, DollarSign, "hsl(45 95% 55%)"),
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-mesh" />
      <header
        style={{
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(16px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/")}
            className="ghost-btn"
            style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: "1.05rem" }}>Admin Console</h1>
            <span
              style={{
                fontSize: "0.65rem",
                color: "hsl(var(--gold))",
                letterSpacing: "0.15em",
                fontWeight: 700,
              }}
            >
              CONTROL CENTER
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchAll}
            className="ghost-btn"
            style={{ padding: "0.5rem 0.85rem", fontSize: "0.8rem" }}
          >
            <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("admin_auth");
              setAuthed(false);
            }}
            className="ghost-btn"
            style={{ padding: "0.5rem 0.85rem", fontSize: "0.8rem" }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {stats.map((s) => {
            const Icon = s.Icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${s.color}20`,
                    border: `1px solid ${s.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={s.color} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      color: "hsl(var(--text-muted))",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, marginTop: 2 }}>
                    {s.value}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("overview")}
            className={tab === "overview" ? "primary-btn" : "ghost-btn"}
            style={{ padding: "0.6rem 1rem", fontSize: "0.8rem" }}
          >
            <Inbox size={14} /> Pending Queue
            {pendingOrders.length > 0 && (
              <span
                style={{
                  background: "#1a1300",
                  color: "hsl(var(--gold-bright))",
                  borderRadius: 999,
                  padding: "1px 8px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  marginLeft: 4,
                }}
              >
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("orders")}
            className={tab === "orders" ? "primary-btn" : "ghost-btn"}
            style={{ padding: "0.6rem 1rem", fontSize: "0.8rem" }}
          >
            <ListOrdered size={14} /> All Orders ({orders.length})
          </button>
          <button
            onClick={() => setTab("users")}
            className={tab === "users" ? "primary-btn" : "ghost-btn"}
            style={{ padding: "0.6rem 1rem", fontSize: "0.8rem" }}
          >
            <Users size={14} /> Users ({users.length})
          </button>
          <button
            onClick={() => setTab("settings")}
            className={tab === "settings" ? "primary-btn" : "ghost-btn"}
            style={{ padding: "0.6rem 1rem", fontSize: "0.8rem" }}
          >
            <SettingsIcon size={14} /> Settings
          </button>
        </div>

        {(tab === "orders" || tab === "users") && (
          <div className="glass-card" style={{ padding: "0.75rem 1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Search size={16} style={{ color: "hsl(var(--gold))", opacity: 0.7 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  tab === "orders"
                    ? "Search by email, TrxID, sender number, plan..."
                    : "Search by email..."
                }
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.5rem 0",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
            <Loader2 className="spin" size={26} style={{ color: "hsl(var(--gold))" }} />
          </div>
        ) : tab === "overview" ? (
          <PendingQueue
            orders={pendingOrders}
            actioning={actioning}
            onApprove={approve}
            onReject={reject}
          />
        ) : tab === "orders" ? (
          <OrdersTable
            orders={filteredOrders}
            actioning={actioning}
            onApprove={approve}
            onReject={reject}
          />
        ) : tab === "users" ? (
          <UsersTable users={filteredUsers} onToggle={toggleSub} />
        ) : (
          <SettingsPanel />
        )}
      </div>
    </div>
  );
}

function PendingQueue({
  orders,
  actioning,
  onApprove,
  onReject,
}: {
  orders: Order[];
  actioning: number | null;
  onApprove: (o: Order) => void;
  onReject: (id: number) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div
          style={{
            width: 70,
            height: 70,
            margin: "0 auto 1.25rem",
            borderRadius: "50%",
            background: "hsla(142,70%,45%,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle size={32} style={{ color: "hsl(142 70% 50%)" }} />
        </div>
        <h3 style={{ marginBottom: 6 }}>All caught up</h3>
        <p className="subtitle">No pending orders awaiting verification.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <AnimatePresence mode="popLayout">
        {orders.map((o) => {
          const isBkash = o.paymentMethod === "bkash";
          const acting = actioning === o.id;
          return (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card"
              style={{
                padding: "1.5rem",
                borderLeft: "3px solid hsl(var(--gold))",
                background: "linear-gradient(135deg, hsla(45,95%,55%,0.04), transparent)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1.5rem",
                  alignItems: "start",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 12,
                    }}
                  >
                    <span className="badge badge-gold">
                      <Clock size={11} /> Pending
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "hsl(var(--text-muted))",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Calendar size={11} /> {timeAgo(o.createdAt)}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: isBkash
                          ? "rgba(255, 75, 145, 0.12)"
                          : "rgba(247, 147, 30, 0.12)",
                        color: isBkash ? "#ff4b91" : "#f7931e",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {o.paymentMethod}
                    </span>
                  </div>

                  <div style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 4 }}>
                    {o.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                    <span
                      className="gold-text"
                      style={{ fontSize: "1.6rem", fontWeight: 800 }}
                    >
                      ৳{o.price}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "hsl(var(--text-muted))",
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      {o.planTitle}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <InfoChip Icon={Smartphone} label="Sender" value={o.senderNumber} />
                    <InfoChip Icon={Hash} label="TrxID" value={o.trxId} mono />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 130 }}>
                  <button
                    onClick={() => onApprove(o)}
                    disabled={acting}
                    style={{
                      background: "linear-gradient(135deg, hsl(142 70% 50%), hsl(142 65% 38%))",
                      color: "white",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: 10,
                      cursor: acting ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      boxShadow: "0 4px 12px hsla(142,70%,45%,0.3)",
                    }}
                  >
                    {acting ? <Loader2 className="spin" size={14} /> : <CheckCircle size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(o.id)}
                    disabled={acting}
                    style={{
                      background: "transparent",
                      color: "hsl(0 84% 68%)",
                      border: "1px solid hsla(0,84%,60%,0.4)",
                      padding: "10px 14px",
                      borderRadius: 10,
                      cursor: acting ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function InfoChip({
  Icon,
  label,
  value,
  mono,
}: {
  Icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 12px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid var(--glass-border)",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: "0.6rem",
          color: "hsl(var(--text-muted))",
          letterSpacing: "0.12em",
          fontWeight: 700,
          marginBottom: 2,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Icon size={10} /> {label.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  actioning,
  onApprove,
  onReject,
}: {
  orders: Order[];
  actioning: number | null;
  onApprove: (o: Order) => void;
  onReject: (id: number) => void;
}) {
  return (
    <div className="glass-card scroll-area" style={{ padding: 0, overflow: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Method</th>
            <th>From</th>
            <th>TrxID</th>
            <th>Status</th>
            <th>When</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td style={{ fontWeight: 600 }}>{o.email}</td>
              <td>{o.planTitle}</td>
              <td className="gold-text" style={{ fontWeight: 700 }}>
                ৳{o.price}
              </td>
              <td style={{ textTransform: "capitalize" }}>{o.paymentMethod}</td>
              <td>{o.senderNumber}</td>
              <td style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8rem" }}>
                {o.trxId}
              </td>
              <td>
                <span
                  className={`badge ${
                    o.status === "approved"
                      ? "badge-success"
                      : o.status === "rejected"
                      ? "badge-error"
                      : "badge-gold"
                  }`}
                >
                  {o.status}
                </span>
              </td>
              <td style={{ color: "hsl(var(--text-muted))", fontSize: "0.8rem" }}>
                {timeAgo(o.createdAt)}
              </td>
              <td>
                {o.status === "pending" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => onApprove(o)}
                      disabled={actioning === o.id}
                      style={{
                        background: "hsla(142,70%,45%,0.15)",
                        border: "1px solid hsla(142,70%,45%,0.4)",
                        color: "hsl(142,70%,55%)",
                        padding: "6px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => onReject(o.id)}
                      disabled={actioning === o.id}
                      style={{
                        background: "hsla(0,84%,60%,0.12)",
                        border: "1px solid hsla(0,84%,60%,0.4)",
                        color: "hsl(0,84%,68%)",
                        padding: "6px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "hsl(var(--text-muted))" }}>
                No orders match your search
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function UsersTable({
  users,
  onToggle,
}: {
  users: UserRow[];
  onToggle: (email: string, active: boolean) => void;
}) {
  return (
    <div className="glass-card scroll-area" style={{ padding: 0, overflow: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Expires</th>
            <th>Joined</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ fontWeight: 600 }}>{u.id}</td>
              <td>{u.planTitle || "—"}</td>
              <td>
                <span className={`badge ${u.active ? "badge-success" : "badge-error"}`}>
                  {u.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>{u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : "—"}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => onToggle(u.id, Boolean(u.active))}
                  className="ghost-btn"
                  style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                >
                  {u.active ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "hsl(var(--text-muted))" }}>
                No users match your search
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SettingsPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (next !== confirm) return setError("New passwords don't match.");
    if (next.length < 4) return setError("New password must be at least 4 characters.");
    setLoading(true);
    try {
      const r = await api.post("/admin/change-password", {
        currentPassword: current,
        newPassword: next,
      });
      if (r.data?.success) {
        setSuccess("Admin password updated successfully.");
        setCurrent("");
        setNext("");
        setConfirm("");
      } else throw new Error(r.data?.error || "Failed");
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to update password.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.5rem" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "hsla(45,95%,55%,0.12)",
              border: "1px solid var(--gold-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <KeyRound size={18} style={{ color: "hsl(var(--gold))" }} />
          </div>
          <div>
            <h3>Change Admin Password</h3>
            <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.82rem", marginTop: 2 }}>
              Update the access code for the admin console.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="auth-form" style={{ marginTop: "1.5rem" }}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(255, 75, 75, 0.08)",
                border: "1px solid rgba(255, 75, 75, 0.3)",
                borderRadius: 10,
                color: "#ff7b7b",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "10px 14px",
                background: "hsla(142,70%,45%,0.1)",
                border: "1px solid hsla(142,70%,45%,0.4)",
                borderRadius: 10,
                color: "hsl(142 70% 60%)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle size={14} /> {success}
            </div>
          )}

          <div className="input-group">
            <label>Current password</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="input-group">
            <label>New password</label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="At least 4 characters"
              required
              minLength={4}
              autoComplete="new-password"
            />
          </div>
          <div className="input-group" style={{ marginBottom: "1.5rem" }}>
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              required
              minLength={4}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading} style={{ width: "100%" }}>
            {loading ? <Loader2 className="spin" size={16} /> : <Save size={14} />}
            Update password
          </button>
        </form>
      </div>

      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "hsla(280,80%,65%,0.12)",
              border: "1px solid hsla(280,80%,65%,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={18} style={{ color: "hsl(280 80% 70%)" }} />
          </div>
          <div>
            <h3>Plan Pricing</h3>
            <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.82rem", marginTop: 2 }}>
              Current published rates.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { name: "Monthly", price: 60, period: "/ month" },
            { name: "Yearly", price: 400, period: "/ year" },
            { name: "Lifetime", price: 2000, period: "one-time" },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.85rem 1rem",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid var(--glass-border)",
                borderRadius: 10,
              }}
            >
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div>
                <span className="gold-text" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                  ৳{p.price.toLocaleString()}
                </span>
                <span style={{ color: "hsl(var(--text-muted))", fontSize: "0.78rem", marginLeft: 6 }}>
                  {p.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
