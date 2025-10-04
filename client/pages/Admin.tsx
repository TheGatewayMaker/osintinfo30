import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { getDbInstance } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
  where,
  getDocs,
  limit as fblimit,
} from "firebase/firestore";
import type { UserProfile } from "@/lib/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminUser = UserProfile & { id: string };

export default function Admin() {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    const db = getDbInstance();
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AdminUser[];
      setUsers(arr);
    });
    return () => unsub();
  }, [profile?.role]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    let free = 0,
      purchased = 0,
      used = 0,
      remaining = 0;
    for (const u of users) {
      free += u.freeSearches ?? 0;
      purchased += u.purchasedSearches ?? 0;
      used += u.usedSearches ?? 0;
      remaining += u.totalSearchesRemaining ?? 0;
    }
    return { totalUsers, free, purchased, used, remaining };
  }, [users]);

  if (loading) {
    return (
      <Layout>
        <section className="container mx-auto py-12 text-center">
          <h1 className="text-3xl font-black">Loading…</h1>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="container mx-auto py-12 text-center">
          <h1 className="text-3xl font-black">Admins only</h1>
          <p className="mt-2 text-foreground/70">
            Sign in with an admin account.
          </p>
        </section>
      </Layout>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <Layout>
        <section className="container mx-auto py-12 text-center">
          <h1 className="text-3xl font-black">Access denied</h1>
          <p className="mt-2 text-foreground/70">
            Your account does not have admin privileges.
          </p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black">Admin Dashboard</h1>
          <p className="mt-2 text-foreground/70">
            Manage users and balances in real time.
          </p>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Free Searches" value={stats.free} />
          <StatCard title="Purchased" value={stats.purchased} />
          <StatCard title="Remaining" value={stats.remaining} />
        </div>

        <AssignByPurchaseId />

        <div className="mt-8 rounded-2xl border border-border bg-card/80 p-4 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur">
          <UsersTable users={users} />
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-5 text-center shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10">
      <div className="text-sm text-foreground/70">{title}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}

function AssignByPurchaseId() {
  const [purchaseId, setPurchaseId] = useState("");
  const [amount, setAmount] = useState<number>(10);
  const [action, setAction] = useState<"add" | "deduct" | "set">("add");
  const [found, setFound] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function lookup() {
    setStatus("");
    setFound(null);
    if (!purchaseId.trim()) return;
    try {
      setLoading(true);
      const db = getDbInstance();
      const q = query(
        collection(db, "users"),
        where("uniquePurchaseId", "==", purchaseId.trim()),
        fblimit(1),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        setFound({ id: d.id, ...(d.data() as any) } as UserProfile);
        setStatus("");
      } else {
        setStatus("No user found for this Purchase ID.");
      }
    } catch (e) {
      console.error(e);
      setStatus("Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    if (!found) return;
    setLoading(true);
    setStatus("");
    try {
      const db = getDbInstance();
      const ref = doc(db, "users", found.uid);
      if (action === "add") {
        const newRemaining = (found.totalSearchesRemaining ?? 0) + amount;
        await updateDoc(ref, {
          purchasedSearches: increment(amount),
          totalSearchesRemaining: newRemaining,
        });
        setStatus("Searches added.");
      } else if (action === "deduct") {
        const newRemaining = Math.max(
          0,
          (found.totalSearchesRemaining ?? 0) - amount,
        );
        await updateDoc(ref, {
          usedSearches: increment(amount),
          totalSearchesRemaining: newRemaining,
        });
        setStatus("Searches deducted.");
      } else if (action === "set") {
        const current = found.totalSearchesRemaining ?? 0;
        const delta = amount - current;
        if (delta > 0) {
          await updateDoc(ref, {
            purchasedSearches: increment(delta),
            totalSearchesRemaining: amount,
          });
        } else if (delta < 0) {
          await updateDoc(ref, {
            usedSearches: increment(-delta),
            totalSearchesRemaining: amount,
          });
        } else {
          // equal, nothing to change
        }
        setStatus("Search limit set.");
      }
      await lookup();
    } catch (e) {
      console.error(e);
      setStatus("Update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card/80 p-4 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur">
      <h2 className="text-lg font-bold">Assign by Unique Purchase ID</h2>
      <p className="text-sm text-foreground/70 mt-1">
        Enter a user's Unique Purchase ID to add, deduct, or set their search
        limit.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="text-sm">Purchase ID</label>
          <Input
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={purchaseId}
            onChange={(e) => setPurchaseId(e.target.value)}
            onBlur={lookup}
          />
        </div>
        <div>
          <label className="text-sm">Action</label>
          <Select value={action} onValueChange={(v) => setAction(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">Add</SelectItem>
              <SelectItem value="deduct">Deduct</SelectItem>
              <SelectItem value="set">Set Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Amount</label>
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={apply}
            disabled={loading || !found}
            className="w-full"
          >
            {loading ? "Working..." : "Apply"}
          </Button>
        </div>
      </div>

      {status && <p className="mt-3 text-sm text-foreground/70">{status}</p>}

      {found && (
        <div className="mt-4 grid gap-2 text-sm">
          <div className="font-medium">Matched User</div>
          <div className="grid md:grid-cols-5 gap-2">
            <div>
              <div className="text-foreground/60">Name</div>
              <div>{found.name ?? "-"}</div>
            </div>
            <div>
              <div className="text-foreground/60">Email</div>
              <div>{found.email ?? "-"}</div>
            </div>
            <div>
              <div className="text-foreground/60">Purchase ID</div>
              <div className="font-mono text-xs break-all">
                {found.uniquePurchaseId}
              </div>
            </div>
            <div>
              <div className="text-foreground/60">Purchased</div>
              <div>{found.purchasedSearches ?? 0}</div>
            </div>
            <div>
              <div className="text-foreground/60">Remaining</div>
              <div className="font-bold">
                {found.totalSearchesRemaining ?? 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTable({ users }: { users: UserProfile[] }) {
  const [target, setTarget] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<"add" | "deduct" | "resetFree" | null>(null);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Free</TableHead>
            <TableHead>Purchased</TableHead>
            <TableHead>Used</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.uid}>
              <TableCell className="font-semibold">{u.name ?? "-"}</TableCell>
              <TableCell>{u.email ?? "-"}</TableCell>
              <TableCell>{u.freeSearches ?? 0}</TableCell>
              <TableCell>{u.purchasedSearches ?? 0}</TableCell>
              <TableCell>{u.usedSearches ?? 0}</TableCell>
              <TableCell className="font-bold">
                {u.totalSearchesRemaining ?? 0}
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setTarget(u);
                    setMode("add");
                  }}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setTarget(u);
                    setMode("deduct");
                  }}
                >
                  Deduct
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTarget(u);
                    setMode("resetFree");
                  }}
                >
                  Reset Free
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AdjustModal
        user={target}
        mode={mode}
        onClose={() => {
          setTarget(null);
          setMode(null);
        }}
      />
    </div>
  );
}

function AdjustModal({
  user,
  mode,
  onClose,
}: {
  user: UserProfile | null;
  mode: "add" | "deduct" | "resetFree" | null;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!user || !mode) return null;

  async function apply() {
    setLoading(true);
    try {
      const db = getDbInstance();
      const ref = doc(db, "users", user.uid);
      if (mode === "add") {
        const newRemaining = (user.totalSearchesRemaining ?? 0) + amount;
        await updateDoc(ref, {
          purchasedSearches: increment(amount),
          totalSearchesRemaining: newRemaining,
        });
      } else if (mode === "deduct") {
        const newRemaining = Math.max(
          0,
          (user.totalSearchesRemaining ?? 0) - amount,
        );
        await updateDoc(ref, {
          usedSearches: increment(amount),
          totalSearchesRemaining: newRemaining,
        });
      } else if (mode === "resetFree") {
        const delta = 2 - (user.freeSearches ?? 0);
        const newRemaining = (user.totalSearchesRemaining ?? 0) + delta;
        await updateDoc(ref, {
          freeSearches: 2,
          totalSearchesRemaining: newRemaining,
        });
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-black">
            {mode === "add" && "Add searches"}
            {mode === "deduct" && "Deduct searches"}
            {mode === "resetFree" && "Reset free to 2"}
          </DialogTitle>
        </DialogHeader>
        {mode !== "resetFree" && (
          <div className="grid gap-2">
            <label className="text-sm">Amount</label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={loading}>
            {loading ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
