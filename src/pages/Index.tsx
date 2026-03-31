import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import LeaderboardRow from "@/components/LeaderboardRow";
import logo from "@/assets/logo-new.png";

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top nav */}
      <header className="flex items-center justify-end px-6 lg:px-10 py-4">
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
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero section */}
      <section className="flex flex-col items-center justify-center px-6 py-6 lg:py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <img src={logo} alt="Solo Unicorn League" className="w-48 h-48 lg:w-64 lg:h-64 mb-4" />
          <h1 className="text-3xl lg:text-5xl font-bold tracking-wide text-foreground mb-3">
            Solo Unicorn League
          </h1>
          <p className="max-w-xl text-muted-foreground text-sm lg:text-base leading-relaxed mb-5 tracking-wide">
            The global leaderboard for solo founders racing to $1B. Submit your MRR, track your valuation in real time, and see exactly where you stand against solo founders worldwide. The race is live. Are you in it?
          </p>
          <Link to="/join">
            <Button size="lg" className="text-base px-8">
              Join the Leaderboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Leaderboard */}
      <main className="max-w-3xl mx-auto w-full px-4 pb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-bold text-foreground mb-4"
        >
          Leaderboard
        </motion.h2>

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
                transition={{ delay: 0.3 + i * 0.05 }}
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
