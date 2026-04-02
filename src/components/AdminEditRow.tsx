import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export interface FounderRow {
  id: string;
  company_name: string | null;
  mrr_cents: number | null;
  is_visible: boolean | null;
  is_solo_attested: boolean | null;
  x_url: string | null;
  website_url: string | null;
  one_liner: string | null;
  logo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtHuman(dollars: number) {
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)} billion`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)} million`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}k`;
  return `$${dollars.toFixed(0)}`;
}

interface Props {
  founder: FounderRow;
  onUpdate: (updated: FounderRow) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
}

export default function AdminEditRow({ founder: f, onUpdate, onToggleVisibility }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState(f.company_name ?? "");
  const [oneLiner, setOneLiner] = useState(f.one_liner ?? "");
  const [xUrl, setXUrl] = useState(f.x_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(f.website_url ?? "");
  const [arrInput, setArrInput] = useState(String(((f.mrr_cents ?? 0) / 100) * 12));

  const resetFields = () => {
    setCompanyName(f.company_name ?? "");
    setOneLiner(f.one_liner ?? "");
    setXUrl(f.x_url ?? "");
    setWebsiteUrl(f.website_url ?? "");
    setArrInput(String(((f.mrr_cents ?? 0) / 100) * 12));
  };

  const handleSave = async () => {
    setSaving(true);
    const arrDollars = Number(arrInput.replace(/,/g, "") || 0);
    const mrrCents = Math.round((arrDollars / 12) * 100);
    const updates = {
      company_name: companyName || null,
      one_liner: oneLiner || null,
      x_url: xUrl || null,
      website_url: websiteUrl || null,
      mrr_cents: mrrCents,
    };

    const { error } = await supabase.from("founders").update(updates).eq("id", f.id);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    onUpdate({ ...f, ...updates });
    setEditing(false);
    toast({ title: "Saved", description: "Entry updated." });
  };

  const mrr = f.mrr_cents ?? 0;
  const arr = (mrr / 100) * 12;
  const val = arr * 15;

  if (editing) {
    return (
      <div className="p-4 rounded-lg border border-primary/40 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Editing Entry</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { resetFields(); setEditing(false); }}
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90"
              onClick={handleSave}
              disabled={saving}
            >
              <Check className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor={`name-${f.id}`} className="text-xs">Company Name</Label>
            <Input id={`name-${f.id}`} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`arr-${f.id}`} className="text-xs">Valuation ($)</Label>
            <Input
              id={`arr-${f.id}`}
              type="text"
              inputMode="numeric"
              value={valuationInput}
              onChange={(e) => setValuationInput(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`oneliner-${f.id}`} className="text-xs">One-liner</Label>
            <Input id={`oneliner-${f.id}`} value={oneLiner} onChange={(e) => setOneLiner(e.target.value.slice(0, 100))} maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`xurl-${f.id}`} className="text-xs">X / Twitter URL</Label>
            <Input id={`xurl-${f.id}`} value={xUrl} onChange={(e) => setXUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`website-${f.id}`} className="text-xs">Website URL</Label>
            <Input id={`website-${f.id}`} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {f.logo_url ? (
            <img src={f.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-secondary shrink-0 flex items-center justify-center text-xs text-muted-foreground">—</div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{f.company_name ?? "Unnamed"}</span>
              <Badge variant={f.is_visible ? "default" : "secondary"} className="text-[10px] shrink-0">
                {f.is_visible ? "Live" : "Pending"}
              </Badge>
              {f.is_solo_attested && (
                <Badge variant="outline" className="text-[10px] shrink-0">Solo</Badge>
              )}
            </div>
            {f.one_liner && <p className="text-sm text-muted-foreground mt-0.5">{f.one_liner}</p>}
          </div>
        </div>
        <div className="flex gap-2 ml-4 shrink-0">
          <Button variant="outline" size="sm" onClick={() => { resetFields(); setEditing(true); }}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
          {f.is_visible ? (
            <Button variant="outline" size="sm" onClick={() => onToggleVisibility(f.id, false)}>Hide</Button>
          ) : (
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90" onClick={() => onToggleVisibility(f.id, true)}>
              Approve
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-mono-display">Valuation: {fmtHuman(val)}</span>
        {f.x_url && (
          <a href={f.x_url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">{f.x_url}</a>
        )}
        <span>
          {f.created_at ? formatDistanceToNow(new Date(f.created_at), { addSuffix: true }) : "—"}
        </span>
      </div>
    </div>
  );
}
