import { motion } from "framer-motion";
import { TrendingUp, Crown } from "lucide-react";

interface Founder {
  name: string;
  company: string;
  mrr: number;
  arr: number;
  valuation: number;
}

const MULTIPLIER = 15; // ARR multiplier for valuation

function getRankClass(i: number) {
  if (i === 0) return "text-rank-gold";
  if (i === 1) return "text-rank-silver";
  if (i === 2) return "text-rank-bronze";
  return "text-muted-foreground";
}

export default function Leaderboard({ founders }: { founders: Founder[] }) {
  const sorted = [...founders].sort((a, b) => b.arr - a.arr);

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-x-4 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground font-medium border-b border-border">
        <span>#</span>
        <span>Founder</span>
        <span className="text-right">MRR</span>
        <span className="text-right">ARR</span>
        <span className="text-right">Valuation</span>
      </div>
      {sorted.map((f, i) => (
        <motion.div
          key={f.company}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
          className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-x-4 px-4 py-3 items-center border-b border-border/50 hover:bg-secondary/50 transition-colors"
        >
          <span className={`font-mono-display font-bold text-sm ${getRankClass(i)}`}>
            {i === 0 ? <Crown className="w-4 h-4 text-rank-gold" /> : String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{f.company}</p>
            <p className="text-xs text-muted-foreground truncate">{f.name}</p>
          </div>
          <p className="text-right font-mono-display text-sm text-secondary-foreground">
            ${(f.mrr / 1e3).toFixed(0)}K
          </p>
          <p className="text-right font-mono-display text-sm font-semibold text-primary">
            ${(f.arr / 1e6).toFixed(1)}M
          </p>
          <p className="text-right font-mono-display text-sm text-muted-foreground">
            ${(f.valuation / 1e6).toFixed(0)}M
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export { MULTIPLIER };
