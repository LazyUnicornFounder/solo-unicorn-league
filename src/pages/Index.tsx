import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import LeaderboardRow from "@/components/LeaderboardRow";
import logo from "@/assets/logo.png";

interface FounderRow {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  x_url: string | null;
  one_liner: string | null;
  mrr_cents: number | null;
}

export default function Index() {
  const { user, isAdmin, signOut } = useAuth();
  const [founders, setFounders] = useState<FounderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("founders")
      .select("id, company_name, logo_url, x_url, one_liner, mrr_cents")
      .eq("is_visible", true)
      .order("mrr_cents", { ascending: false })
      .then(({ data }) => {
        setFounders(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-7 h-7" />
          <span className="font-bold text-lg tracking-tight text-foreground">
            Solo <span className="text-primary">Unicorn</span> League
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">Admin</Button>
            </Link>
          )}
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <Link to="/join">
              <Button size="sm">Join the Leaderboard</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-1">
            Solo Unicorn <span className="text-primary text-glow">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-2">
            Self-reported MRR from real solo founders. Join to add yourself.
          </p>
          {!user && (
            <Link to="/join">
              <Button size="sm" className="mb-6">Join the Leaderboard</Button>
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : founders.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No founders yet. Be the first to join!</p>
        ) : (
          <div className="space-y-3">
            {founders.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <LeaderboardRow
                  rank={i + 1}
                  companyName={f.company_name}
                  logoUrl={f.logo_url}
                  xUrl={f.x_url}
                  oneLiner={f.one_liner}
                  mrrCents={f.mrr_cents ?? 0}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
