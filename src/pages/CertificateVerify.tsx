import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp, Certificate } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, ArrowLeft, Search, CheckCircle2, XCircle, Shield } from "lucide-react";

const CertificateVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { findCertificate } = useApp();
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState<{ valid: boolean; cert?: Certificate } | null>(null);
  const [shaking, setShaking] = useState(false);

  const handleVerify = (idToVerify?: string) => {
    setResult(null);
    const id = idToVerify || certId;
    if (!id.trim()) return;
    const cert = findCertificate(id.trim().toUpperCase());
    if (!cert) {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
    setResult(cert ? { valid: true, cert } : { valid: false });
  };

  useEffect(() => {
    const urlCertId = searchParams.get("certId");
    if (urlCertId) {
      setCertId(urlCertId);
      // Wait a tiny bit for context to hydrate if needed, though usually immediate
      setTimeout(() => handleVerify(urlCertId), 100);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-blue-600/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-500/7 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 border-b border-border/40 glass-strong sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-blue-500/20 blur-sm group-hover:bg-blue-500/30 transition-all" />
              <Award className="relative w-6 h-6 text-blue-400" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">DigiCertify</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" />
            Home
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-16 animate-fade-in">
        {/* Verify card */}
        <div className="rounded-2xl glass-strong border-glow shadow-elevated p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-teal-500/30 blur-lg animate-glow-pulse" />
              <div className="relative rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 p-4">
                <Shield className="w-9 h-9 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold font-display text-foreground mb-1">
            Verify Certificate
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            Enter the Certificate ID to check authenticity
          </p>

          <div className="flex gap-2">
            <Input
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. DC-A1B2C3D4"
              className="text-center font-mono bg-white/5 border-white/10 h-11 transition-all duration-300 focus:border-teal-500/60 focus:ring-0 focus:shadow-[0_0_0_2px_hsl(173_80%_40%/0.15),0_0_16px_hsl(173_80%_40%/0.2)]"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <Button
              onClick={() => handleVerify()}
              className="h-11 px-4 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 border-0 shadow-[0_0_15px_hsl(173_80%_40%/0.3)] hover:shadow-[0_0_25px_hsl(173_80%_40%/0.5)] transition-all duration-300 hover:scale-[1.03]"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`mt-5 rounded-2xl p-6 border animate-fade-in-scale ${result.valid
              ? "bg-green-500/8 border-green-500/25 shadow-[0_0_30px_hsl(160_84%_45%/0.15)]"
              : `bg-red-500/8 border-red-500/25 shadow-[0_0_30px_hsl(0_72%_58%/0.15)] ${shaking ? "animate-shake" : ""
              }`
              }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.valid ? (
                <div className="animate-success-pop">
                  <CheckCircle2 className="w-9 h-9 text-green-400 shrink-0" />
                </div>
              ) : (
                <XCircle className="w-9 h-9 text-red-400 shrink-0" />
              )}
              <h2
                className={`text-lg font-bold font-display ${result.valid ? "text-green-400" : "text-red-400"
                  }`}
              >
                {result.valid ? "✓ Valid Certificate" : "✗ Certificate Not Found"}
              </h2>
            </div>

            {result.valid && result.cert ? (
              <div className="space-y-2 text-sm text-left">
                {[
                  ["Name", result.cert.name],
                  ["USN", result.cert.usn],
                  ["Course", result.cert.course],
                  ["Score", `${result.cert.score}%`],
                  ["Issued", result.cert.issuedDate],
                  ["Certificate ID", result.cert.id],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">
                      {label}
                    </span>
                    <span
                      className={`font-medium text-foreground ${label === "Certificate ID" ? "font-mono text-xs" : ""
                        }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : !result.valid ? (
              <p className="text-sm text-muted-foreground">
                No certificate found with this ID. Please check and try again.
              </p>
            ) : null}
          </div>
        )}
      </main>

      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground/50 border-t border-border/30">
        © DigiCertify – Secure Digital Certification Platform
      </footer>
    </div>
  );
};

export default CertificateVerify;
