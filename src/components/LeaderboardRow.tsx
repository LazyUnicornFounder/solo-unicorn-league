import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Building2 } from "lucide-react";

interface Props {
  rank: number;
  companyName: string | null;
  logoUrl: string | null;
  xUrl: string | null;
  oneLiner: string | null;
  mrrCents: number;
}

function extractHandle(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:x\.com|twitter\.com)\/([^/?]+)/i);
  return match ? `@${match[1]}` : null;
}

function fmtMrr(cents: number) {
  return "$" + (cents / 100).toLocaleString("en-US") + "/mo";
}

function fmtVal(cents: number) {
  const val = (cents / 100) * 12 * 15;
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function LeaderboardRow({ rank, companyName, logoUrl, xUrl, oneLiner, mrrCents }: Props) {
  const handle = extractHandle(xUrl);
  const pct = Math.min((mrrCents / 100_000_000_00) * 100, 100);
  const pctLabel = pct < 0.01 ? "<0.01" : pct.toFixed(2);

  const rankColor =
    rank === 1 ? "text-[hsl(var(--rank-gold))]" :
    rank === 2 ? "text-[hsl(var(--rank-silver))]" :
    rank === 3 ? "text-[hsl(var(--rank-bronze))]" :
    "text-muted-foreground";

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
      <span className={`text-lg font-bold font-mono-display w-8 text-right shrink-0 ${rankColor}`}>
        #{rank}
      </span>

      <Avatar className="w-10 h-10 shrink-0 rounded-md border border-foreground/20 bg-foreground/10 p-[1px]">
        {logoUrl ? <AvatarImage className="rounded-[5px] object-contain" src={logoUrl} alt={companyName ?? ""} /> : null}
        <AvatarFallback className="bg-secondary">
          <Building2 className="w-5 h-5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground truncate">{companyName ?? "Unnamed"}</span>
          {handle && xUrl && (
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline shrink-0">
              {handle}
            </a>
          )}
        </div>
        {oneLiner && <p className="text-sm text-muted-foreground truncate">{oneLiner}</p>}

        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1">
            <Progress value={pct} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground font-mono-display shrink-0 whitespace-nowrap">
            {pctLabel}% to $1B
          </span>
        </div>
      </div>

      <div className="text-right shrink-0 hidden sm:block">
        <p className="font-mono-display font-bold text-primary">{fmtMrr(mrrCents)}</p>
        <p className="text-xs text-muted-foreground font-mono-display">{fmtVal(mrrCents)}</p>
      </div>
    </div>
  );
}
