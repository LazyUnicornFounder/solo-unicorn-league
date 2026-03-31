import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import logo from "@/assets/logo-new.png";

interface FounderRow {
  id: string;
  company_name: string | null;
  mrr_cents: number | null;
  is_visible: boolean | null;
  created_at: string | null;
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Admin() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [founders, setFounders] = useState<FounderRow[]>([]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/", { replace: true });
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("founders").select("id, company_name, mrr_cents, is_visible, created_at").order("mrr_cents", { ascending: false }).then(({ data }) => {
      if (data) setFounders(data);
    });
  }, [isAdmin]);

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("founders").update({ is_visible: !current }).eq("id", id);
    setFounders((prev) => prev.map((f) => (f.id === id ? { ...f, is_visible: !current } : f)));
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-7 h-7" />
          <span className="font-bold text-lg tracking-tight text-foreground">Solo <span className="text-primary">Unicorn</span> League</span>
        </button>
        <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-6">Admin Panel</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Est. Valuation</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {founders.map((f) => {
              const mrr = f.mrr_cents ?? 0;
              const val = (mrr / 100) * 12 * 5;
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.company_name ?? "—"}</TableCell>
                  <TableCell className="font-mono-display">{fmt(mrr)}/mo</TableCell>
                  <TableCell className="font-mono-display">{fmt(val * 100)}</TableCell>
                  <TableCell>{f.is_visible ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{f.created_at ? formatDistanceToNow(new Date(f.created_at), { addSuffix: true }) : "—"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => toggleVisibility(f.id, !!f.is_visible)}>
                      {f.is_visible ? "Hide" : "Show"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
