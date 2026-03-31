import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface Founder {
  name: string;
  company: string;
  mrr: number;
  arr: number;
  valuation: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
      <p className="font-semibold text-foreground">{d.company}</p>
      <p className="text-muted-foreground text-sm">{d.name}</p>
      <p className="font-mono-display text-primary mt-1">
        ARR ${(d.arr / 1e6).toFixed(1)}M
      </p>
      <p className="font-mono-display text-muted-foreground text-sm">
        Valuation ~${(d.valuation / 1e6).toFixed(0)}M
      </p>
    </div>
  );
};

export default function ARRChart({ founders }: { founders: Founder[] }) {
  const sorted = [...founders].sort((a, b) => b.arr - a.arr).slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-full h-[320px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis
            dataKey="company"
            tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220, 14%, 12%)" }} />
          <Bar dataKey="arr" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {sorted.map((_, i) => (
              <Cell
                key={i}
                fill={i === 0 ? "hsl(145, 80%, 52%)" : i < 3 ? "hsl(145, 60%, 40%)" : "hsl(145, 40%, 28%)"}
                className="bar-glow"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
