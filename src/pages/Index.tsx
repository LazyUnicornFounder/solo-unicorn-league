import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
          {user && (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
            </>
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
          <h1 className="text-3xl lg:text-5xl font-bold tracking-wide text-foreground mb-3 uppercase">
            Solo Unicorn League
          </h1>
          <p className="max-w-xl text-muted-foreground text-sm lg:text-base leading-relaxed mb-5 tracking-wide">
            The global leaderboard for solo founders racing to $1B. Submit your MRR, track your valuation in real time, and see exactly where you stand against solo founders worldwide. The race is live. Are you in it?
          </p>
          <Link to="/join">
            <Button size="lg" className="text-base px-8 bg-foreground text-background hover:bg-foreground/90">
              Join the Leaderboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Rankings & Chart */}
      <main className="max-w-5xl mx-auto w-full px-4 pb-16">
        {/* Rankings Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">
            Rankings
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 rounded bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              {/* Chart rows - combine DB founders + hardcoded entries */}
              <div className="space-y-2 mb-2">
                {(() => {
                  const hardcoded = [
                    { id: "hc-1", company_name: "Lazy Unicorn", mrr_cents: 0, url: "https://lazyunicorn.ai" },
                    { id: "hc-2", company_name: "Breaking Muse", mrr_cents: 0, url: "https://breakingmuse.ai" },
                    { id: "hc-3", company_name: "Polsia", mrr_cents: 50_000_000, url: "#" },
                  ];

                  // Merge DB founders with hardcoded, sort by mrr descending
                  const allEntries = [
                    ...founders.map(f => ({ ...f, url: f.x_url })),
                    ...hardcoded.filter(hc => !founders.some(f => f.company_name?.toLowerCase() === hc.company_name.toLowerCase())),
                  ].sort((a, b) => (b.mrr_cents ?? 0) - (a.mrr_cents ?? 0));

                  return allEntries.map((f, i) => {
                    const mrrDollars = (f.mrr_cents ?? 0) / 100;
                    const arr = mrrDollars * 12;
                    const valuation = arr * 15;
                    const pct = Math.min((valuation / 1_000_000_000) * 100, 100);

                    const fmtCurrency = (v: number) =>
                      v >= 1_000_000 ? "$" + (v / 1_000_000).toFixed(1) + "M"
                      : v >= 1_000 ? "$" + (v / 1_000).toFixed(0) + "K"
                      : "$" + v.toFixed(0);

                    const rankColor =
                      i === 0 ? "text-[hsl(var(--rank-gold))] border-[hsl(var(--rank-gold))]/30 bg-[hsl(var(--rank-gold))]/5" :
                      i === 1 ? "text-[hsl(var(--rank-silver))] border-[hsl(var(--rank-silver))]/30 bg-[hsl(var(--rank-silver))]/5" :
                      i === 2 ? "text-[hsl(var(--rank-bronze))] border-[hsl(var(--rank-bronze))]/30 bg-[hsl(var(--rank-bronze))]/5" :
                      "text-muted-foreground border-border bg-transparent";

                    const barColor =
                      i === 0 ? "bg-[hsl(var(--rank-gold))]" :
                      i === 1 ? "bg-[hsl(var(--rank-silver))]" :
                      i === 2 ? "bg-[hsl(var(--rank-bronze))]" :
                      "bg-foreground/70";

                    return (
                      <TooltipProvider key={f.id} delayDuration={0}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="flex items-center gap-3 group"
                        >
                          <span className={`text-xs font-mono-display w-7 text-center shrink-0 font-bold rounded-full py-0.5 border ${rankColor}`}>
                            {i + 1}
                          </span>
                          <a
                            href={f.url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <div className="w-9 h-9 rounded-full bg-foreground/5 border-2 border-border flex items-center justify-center text-xs font-bold text-foreground hover:border-foreground/40 hover:bg-foreground/10 transition-all">
                              {(f.company_name ?? "?").charAt(0).toUpperCase()}
                            </div>
                          </a>
                          <a
                            href={f.url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-foreground w-28 truncate shrink-0 hover:underline"
                          >
                            {f.company_name ?? "Unnamed"}
                          </a>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-1 h-8 bg-secondary/60 rounded-md relative overflow-hidden cursor-default border border-border/50">
                                {pct > 0 ? (
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(pct, 0.5)}%` }}
                                    transition={{ duration: 0.8, delay: 0.4 + i * 0.05, ease: "easeOut" }}
                                    className={`h-full rounded-md ${barColor} opacity-80`}
                                  />
                                ) : (
                                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-foreground/20 border border-foreground/10" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="font-mono-display text-xs">
                              <div className="space-y-0.5">
                                <div>MRR: {fmtCurrency(mrrDollars)}/mo</div>
                                <div>ARR: {fmtCurrency(arr)}</div>
                                <div>Valuation: {fmtCurrency(valuation)} (15× ARR)</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-xs font-mono-display text-muted-foreground w-20 text-right shrink-0 tabular-nums">
                            {fmtCurrency(valuation)}
                          </span>
                        </motion.div>
                      </TooltipProvider>
                    );
                  });
                })()}
              </div>

              {/* Axis */}
              <div className="flex items-center gap-3 mt-2">
                <div className="w-6 shrink-0" />
                <div className="w-8 shrink-0" />
                <div className="w-28 shrink-0" />
                <div className="flex-1 relative">
                  <div className="h-px bg-border" />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] font-mono-display text-muted-foreground">$0</span>
                    <span className="text-[10px] font-mono-display text-muted-foreground">$250M</span>
                    <span className="text-[10px] font-mono-display text-muted-foreground">$500M</span>
                    <span className="text-[10px] font-mono-display text-muted-foreground">$750M</span>
                    <span className="text-[10px] font-mono-display text-muted-foreground">$1B</span>
                  </div>
                </div>
                <div className="w-20 shrink-0" />
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
