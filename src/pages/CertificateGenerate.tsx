import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, Certificate } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CertificatePreview from "@/components/CertificatePreview";
import { ArrowLeft, Search, Award } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateCertId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "DC-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

// ─── Page Component ───────────────────────────────────────────────────────────

const CertificateGenerate = () => {
  const { findStudent, addCertificate, incrementDownload, certificates } = useApp();
  const navigate = useNavigate();

  const [usn, setUsn] = useState("");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  // ── Search logic ──────────────────────────────────────────────────────────
  const handleSearch = () => {
    setError("");
    setCert(null);
    if (!usn.trim()) { setError("Please enter a USN."); return; }
    const student = findStudent(usn.trim());
    if (!student) { setError("USN not found. Please contact admin to upload student data first."); return; }

    const existing = certificates.find((c) => c.usn.toLowerCase() === usn.trim().toLowerCase());
    if (existing) { setCert(existing); return; }

    const newCert: Certificate = {
      id: generateCertId(),
      usn: student.usn,
      name: student.name,
      course: student.course,
      score: student.score,
      issuedDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      downloads: 0,
    };
    addCertificate(newCert);
    setCert(newCert);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/7 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/6 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-25 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 border-b border-border/40 glass-strong sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
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

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">

        {/* ── USN Search Section ──────────────────────────────────────────── */}
        <div className="rounded-2xl glass-strong border-glow shadow-elevated p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-teal-500" />
            <h2 className="text-xl font-bold font-display text-foreground">Generate Certificate</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Enter your USN below to generate and download your certificate.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="usn" className="text-muted-foreground text-xs uppercase tracking-wider">
                Student USN
              </Label>
              <Input
                id="usn"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                placeholder="Enter USN (e.g. 1CS21CS001)"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white/5 border-white/10 h-11 transition-all duration-300 focus:border-blue-500/60 focus:ring-0 focus:shadow-[0_0_0_2px_hsl(217_91%_60%/0.15),0_0_16px_hsl(217_91%_60%/0.2)]"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="h-11 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-teal-500 border-0 shadow-[0_0_15px_hsl(217_91%_60%/0.3)] hover:shadow-[0_0_25px_hsl(217_91%_60%/0.5)] transition-all duration-300 hover:scale-[1.03]"
              >
                <Search className="w-4 h-4 mr-1.5" /> Fetch
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/25 px-4 py-2.5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* ── Certificate Preview ─────────────────────────────────────────── */}
        {cert && (
          <div className="animate-fade-in-scale">
            <CertificatePreview
              certificate={cert}
              onDownload={() => incrementDownload(cert.id)}
            />
          </div>
        )}

        {/* ── Empty state hint ─────────────────────────────────────────────── */}
        {!cert && !error && (
          <div className="rounded-2xl glass border border-border/30 p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-border/40 flex items-center justify-center">
              <Award className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">Enter your USN above to fetch your certificate.</p>
            <p className="text-muted-foreground/50 text-xs max-w-xs">
              Your certificate will be generated and available for download instantly.
            </p>
          </div>
        )}

      </main>

      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground/50 border-t border-border/30">
        © DigiCertify – Secure Digital Certification Platform
      </footer>
    </div>
  );
};

export default CertificateGenerate;
