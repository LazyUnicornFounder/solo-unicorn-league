import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import ARRChart from "@/components/ARRChart";
import Leaderboard from "@/components/Leaderboard";
import { founders } from "@/data/founders";
import logo from "@/assets/logo.png";

export default function Index() {
  const totalARR = founders.reduce((s, f) => s + f.arr, 0);

  return (
    <div className="min-h-screen h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logo} alt="World Solo Unicorn Championship logo" width={28} height={28} className="w-7 h-7" />
          <span className="font-bold text-lg tracking-tight text-foreground">
            World Solo <span className="text-primary">Unicorn</span> Championship
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-mono-display">
              ${(totalARR / 1e6).toFixed(1)}M
            </span>
            <span>combined ARR</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Chart side */}
        <div className="lg:w-1/2 flex flex-col justify-center px-6 lg:px-10 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-1">
              Founder <span className="text-primary text-glow">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Real-time ARR rankings · Valuation at 15× ARR multiple
            </p>
          </motion.div>
          <ARRChart founders={founders} />
        </div>

        {/* Leaderboard side */}
        <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
          <div className="px-6 lg:px-8 py-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Rankings
            </h2>
            <Leaderboard founders={founders} />
          </div>
        </div>
      </main>
    </div>
  );
}
