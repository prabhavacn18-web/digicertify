import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useApp, Certificate, Student } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import CertificatePreview from "@/components/CertificatePreview";
import { ArrowLeft, Award, Download, Loader2, ShieldCheck, Users } from "lucide-react";
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

const AdminDownloadCertificates = () => {
    const { isAdmin, students, certificates, addCertificate, incrementDownload } = useApp();
    const navigate = useNavigate();

    const [isBulkDownloading, setIsBulkDownloading] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);
    const [downloadingUsn, setDownloadingUsn] = useState<string | null>(null);
    const [hiddenCert, setHiddenCert] = useState<Certificate | null>(null);

    // Admin guard
    if (!isAdmin) return <Navigate to="/admin-login" replace />;

    // ── Cert resolution ───────────────────────────────────────────────────────
    const resolveOrCreateCert = (student: Student): Certificate => {
        const existing = certificates.find((c) => c.usn.toLowerCase() === student.usn.toLowerCase());
        if (existing) return existing;
        const newCert = buildCertFromStudent(student);
        addCertificate(newCert);
        return newCert;
    };

    // ── PDF generation from hidden DOM node ───────────────────────────────────
    const generatePdfFromHiddenNode = async (certificate: Certificate) => {
        const el = document.getElementById("certificate-print-node");
        if (!el) return;

        await new Promise((r) => setTimeout(r, 100));

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

    // ── Individual download ────────────────────────────────────────────────────
    const handleIndividualDownload = async (student: Student) => {
        setDownloadingUsn(student.usn);
        const certObj = resolveOrCreateCert(student);
        setHiddenCert(certObj);
        await new Promise((r) => setTimeout(r, 100));
        await generatePdfFromHiddenNode(certObj);
        incrementDownload(certObj.id);
        setHiddenCert(null);
        setDownloadingUsn(null);
    };

    // ── Bulk download all ──────────────────────────────────────────────────────
    const handleDownloadAll = async () => {
        setIsBulkDownloading(true);
        setBulkProgress(0);
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const certObj = resolveOrCreateCert(student);
            setHiddenCert(certObj);
            await new Promise((r) => setTimeout(r, 100));
            await generatePdfFromHiddenNode(certObj);
            incrementDownload(certObj.id);
            setBulkProgress(i + 1);
        }
        setHiddenCert(null);
        setIsBulkDownloading(false);
        setBulkProgress(0);
    };

    const isAnyBusy = isBulkDownloading || downloadingUsn !== null;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-600/7 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />

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
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Admin
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/dashboard")}
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" />
                            Dashboard
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">

                {/* Page title + bulk download button */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-5 h-5 text-teal-400" />
                            <h1 className="text-2xl font-bold font-display gradient-text">Download All Certificates</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Bulk-download or individually download certificates for all uploaded students.
                        </p>
                    </div>

                    {students.length > 0 && (
                        <Button
                            onClick={handleDownloadAll}
                            disabled={isAnyBusy}
                            className="min-w-[220px] bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 border-0 shadow-[0_0_18px_hsl(173_80%_40%/0.35)] hover:shadow-[0_0_30px_hsl(173_80%_40%/0.55)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {isBulkDownloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {bulkProgress}/{students.length} Generating…
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

                {/* Bulk progress banner */}
                {isBulkDownloading && (
                    <div className="rounded-xl bg-teal-500/8 border border-teal-500/20 px-5 py-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
                            <p className="text-sm text-teal-300 font-medium">
                                Generating certificate {bulkProgress} of {students.length}… please wait.
                            </p>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                                style={{ width: `${(bulkProgress / students.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Student table */}
                {students.length === 0 ? (
                    <div className="rounded-2xl glass border border-border/40 p-12 flex flex-col items-center gap-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-border/40 flex items-center justify-center">
                            <Users className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium">No student data uploaded yet.</p>
                            <p className="text-muted-foreground/50 text-sm mt-1 max-w-xs">
                                Upload a CSV from the Admin Dashboard to enable bulk certificate downloads.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/dashboard")}
                            className="mt-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-2xl glass border border-border/40 shadow-card overflow-hidden">
                        {/* Table header bar */}
                        <div className="p-5 border-b border-border/40 flex items-center justify-between flex-wrap gap-2">
                            <h2 className="text-lg font-bold font-display text-foreground">
                                Student Certificates{" "}
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({students.length})
                                </span>
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-white/3">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Student Name
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            USN
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, idx) => {
                                        const isThisRow = downloadingUsn === student.usn;
                                        return (
                                            <tr
                                                key={student.usn}
                                                className={`border-b border-border/20 last:border-0 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"
                                                    } hover:bg-white/[0.04]`}
                                            >
                                                <td className="px-5 py-3.5 font-medium text-foreground">{student.name}</td>
                                                <td className="px-5 py-3.5 font-mono text-blue-400/80 text-xs">{student.usn}</td>
                                                <td className="px-5 py-3.5 text-muted-foreground">{student.course}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/20">
                                                        {student.score}%
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
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
                    </div>
                )}
            </main>

            <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground/50 border-t border-border/30">
                © DigiCertify – Secure Digital Certification Platform
            </footer>

            {/* Hidden container for exporting exact DOM copies during bulk/individual export */}
            <div style={{ position: "absolute", top: "-9999px", left: "-9999px", visibility: "hidden", width: "1120px", height: "790px" }}>
                {hiddenCert && (
                    <CertificatePreview certificate={hiddenCert} hideButton />
                )}
            </div>
        </div>
    );
};

export default AdminDownloadCertificates;
