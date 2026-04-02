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
  website_url: string | null;
  one_liner: string | null;
  mrr_cents: number | null;
}

const fmtCurrency = (v: number) =>
  v >= 1_000_000_000 ? "$" + (v / 1_000_000_000).toFixed(1) + " billion"
  : v >= 1_000_000 ? "$" + (v / 1_000_000).toFixed(1) + " million"
  : v >= 1_000 ? "$" + (v / 1_000).toFixed(0) + "K"
  : "$" + v.toFixed(0);

export default function Index() {
  const { user, isAdmin, signOut } = useAuth();
  const [founders, setFounders] = useState<FounderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("founders")
      .select("id, company_name, logo_url, x_url, website_url, one_liner, mrr_cents")
      .eq("is_visible", true)
      .order("mrr_cents", { ascending: false })
      .then(({ data }) => {
        setFounders(data ?? []);
        setLoading(false);
      });
  }, []);

  const hardcoded = [
    { id: "hc-1", company_name: "Lazy Unicorn", mrr_cents: 0, url: "https://lazyunicorn.ai", logo_url: null as string | null, one_liner: null as string | null },
    { id: "hc-2", company_name: "Breaking Muse", mrr_cents: 0, url: "https://breakingmuse.ai", logo_url: null as string | null, one_liner: null as string | null },
  ];

  const allEntries = [
    ...founders.map(f => ({ ...f, url: f.website_url || f.x_url, x_url: f.x_url })),
    ...hardcoded.filter(hc => !founders.some(f => f.company_name?.toLowerCase() === hc.company_name.toLowerCase())).map(hc => ({ ...hc, x_url: null as string | null })),
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
        <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer">
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
        className="flex justify-center pt-0 pb-0"
      >
        <Link to="/">
          <img src={logo} alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_25px_hsl(145,72%,46%,0.15)]" />
        </Link>
      </motion.div>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-2 lg:py-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-col items-center text-center"
        >
          <h1 className="text-6xl lg:text-8xl font-extrabold text-foreground mb-3 uppercase tracking-tight" style={{ fontFamily: "'Abel', sans-serif" }}>
            Solo Unicorn League
          </h1>
          <p className="max-w-2xl text-muted-foreground text-xl lg:text-2xl leading-relaxed mb-6">
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
      <main className="max-w-7xl mx-auto w-full px-2 lg:px-4 pb-16 mt-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center gap-4 lg:gap-6 px-3 lg:px-6 py-4 border-b border-border/20">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">
              Rankings
            </h2>
            <div className="flex-1" />
            <span className="text-[10px] font-mono-display text-muted-foreground tracking-wider">
              VAL = 15× ARR
            </span>
          </div>

          {/* Column headers - hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6 px-6 py-3 border-b border-border/15">
            <div className="w-10 shrink-0 flex justify-center text-lg font-mono-display text-foreground/50 uppercase">#</div>
            <div className="w-8 shrink-0" />
            <div className="w-80 shrink-0 text-lg font-mono-display text-foreground/50 uppercase tracking-wider">Company</div>
            <div className="flex-1 text-lg font-mono-display text-foreground/50 uppercase tracking-wider">Progress</div>
            <div className="w-28 shrink-0 text-lg font-mono-display text-foreground/50 uppercase tracking-wider text-right">ARR</div>
            <div className="w-28 shrink-0 text-lg font-mono-display text-foreground/50 uppercase tracking-wider text-right">Val.</div>
          </div>

          {loading ? (
            <div className="px-3 lg:px-6 py-4 space-y-2">
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
                      className="border-b border-border/10 hover:bg-secondary/20 transition-all duration-200 group"
                    >
                      {/* Desktop row */}
                      <div className="hidden lg:flex items-center gap-6 px-6 py-5">
                        <span className="text-2xl font-mono-display text-foreground/60 w-10 text-center shrink-0 tabular-nums group-hover:text-foreground transition-colors">
                          {i + 1}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {f.logo_url ? (
                              <a href={f.url ?? "#"} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                <img src={f.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover hover:opacity-75 transition-opacity shadow-[0_0_0_2px_white]" />
                              </a>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-secondary/50 shrink-0" />
                            )}
                          </TooltipTrigger>
                          {f.one_liner && (
                            <TooltipContent side="top" className="font-mono-display text-sm bg-card border-border/50 rounded-lg px-3 py-2">
                              {f.one_liner}
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={f.url ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xl font-medium text-foreground w-80 min-w-80 shrink-0 whitespace-nowrap overflow-hidden text-ellipsis hover:text-foreground/70 transition-colors"
                            >
                              {f.company_name ?? "Unnamed"}
                            </a>
                          </TooltipTrigger>
                          {f.one_liner && (
                            <TooltipContent side="top" className="font-mono-display text-sm bg-card border-border/50 rounded-lg px-3 py-2">
                              {f.one_liner}
                            </TooltipContent>
                          )}
                        </Tooltip>
                        {f.x_url && (
                          <a href={f.x_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors -ml-4">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1 h-8 bg-secondary/30 rounded-full relative overflow-hidden cursor-default">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1.2, delay: 0.4 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="h-full rounded-full bg-gradient-to-r from-foreground/30 to-foreground/60"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="font-mono-display text-base bg-card border-border/50 rounded-lg px-3 py-2">
                            <div className="space-y-0.5">
                              <div className="text-foreground font-medium">ARR: {fmtCurrency(arr)}</div>
                              <div className="text-foreground/70">MRR: {fmtCurrency(mrrDollars)}/mo</div>
                              <div className="text-foreground">Valuation: {fmtCurrency(valuation)}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-2xl font-mono-display text-foreground w-28 text-right shrink-0 tabular-nums font-medium">
                          {fmtCurrency(arr)}
                        </span>
                        <span className="text-2xl font-mono-display text-foreground/70 w-28 text-right shrink-0 tabular-nums group-hover:text-foreground transition-colors">
                          {fmtCurrency(valuation)}
                        </span>
                      </div>

                      {/* Mobile row */}
                      <div className="flex lg:hidden flex-col gap-2 px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-mono-display text-foreground/60 w-7 text-center shrink-0 tabular-nums">
                            {i + 1}
                          </span>
                          {f.logo_url ? (
                            <a href={f.url ?? "#"} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              <img src={f.logo_url} alt="" className="w-7 h-7 rounded-md object-cover shadow-[0_0_0_1px_white]" />
                            </a>
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-secondary/50 shrink-0" />
                          )}
                          <a
                            href={f.url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium text-foreground truncate hover:text-foreground/70 transition-colors flex-1"
                          >
                            {f.company_name ?? "Unnamed"}
                          </a>
                          {f.x_url && (
                            <a href={f.x_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-3 pl-10">
                          <div className="flex-1 h-5 bg-secondary/30 rounded-full relative overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1.2, delay: 0.4 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                              className="h-full rounded-full bg-gradient-to-r from-foreground/30 to-foreground/60"
                            />
                          </div>
                          <span className="text-sm font-mono-display text-foreground tabular-nums font-medium shrink-0">
                            {fmtCurrency(arr)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </TooltipProvider>
                );
              })}

              {/* Axis - desktop only */}
              <div className="hidden lg:flex items-center gap-6 px-6 py-3">
                <div className="w-10 shrink-0" />
                <div className="w-8 shrink-0" />
                <div className="w-64 shrink-0" />
                <div className="flex-1 relative">
                  <div className="h-px bg-border/30" />
                  <div className="flex justify-between mt-2">
                    {["$0", "$250M", "$500M", "$750M", "$1B"].map(label => (
                      <span key={label} className="text-base font-mono-display text-foreground/50 font-medium">{label}</span>
                    ))}
                  </div>
                </div>
                <div className="w-28 shrink-0" />
                <div className="w-28 shrink-0" />
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
