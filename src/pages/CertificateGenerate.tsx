import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useApp, Certificate, Student } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CertificatePreview from "@/components/CertificatePreview";
import { ArrowLeft, Search, Award, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateCertId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "DC-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

const buildCertFromStudent = (student: Student): Certificate => ({
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
});

// ─── Page Component ───────────────────────────────────────────────────────────

const CertificateGenerate = () => {
  const { isAdmin, findStudent, addCertificate, incrementDownload, certificates, students } = useApp();
  const navigate = useNavigate();

  // Single-cert state
  const [usn, setUsn] = useState("");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  // Bulk download state
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [downloadingUsn, setDownloadingUsn] = useState<string | null>(null);

  // Hidden cert state for capturing DOM-to-PDF perfectly during bulk exports
  const [hiddenCert, setHiddenCert] = useState<Certificate | null>(null);

  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  // ── Single cert logic ─────────────────────────────────────────────────────
  const handleSearch = () => {
    setError("");
    setCert(null);
    if (!usn.trim()) { setError("Please enter a USN."); return; }
    const student = findStudent(usn.trim());
    if (!student) { setError("USN not found in uploaded data."); return; }

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

  // ── Bulk helpers ──────────────────────────────────────────────────────────
  const resolveOrCreateCert = (student: Student): Certificate => {
    const existing = certificates.find((c) => c.usn.toLowerCase() === student.usn.toLowerCase());
    if (existing) return existing;
    const newCert = buildCertFromStudent(student);
    addCertificate(newCert);
    return newCert;
  };

  const generatePdfFromHiddenNode = async (certificate: Certificate) => {
    const el = document.getElementById("certificate-print-node");
    if (!el) return;

    // Give the hidden CertificatePreview component time to fully render
    await new Promise((r) => setTimeout(r, 100));

    // Clone into a transform-free off-screen container (same technique as in CertificatePreview)
    const offscreen = document.createElement("div");
    Object.assign(offscreen.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "1120px",
      height: "790px",
      zIndex: "-9999",
      pointerEvents: "none",
      overflow: "hidden",
      transform: "translateX(-200vw)",
    });
    document.body.appendChild(offscreen);

    try {
      const clone = el.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        width: "1120px",
        height: "790px",
        minWidth: "1120px",
        minHeight: "790px",
        maxWidth: "1120px",
        maxHeight: "790px",
        position: "relative",
        transform: "none",
      });
      offscreen.appendChild(clone);

      await new Promise((r) => setTimeout(r, 60));

      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: "#FDFDFB",
        width: 1120,
        height: 790,
        windowWidth: 1120,
        windowHeight: 790,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });

      doc.addImage(imgData, "PNG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      doc.save(`Certificate_${certificate.usn}.pdf`);
    } finally {
      if (document.body.contains(offscreen)) {
        document.body.removeChild(offscreen);
      }
    }
  };

  const handleIndividualDownload = async (student: Student) => {
    setDownloadingUsn(student.usn);
    const certObj = resolveOrCreateCert(student);

    setHiddenCert(certObj);
    // Wait for React to render the hidden preview DOM
    await new Promise((r) => setTimeout(r, 100));

    await generatePdfFromHiddenNode(certObj);
    incrementDownload(certObj.id);

    setHiddenCert(null);
    setDownloadingUsn(null);
  };

  const handleDownloadAll = async () => {
    setIsBulkDownloading(true);

    for (const student of students) {
      const certObj = resolveOrCreateCert(student);
      setHiddenCert(certObj);

      // Allow render cycle
      await new Promise((r) => setTimeout(r, 100));
      await generatePdfFromHiddenNode(certObj);
      incrementDownload(certObj.id);
    }

    setHiddenCert(null);
    setIsBulkDownloading(false);
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

        {/* ── Single cert section ────────────────────────────────────────── */}
        <div className="rounded-2xl glass-strong border-glow shadow-elevated p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-teal-500" />
            <h2 className="text-xl font-bold font-display text-foreground">Generate Certificate</h2>
          </div>
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

        {cert && (
          <div className="animate-fade-in-scale">
            <CertificatePreview
              certificate={cert}
              onDownload={() => incrementDownload(cert.id)}
            />
          </div>
        )}

        {/* ── Bulk Download Section ──────────────────────────────────────── */}
        <div className="rounded-2xl glass border border-border/40 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-teal-500 to-cyan-400" />
              <h2 className="text-xl font-bold font-display text-foreground">Download All Certificates</h2>
            </div>

            {students.length > 0 && (
              <Button
                onClick={handleDownloadAll}
                disabled={isBulkDownloading || downloadingUsn !== null}
                className="min-w-[216px] bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 border-0 shadow-[0_0_15px_hsl(173_80%_40%/0.3)] hover:shadow-[0_0_25px_hsl(173_80%_40%/0.5)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isBulkDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDFs…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download All Certificates
                  </>
                )}
              </Button>
            )}
          </div>

          {isBulkDownloading && (
            <div className="rounded-lg bg-teal-500/8 border border-teal-500/20 px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
              <p className="text-sm text-teal-300 animate-pulse">
                Generating certificates for all {students.length} students… please wait.
              </p>
            </div>
          )}

          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-border/40 flex items-center justify-center">
                <Award className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No student data uploaded yet.</p>
              <p className="text-muted-foreground/50 text-xs max-w-xs">
                Upload a CSV from the Admin Dashboard to enable bulk certificate download.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-white/3">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      USN
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const isThisRow = downloadingUsn === student.usn;
                    const isAnyBusy = isBulkDownloading || downloadingUsn !== null;
                    return (
                      <tr
                        key={student.usn}
                        className={`border-b border-border/20 last:border-0 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"
                          } hover:bg-white/[0.04]`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                        <td className="px-4 py-3 font-mono text-blue-400/80 text-xs">{student.usn}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/20">
                            {student.score}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAnyBusy}
                            onClick={() => handleIndividualDownload(student)}
                            className="min-w-[110px] bg-transparent border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-300 transition-all disabled:opacity-50"
                          >
                            {isThisRow ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                Generating…
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3 mr-1.5" />
                                Download
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground/50 border-t border-border/30">
        © DigiCertify – Secure Digital Certification Platform
      </footer>

      {/* Hidden container for exporting exact DOM copies in bulk mode */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px", visibility: "hidden", width: "1120px", height: "790px" }}>
        {hiddenCert && (
          <CertificatePreview certificate={hiddenCert} hideButton />
        )}
      </div>

    </div>
  );
};

export default CertificateGenerate;
