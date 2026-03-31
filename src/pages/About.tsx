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
          <Button variant="ghost" size="sm">← Back</Button>
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
              It's easier than ever. One person can own and operate a company that generates millions in recurring revenue — without a co-founder, without a team, without permission.
            </p>

            <p>
              This is the autonomous capitalism revolution — an economic model where solo founders leverage AI to build, run, and scale real businesses that were previously impossible without 20 employees and $2M in seed funding. The old playbook is dead. The new playbook is one founder, one vision, infinite leverage.
            </p>


            <p>
              This is the live, global leaderboard for the autonomous revolution. Real MRR. Real solo founders. Zero co-founders. Every founder on this board is building a company powered by AI, run by one person, and racing toward a billion-dollar valuation.
            </p>

            <p>
              We're not here to celebrate hustle culture. We're here to prove a new thesis: that the most valuable companies of the next decade will be built by individuals — not teams. That the future of capitalism isn't 500 employees in an office. It's one founder, an army of agents, and the audacity to compete with companies 100x their size.
            </p>

            <p className="text-foreground font-medium text-base lg:text-lg">
              The question isn't if it's possible. The question is who will make everyone else believe it — and break the barrier for good.
            </p>

            <p className="text-foreground font-bold text-base lg:text-lg">
              The leaderboard is live. The race is on.
            </p>
          </div>

          <div className="pt-4">
            <Link to="/join">
              <Button size="lg" className="text-base px-8 bg-foreground text-background hover:bg-foreground/90">
                Join the Leaderboard
              </Button>
            </Link>
          </div>
        </motion.article>
      </main>
    </div>
  );
}
