import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo-new.png";

function formatDollars(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return "$" + (dollars / 1_000_000_000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Billion";
  if (dollars >= 1_000_000) return "$" + (dollars / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Million";
  return "$" + dollars.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

interface FounderEntry {
  id: string;
  company_name: string;
  mrr_cents: number;
  x_url: string;
  website_url: string;
  one_liner: string;
  is_solo_attested: boolean;
  logo_url: string | null;
  is_visible: boolean | null;
}

interface EditState {
  companyName: string;
  mrrDollars: string;
  xUrl: string;
  oneLiner: string;
  isSoloAttested: boolean;
  logoFile: File | null;
  existingLogoUrl: string | null;
}

function entryToEditState(entry: FounderEntry): EditState {
  return {
    companyName: entry.company_name ?? "",
    mrrDollars: entry.mrr_cents ? String(entry.mrr_cents / 100) : "",
    xUrl: entry.x_url ?? "",
    oneLiner: entry.one_liner ?? "",
    isSoloAttested: entry.is_solo_attested ?? false,
    logoFile: null,
    existingLogoUrl: entry.logo_url,
  };
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<FounderEntry[]>([]);
  const [editStates, setEditStates] = useState<Record<string, EditState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (!loading && !user) navigate("/join", { replace: true });
  }, [user, loading, navigate]);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    supabase.from("founders").select("*").eq("user_id", userId).then(({ data }) => {
      if (data && data.length > 0) {
        const mapped = data as FounderEntry[];
        setEntries(mapped);
        const states: Record<string, EditState> = {};
        mapped.forEach((e) => { states[e.id] = entryToEditState(e); });
        setEditStates(states);
      }
    });
  }, [userId]);

  const updateField = (id: string, field: keyof EditState, value: any) => {
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (entryId: string) => {
    if (!user) return;
    const state = editStates[entryId];
    if (!state) return;
    setSavingId(entryId);

    try {
      const mrrCents = Math.round(Number(String(state.mrrDollars).replace(/,/g, "") || 0) * 100);
      let logoUrl = state.existingLogoUrl;

      if (state.logoFile) {
        const ext = state.logoFile.name.split(".").pop();
        const path = `${user.id}/${entryId}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("founder-logos").upload(path, state.logoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from("founder-logos").getPublicUrl(path);
        logoUrl = publicUrl;
      }

      const { error } = await supabase.from("founders").update({
        company_name: state.companyName,
        mrr_cents: mrrCents,
        x_url: state.xUrl || null,
        one_liner: state.oneLiner || null,
        logo_url: logoUrl,
        is_solo_attested: state.isSoloAttested,
      }).eq("id", entryId);
      if (error) throw error;

      toast({ title: "Saved!", description: `${state.companyName} updated.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <span className="font-bold text-lg tracking-tight text-foreground">Solo Unicorn League</span>
        </button>
        <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-1">Your Products</h1>
        <p className="text-sm text-muted-foreground mb-8">Manage details for each of your companies.</p>

        {entries.length === 0 && (
          <p className="text-muted-foreground">No entries found.</p>
        )}

        <div className="space-y-10">
          {entries.map((entry) => {
            const state = editStates[entry.id];
            if (!state) return null;
            const mrrCents = Math.round(Number(String(state.mrrDollars).replace(/,/g, "") || 0) * 100);
            const displayMrr = state.mrrDollars ? Number(String(state.mrrDollars).replace(/,/g, "")).toLocaleString("en-US") : "";
            const arrCents = mrrCents * 12;
            const valuation = arrCents * 15;
            const isSaving = savingId === entry.id;

            return (
              <div key={entry.id} className="p-6 rounded-xl border border-border bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">{state.companyName || "Untitled"}</h2>

                {mrrCents > 0 && (
                  <div className="flex gap-6 mb-6 p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">MRR</p>
                      <p className="text-lg font-bold text-foreground">{formatDollars(mrrCents)}/mo</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Valuation</p>
                      <p className="text-lg font-bold text-foreground">{formatDollars(valuation)}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleSave(entry.id); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current MRR ($)</Label>
                    <Input type="text" inputMode="numeric" value={displayMrr} onChange={(e) => updateField(entry.id, "mrrDollars", e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 12,000" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={state.companyName} onChange={(e) => updateField(entry.id, "companyName", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    {state.existingLogoUrl && <img src={state.existingLogoUrl} alt="Current logo" className="w-12 h-12 rounded-lg object-cover" />}
                    <Input type="file" accept="image/*" onChange={(e) => updateField(entry.id, "logoFile", e.target.files?.[0] ?? null)} />
                  </div>
                  <div className="space-y-2">
                    <Label>X / Twitter URL</Label>
                    <Input value={state.xUrl} onChange={(e) => updateField(entry.id, "xUrl", e.target.value)} placeholder="https://x.com/yourhandle" />
                  </div>
                  <div className="space-y-2">
                    <Label>One-liner</Label>
                    <Input value={state.oneLiner} onChange={(e) => updateField(entry.id, "oneLiner", e.target.value.slice(0, 100))} placeholder="What does your company do?" maxLength={100} />
                    <p className="text-xs text-muted-foreground">{state.oneLiner.length}/100</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={state.isSoloAttested} onCheckedChange={(v) => updateField(entry.id, "isSoloAttested", !!v)} />
                    <Label className="text-sm">I confirm I am the sole founder of this company</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}