import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo-new.png";

function fmtCurrency(v: number) {
  if (v >= 1_000_000_000) return "$" + (v / 1_000_000_000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Billion";
  if (v >= 1_000_000) return "$" + (v / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Million";
  return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function Join() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"auth" | "company">("auth");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [mrrInput, setMrrInput] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const mrrDollars = Number(mrrInput || 0);
  const arr = mrrDollars * 12;
  const valuation = arr * 15;

  useEffect(() => {
    if (!loading && user) {
      // Check if they already have a founder profile
      supabase.from("founders").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data) {
          navigate("/dashboard", { replace: true });
        } else {
          setStep("company");
        }
      });
    }
  }, [user, loading, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/join`,
    });
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);
    try {
      let logoUrl: string | null = null;

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${user.id}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("founder-logos").upload(path, logoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from("founder-logos").getPublicUrl(path);
        logoUrl = publicUrl;
      }

      const { error } = await supabase.from("founders").insert({
        user_id: user.id,
        company_name: companyName,
        x_url: xUrl || companyUrl || null,
        one_liner: oneLiner || null,
        logo_url: logoUrl,
        mrr_cents: Math.round(mrrDollars * 100),
        is_visible: false,
        is_solo_attested: true,
      });
      if (error) throw error;
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src={logo} alt="Logo" className="w-10 h-10 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            {step === "auth"
              ? isSignUp ? "Join the Leaderboard" : "Welcome back"
              : "Add Your Company"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "auth"
              ? isSignUp ? "Sign up to add your company" : "Sign in to your account"
              : "Tell us about your startup"}
          </p>
        </div>

        {step === "auth" ? (
          <>
            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={submitting}>
                {submitting ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-foreground hover:underline font-medium">
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </>
        ) : (
          <form onSubmit={handleCompanySubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo</Label>
              <Input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyUrl">Website URL</Label>
              <Input
                id="companyUrl"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xUrl">X / Twitter URL</Label>
              <Input
                id="xUrl"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                placeholder="https://x.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oneliner">One-liner</Label>
              <Input
                id="oneliner"
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value.slice(0, 100))}
                placeholder="What does your company do?"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{oneLiner.length}/100</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrr">Current MRR ($)</Label>
              <Input
                id="mrr"
                type="number"
                min="0"
                step="1"
                value={mrrInput}
                onChange={(e) => setMrrInput(e.target.value)}
                required
                placeholder="e.g. 12000"
              />
            </div>

            {/* Live calculation preview */}
            {mrrDollars > 0 && (
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono-display">MRR</span>
                  <span className="text-sm font-mono-display text-foreground font-medium">{fmtCurrency(mrrDollars)}/mo</span>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono-display">ARR</span>
                  <span className="text-sm font-mono-display text-foreground font-bold">{fmtCurrency(arr)}</span>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono-display">Valuation (15× ARR)</span>
                  <span className="text-sm font-mono-display text-foreground font-bold">{fmtCurrency(valuation)}</span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-1">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/60 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((valuation / 1_000_000_000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-mono-display text-muted-foreground/50">$0</span>
                    <span className="text-[9px] font-mono-display text-muted-foreground/50">$1B</span>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={submitting || !companyName}>
              {submitting ? "Saving..." : "Go Live on Leaderboard"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
