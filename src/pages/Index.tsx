import { useNavigate } from "react-router-dom";
import { ShieldCheck, Award, FileCheck, FilePlus, Sparkles, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: "Tamper-Proof",
      desc: "Every certificate carries a unique cryptographic ID — impossible to forge or duplicate.",
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-400",
      glow: "hover:shadow-[0_0_30px_hsl(217_91%_60%/0.25)]",
    },
    {
      icon: Zap,
      title: "Instant Generation",
      desc: "Generate and download professional PDF certificates in seconds, at any scale.",
      gradient: "from-teal-500/20 to-teal-500/5",
      iconColor: "text-teal-400",
      glow: "hover:shadow-[0_0_30px_hsl(173_80%_40%/0.25)]",
    },
    {
      icon: FileCheck,
      title: "Public Verification",
      desc: "Anyone can verify authenticity instantly via the public portal — no login required.",
      gradient: "from-cyan-500/20 to-cyan-500/5",
      iconColor: "text-cyan-400",
      glow: "hover:shadow-[0_0_30px_hsl(185_100%_50%/0.2)]",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex-1 flex items-center justify-center px-4 py-24 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,6%)] via-[hsl(217,40%,9%)] to-[hsl(222,47%,6%)]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-60" />

        {/* Soft radial blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/10 blur-[100px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/5 blur-[80px]" />

        {/* Animated orbit rings */}
        {[280, 380, 480, 580].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-blue-500/10 pointer-events-none"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: `spin-slow ${20 + i * 8}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
            }}
          />
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto animate-fade-in">
          {/* Floating logo icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl animate-glow-pulse" />
              <div className="relative rounded-2xl glass border-glow p-5 animate-float">
                <Award className="w-14 h-14 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Sparkles className="w-3 h-3" />
            Secure Digital Certification
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-display mb-4 tracking-tight">
            <span className="gradient-text">DigiCertify</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed">
            Generate, download, and verify professional digital certificates with blockchain-grade security.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="relative group text-base px-8 py-6 font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-teal-500 border-0 shadow-[0_0_20px_hsl(217_91%_60%/0.4)] hover:shadow-[0_0_35px_hsl(217_91%_60%/0.6)] transition-all duration-300 hover:scale-[1.03]"
              onClick={() => navigate("/generate")}
            >
              <FilePlus className="mr-2 w-5 h-5" />
              Generate Certificate
            </Button>
            <Button
              size="lg"
              className="relative text-base px-8 py-6 font-semibold bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-cyan-500 border-0 shadow-[0_0_20px_hsl(173_80%_40%/0.35)] hover:shadow-[0_0_35px_hsl(173_80%_40%/0.55)] transition-all duration-300 hover:scale-[1.03]"
              onClick={() => navigate("/verify")}
            >
              <FileCheck className="mr-2 w-5 h-5" />
              Verify Certificate
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-base px-8 py-6 font-semibold text-muted-foreground hover:text-foreground glass hover:border-blue-500/30 border border-transparent transition-all duration-300 hover:scale-[1.03]"
              onClick={() => navigate("/admin-login")}
            >
              <ShieldCheck className="mr-2 w-5 h-5" />
              Admin Login
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="relative py-20 px-4 border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-12">
            Why DigiCertify
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, gradient, iconColor, glow }, i) => (
              <div
                key={title}
                className={`group relative rounded-2xl glass p-7 border border-border/40 transition-all duration-500 hover:-translate-y-2 ${glow} cursor-default`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Card background gradient on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 p-3 mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 font-display">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-6 text-center text-sm text-muted-foreground/60 border-t border-border/30">
        © DigiCertify – Secure Digital Certification Platform
      </footer>
    </div>
  );
};

export default Index;
