import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import logo from "@/assets/logo-new.png";

interface FounderRow {
  id: string;
  company_name: string | null;
  mrr_cents: number | null;
  is_visible: boolean | null;
  is_solo_attested: boolean | null;
  x_url: string | null;
  one_liner: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function Admin() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [founders, setFounders] = useState<FounderRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/", { replace: true });
  }, [user, loading, isAdmin, navigate]);

  const fetchFounders = () => {
    if (!isAdmin) return;
    supabase
      .from("founders")
      .select("id, company_name, mrr_cents, is_visible, is_solo_attested, x_url, one_liner, created_at, updated_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setFounders(data);
      });
  };

  useEffect(() => {
    fetchFounders();
  }, [isAdmin]);

  const setVisibility = async (id: string, visible: boolean) => {
    const { error } = await supabase.from("founders").update({ is_visible: visible }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setFounders((prev) => prev.map((f) => (f.id === id ? { ...f, is_visible: visible } : f)));
    toast({ title: visible ? "Approved" : "Hidden", description: `Entry has been ${visible ? "approved and is now live" : "hidden from the leaderboard"}.` });
  };

  const filtered = founders.filter((f) => {
    if (filter === "pending") return !f.is_visible;
    if (filter === "approved") return f.is_visible;
    return true;
  });

  const pendingCount = founders.filter((f) => !f.is_visible).length;

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <span className="font-bold text-lg tracking-tight text-foreground">Solo Unicorn League</span>
        </button>
        <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {founders.length} total · {pendingCount} pending review
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFounders}>Refresh</Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "approved"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-foreground text-background hover:bg-foreground/90" : ""}
            >
              {f === "all" ? "All" : f === "pending" ? `Pending (${pendingCount})` : "Approved"}
            </Button>
          ))}
        </div>

        {/* Entries */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">No entries found.</p>
          )}
          {filtered.map((f) => {
            const mrr = f.mrr_cents ?? 0;
            const arr = (mrr / 100) * 12;
            const val = arr * 15;

            return (
              <div
                key={f.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground truncate">
                      {f.company_name ?? "Unnamed"}
                    </span>
                    <Badge variant={f.is_visible ? "default" : "secondary"} className="text-[10px] shrink-0">
                      {f.is_visible ? "Live" : "Pending"}
                    </Badge>
                    {f.is_solo_attested && (
                      <Badge variant="outline" className="text-[10px] shrink-0">Solo</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono-display">MRR: {fmt(mrr)}</span>
                    <span className="font-mono-display">ARR: {fmt(arr * 100)}</span>
                    <span className="font-mono-display">Val: {fmt(val * 100)}</span>
                    {f.x_url && (
                      <a href={f.x_url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                        𝕏
                      </a>
                    )}
                    <span>
                      {f.created_at
                        ? formatDistanceToNow(new Date(f.created_at), { addSuffix: true })
                        : "—"}
                    </span>
                  </div>
                  {f.one_liner && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{f.one_liner}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4 shrink-0">
                  {f.is_visible ? (
                    <Button variant="outline" size="sm" onClick={() => setVisibility(f.id, false)}>
                      Hide
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-foreground text-background hover:bg-foreground/90"
                      onClick={() => setVisibility(f.id, true)}
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
