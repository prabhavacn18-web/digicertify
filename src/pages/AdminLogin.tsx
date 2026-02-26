import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      triggerShake();
      return;
    }
    const success = login(username.trim(), password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Try admin / admin123");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-teal-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>

        <div
          className={`rounded-2xl glass-strong border-glow shadow-elevated p-8 ${shaking ? "animate-shake" : ""
            }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-7">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-lg" />
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-4 shadow-[0_0_30px_hsl(217_91%_60%/0.5)]">
                <ShieldCheck className="w-9 h-9 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1 font-display text-foreground">
            Admin Login
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-7">
            Sign in to the DigiCertify dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-muted-foreground text-xs tracking-wider uppercase"
              >
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="bg-white/5 border-white/10 h-11 transition-all duration-300 focus:border-blue-500/60 focus:ring-0 focus:shadow-[0_0_0_2px_hsl(217_91%_60%/0.15),0_0_16px_hsl(217_91%_60%/0.2)]"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-muted-foreground text-xs tracking-wider uppercase"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/5 border-white/10 h-11 transition-all duration-300 focus:border-blue-500/60 focus:ring-0 focus:shadow-[0_0_0_2px_hsl(217_91%_60%/0.15),0_0_16px_hsl(217_91%_60%/0.2)]"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 border-0 shadow-[0_0_20px_hsl(217_91%_60%/0.3)] hover:shadow-[0_0_30px_hsl(217_91%_60%/0.5)] transition-all duration-300 hover:scale-[1.01]"
            >
              Sign In
            </Button>
          </form>

          <p className="text-xs text-muted-foreground/50 text-center mt-5">
            Demo:{" "}
            <span className="text-muted-foreground font-mono">admin</span>
            {" / "}
            <span className="text-muted-foreground font-mono">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
