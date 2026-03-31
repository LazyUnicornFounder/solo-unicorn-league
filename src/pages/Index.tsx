import { useEffect, useState } from "react";
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
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center pt-8 pb-1"
      >
        <Link to="/">
          <img src={logo} alt="Logo" className="w-28 h-28 lg:w-32 lg:h-32 opacity-90 hover:opacity-100 transition-opacity" />
        </Link>
      </motion.div>

      {/* Nav */}
      <nav className="flex items-center justify-center px-6 py-2 gap-1">
        <Link to="/about">
          <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">About</Button>
        </Link>
        {isAdmin && (
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Admin</Button>
          </Link>
        )}
        {user && (
          <>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Dashboard</Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground" onClick={signOut}>Sign Out</Button>
          </>
        )}
      </nav>

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
            The global leaderboard for solo founders racing to $1B. Submit your MRR, track your valuation in real time, and see exactly where you stand against solo founders worldwide.
          </p>
          <Link to="/join">
            <Button size="lg" className="text-sm px-10 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-full uppercase tracking-widest font-semibold">
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
            <span className="text-[10px] font-mono-display text-muted-foreground/60 tracking-wider">
              VAL = 15× ARR
            </span>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-6 py-2 border-b border-border/15">
            <div className="w-6 shrink-0 text-[10px] font-mono-display text-muted-foreground/50 uppercase">#</div>
            <div className="w-28 shrink-0 text-[10px] font-mono-display text-muted-foreground/50 uppercase tracking-wider">Company</div>
            <div className="flex-1 text-[10px] font-mono-display text-muted-foreground/50 uppercase tracking-wider">Progress</div>
            <div className="w-20 shrink-0 text-[10px] font-mono-display text-muted-foreground/50 uppercase tracking-wider text-right">ARR</div>
            <div className="w-20 shrink-0 text-[10px] font-mono-display text-muted-foreground/50 uppercase tracking-wider text-right">Val.</div>
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
                const pct = Math.min((valuation / 1_000_000_000) * 100, 100);

                return (
                  <TooltipProvider key={f.id} delayDuration={0}>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="flex items-center gap-4 px-6 py-2.5 border-b border-border/20 hover:bg-primary/[0.03] transition-all duration-200 group"
                    >
                      <span className="text-xs font-mono-display text-muted-foreground w-6 text-center shrink-0 tabular-nums group-hover:text-foreground transition-colors">
                        {i + 1}
                      </span>
                      <a
                        href={f.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground w-28 truncate shrink-0 hover:text-primary transition-colors"
                      >
                        {f.company_name ?? "Unnamed"}
                      </a>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1 h-5 bg-secondary/30 rounded-full relative overflow-hidden cursor-default">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(pct, 0.2)}%` }}
                              transition={{ duration: 1.2, delay: 0.4 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary bar-glow"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="font-mono-display text-[11px] bg-card border-border/50 rounded-lg px-3 py-2">
                          <div className="space-y-0.5">
                            <div className="text-primary font-medium">ARR: {fmtCurrency(arr)}</div>
                            <div className="text-muted-foreground">MRR: {fmtCurrency(mrrDollars)}/mo</div>
                            <div className="text-foreground">Valuation: {fmtCurrency(valuation)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-[11px] font-mono-display text-primary/80 w-20 text-right shrink-0 tabular-nums group-hover:text-primary transition-colors">
                        {fmtCurrency(arr)}
                      </span>
                      <span className="text-[11px] font-mono-display text-foreground/40 w-20 text-right shrink-0 tabular-nums group-hover:text-foreground/60 transition-colors">
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
                  <div className="flex justify-between mt-1.5">
                    {["$0", "$250M", "$500M", "$750M", "$1B"].map(label => (
                      <span key={label} className="text-[9px] font-mono-display text-muted-foreground/30">{label}</span>
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
