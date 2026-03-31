import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-new.png";

interface FounderRow {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  x_url: string | null;
  one_liner: string | null;
  mrr_cents: number | null;
}

const fmtCurrency = (v: number) =>
  v >= 1_000_000 ? "$" + (v / 1_000_000).toFixed(1) + "M"
  : v >= 1_000 ? "$" + (v / 1_000).toFixed(0) + "K"
  : "$" + v.toFixed(0);

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

  const hardcoded = [
    { id: "hc-1", company_name: "Lazy Unicorn", mrr_cents: 0, url: "https://lazyunicorn.ai" },
    { id: "hc-2", company_name: "Breaking Muse", mrr_cents: 0, url: "https://breakingmuse.ai" },
  ];

  const allEntries = [
    ...founders.map(f => ({ ...f, url: f.x_url })),
    ...hardcoded.filter(hc => !founders.some(f => f.company_name?.toLowerCase() === hc.company_name.toLowerCase())),
  ].sort((a, b) => (b.mrr_cents ?? 0) - (a.mrr_cents ?? 0));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-end px-6 py-2 gap-1">
        {isAdmin && (
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent">Admin</Button>
          </Link>
        )}
        {user ? (
          <>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent">Dashboard</Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent" onClick={signOut}>Sign Out</Button>
          </>
        ) : (
          <Link to="/join">
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent">Sign In</Button>
          </Link>
        )}
        <a href="https://x.com/SaadSahawneh" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-transparent px-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </Button>
        </a>
        <Link to="/about">
          <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent">About</Button>
        </Link>
      </nav>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center pt-2 pb-1"
      >
        <Link to="/">
          <img src={logo} alt="Logo" className="w-40 h-40 lg:w-48 lg:h-48 opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_25px_hsl(145,72%,46%,0.15)]" />
        </Link>
      </motion.div>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-4 lg:py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-col items-center text-center"
        >
          <h1 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-3 uppercase tracking-tight">
            Solo Unicorn League
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm leading-relaxed mb-6">
            The leaderboard for solo founders racing to $1 billion. Submit your revenue, track your competitors, and race to the finish line.
          </p>
          <Link to="/join">
            <Button size="lg" className="text-base px-8 bg-foreground text-background hover:bg-foreground/90 font-extrabold uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Join the Leaderboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Rankings */}
      <main className="max-w-5xl mx-auto w-full px-4 pb-16 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">
              Rankings
            </h2>
            <span className="text-[10px] font-mono-display text-muted-foreground tracking-wider">
              VAL = 15× ARR
            </span>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-6 py-2 border-b border-border/15">
            <div className="w-6 shrink-0 text-xs font-mono-display text-foreground/50 uppercase">#</div>
            <div className="w-28 shrink-0 text-xs font-mono-display text-foreground/50 uppercase tracking-wider">Company</div>
            <div className="flex-1 text-xs font-mono-display text-foreground/50 uppercase tracking-wider">Progress</div>
            <div className="w-20 shrink-0 text-xs font-mono-display text-foreground/50 uppercase tracking-wider text-right">ARR</div>
            <div className="w-20 shrink-0 text-xs font-mono-display text-foreground/50 uppercase tracking-wider text-right">Val.</div>
          </div>

          {loading ? (
            <div className="px-6 py-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-secondary/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              {allEntries.map((f, i) => {
                const mrrDollars = (f.mrr_cents ?? 0) / 100;
                const arr = mrrDollars * 12;
                const valuation = arr * 15;
                const rawPct = Math.min((valuation / 1_000_000_000) * 100, 100);
                const pct = rawPct < 0.5 ? 1.5 : rawPct;

                return (
                  <TooltipProvider key={f.id} delayDuration={0}>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="flex items-center gap-4 px-6 py-3 border-b border-border/10 hover:bg-secondary/20 transition-all duration-200 group"
                    >
                      <span className="text-sm font-mono-display text-foreground/60 w-6 text-center shrink-0 tabular-nums group-hover:text-foreground transition-colors">
                        {i + 1}
                      </span>
                      <a
                        href={f.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground w-28 truncate shrink-0 hover:text-foreground/70 transition-colors"
                      >
                        {f.company_name ?? "Unnamed"}
                      </a>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1 h-5 bg-secondary/30 rounded-full relative overflow-hidden cursor-default">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1.2, delay: 0.4 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                              className="h-full rounded-full bg-gradient-to-r from-foreground/30 to-foreground/60"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="font-mono-display text-xs bg-card border-border/50 rounded-lg px-3 py-2">
                          <div className="space-y-0.5">
                            <div className="text-foreground font-medium">ARR: {fmtCurrency(arr)}</div>
                            <div className="text-foreground/70">MRR: {fmtCurrency(mrrDollars)}/mo</div>
                            <div className="text-foreground">Valuation: {fmtCurrency(valuation)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm font-mono-display text-foreground w-20 text-right shrink-0 tabular-nums font-medium">
                        {fmtCurrency(arr)}
                      </span>
                      <span className="text-sm font-mono-display text-foreground/70 w-20 text-right shrink-0 tabular-nums group-hover:text-foreground transition-colors">
                        {fmtCurrency(valuation)}
                      </span>
                    </motion.div>
                  </TooltipProvider>
                );
              })}

              {/* Axis */}
              <div className="flex items-center gap-4 px-6 py-3">
                <div className="w-6 shrink-0" />
                <div className="w-28 shrink-0" />
                <div className="flex-1 relative">
                  <div className="h-px bg-border/30" />
                  <div className="flex justify-between mt-2">
                    {["$0", "$250M", "$500M", "$750M", "$1B"].map(label => (
                      <span key={label} className="text-xs font-mono-display text-foreground/50 font-medium">{label}</span>
                    ))}
                  </div>
                </div>
                <div className="w-20 shrink-0" />
                <div className="w-20 shrink-0" />
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
