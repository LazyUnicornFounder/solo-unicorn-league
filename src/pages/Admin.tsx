import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo-new.png";
import AdminEditRow, { FounderRow } from "@/components/AdminEditRow";

export default function Admin() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [founders, setFounders] = useState<FounderRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/", { replace: true });
  }, [user, loading, isAdmin, navigate]);

  const fetchFounders = () => {
    if (!isAdmin) return;
    supabase
      .from("founders")
      .select("id, company_name, mrr_cents, is_visible, is_solo_attested, x_url, website_url, one_liner, logo_url, created_at, updated_at")
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

  const handleUpdate = (updated: FounderRow) => {
    setFounders((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
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
          {filtered.map((f) => (
            <AdminEditRow
              key={f.id}
              founder={f}
              onUpdate={handleUpdate}
              onToggleVisibility={setVisibility}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
