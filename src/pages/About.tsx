import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-new.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <span className="font-extrabold text-lg uppercase tracking-tight text-foreground">Solo Unicorn League</span>
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm" className="hover:bg-secondary">← Back</Button>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 py-12 lg:py-20">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-3xl lg:text-5xl font-bold text-foreground uppercase tracking-wide leading-tight">
            The Age of Autonomous Capitalism
          </h1>

          <div className="space-y-6 text-muted-foreground leading-relaxed text-sm lg:text-base">
            <p>
              It's easier than ever. One person can own and operate a billion-dollar company.
            </p>

            <p>
              The new playbook is one founder, many visions, infinite leverage.
            </p>


            <p>
              Solo Unicorn League is the global leaderboard for the race to a $1 billion valuation for a company started by a solo founder.
            </p>

            <p>
              The question is who will break the barrier first, and make everyone else a believer.
            </p>

            <p>
              The leaderboard is live. The race is on.
            </p>

            <p>
              Solo Unicorn League is part of{" "}
              <a href="https://lazyfactoryventures.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/70 transition-colors">Lazy Factory Ventures</a>.
            </p>
          </div>

          <div className="pt-4">
            <Link to="/join">
              <Button size="lg" className="text-base px-8 bg-foreground text-background hover:bg-foreground/90 font-extrabold uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Join the Leaderboard
              </Button>
            </Link>
          </div>
        </motion.article>
      </main>
    </div>
  );
}
