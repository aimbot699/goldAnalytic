import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  LayoutGrid,
  ListOrdered,
  Users,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
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

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(
    typeof window !== "undefined" && localStorage.getItem("admin_auth") === "true",
  );
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"orders" | "users">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (pass === "admin") {
      localStorage.setItem("admin_auth", "true");
      setAuthed(true);
    } else setError("Incorrect access code.");
  };

  const approve = async (o: Order) => {
    await api.post("/admin/approve-order", {
      orderId: o.id,
      email: o.email,
      planId: o.planId,
      planTitle: o.planTitle,
    });
    fetchAll();
  };

  const reject = async (id: number) => {
    await api.post("/admin/reject-order", { orderId: id });
    fetchAll();
  };

  const toggleSub = async (email: string, active: boolean) => {
    await api.post("/admin/toggle-sub", { email, active: !active });
    fetchAll();
  };

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
                />
              </div>
            </div>
            <button type="submit" className="primary-btn" style={{ width: "100%" }}>
              Access Console
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-mesh" />
      <header
        style={{
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "1px solid var(--glass-border)",
              padding: "0.5rem 0.85rem",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.85rem",
            }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: "1.05rem" }}>Admin Console</h1>
            <span style={{ fontSize: "0.65rem", color: "hsl(var(--gold))", letterSpacing: "0.15em", fontWeight: 700 }}>
              CONTROL CENTER
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("admin_auth");
            setAuthed(false);
          }}
          className="ghost-btn"
        >
          Sign Out
        </button>
      </header>

      <div className="container">
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
          <button
            onClick={() => setTab("orders")}
            className={tab === "orders" ? "primary-btn" : "ghost-btn"}
          >
            <ListOrdered size={15} /> Orders ({orders.filter((o) => o.status === "pending").length} pending)
          </button>
          <button
            onClick={() => setTab("users")}
            className={tab === "users" ? "primary-btn" : "ghost-btn"}
          >
            <Users size={15} /> Users ({users.length})
          </button>
        </div>

        {loading ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
            <Loader2 className="spin" size={26} style={{ color: "hsl(var(--gold))" }} />
          </div>
        ) : tab === "orders" ? (
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
                    <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
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
                    <td>
                      {o.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => approve(o)}
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
                            onClick={() => reject(o.id)}
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
                    <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "hsl(var(--text-muted))" }}>
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
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
                        onClick={() => toggleSub(u.id, Boolean(u.active))}
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
                      No users yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
