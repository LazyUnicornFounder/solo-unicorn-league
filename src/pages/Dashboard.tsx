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
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [mrrDollars, setMrrDollars] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [isSoloAttested, setIsSoloAttested] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/join", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("founders").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setHasExisting(true);
        setCompanyName(data.company_name ?? "");
        setMrrDollars(data.mrr_cents ? String(data.mrr_cents / 100) : "");
        setXUrl(data.x_url ?? "");
        setOneLiner(data.one_liner ?? "");
        setIsSoloAttested(data.is_solo_attested ?? false);
        setExistingLogoUrl(data.logo_url);
      }
    });
  }, [user]);

  const mrrCents = Math.round(Number(mrrDollars || 0) * 100);
  const arrCents = mrrCents * 12;
  const valuation = arrCents * 15;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let logoUrl = existingLogoUrl;

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${user.id}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("founder-logos").upload(path, logoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from("founder-logos").getPublicUrl(path);
        logoUrl = publicUrl;
      }

      const row = {
        user_id: user.id,
        company_name: companyName,
        mrr_cents: mrrCents,
        x_url: xUrl || null,
        one_liner: oneLiner || null,
        logo_url: logoUrl,
        is_solo_attested: isSoloAttested,
        is_visible: hasExisting ? undefined : false,
      };

      if (hasExisting) {
        const { error } = await supabase.from("founders").update(row).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("founders").insert(row);
        if (error) throw error;
      }

      toast({ title: "Submitted!", description: "Your submission is under review." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
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

      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-1">Your Profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Update your MRR and company info.</p>

        {hasExisting && mrrCents > 0 && (
          <div className="flex gap-6 mb-8 p-4 rounded-lg bg-card border border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">MRR</p>
              <p className="text-xl font-bold font-mono-display text-foreground">{formatDollars(mrrCents)}/mo</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Valuation</p>
              <p className="text-xl font-bold font-mono-display text-foreground">{formatDollars(valuation)}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mrr">Current MRR ($)</Label>
            <Input id="mrr" type="number" min="0" step="1" value={mrrDollars} onChange={(e) => setMrrDollars(e.target.value)} placeholder="e.g. 12000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            {existingLogoUrl && <img src={existingLogoUrl} alt="Current logo" className="w-12 h-12 rounded-lg object-cover" />}
            <Input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="x">X / Twitter URL</Label>
            <Input id="x" value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="https://x.com/yourhandle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oneliner">One-liner</Label>
            <Input id="oneliner" value={oneLiner} onChange={(e) => setOneLiner(e.target.value.slice(0, 100))} placeholder="What does your company do?" maxLength={100} />
            <p className="text-xs text-muted-foreground">{oneLiner.length}/100</p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="solo" checked={isSoloAttested} onCheckedChange={(v) => setIsSoloAttested(!!v)} />
            <Label htmlFor="solo" className="text-sm">I confirm I am the sole founder of this company</Label>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Go Live on Leaderboard"}
          </Button>
        </form>
      </main>
    </div>
  );
}
