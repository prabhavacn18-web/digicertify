import { useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Papa from "papaparse";
import { useApp, Student } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, LogOut, Award, Download, Users, FileText, TrendingUp, ChevronRight, ImagePlus, Trash2, CheckCircle2, LayoutTemplate } from "lucide-react";

const AdminDashboard = () => {
  const { isAdmin, logout, students, setStudents, certificates, templates, addTemplate, deleteTemplate, setActiveTemplate } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const templateFileRef = useRef<HTMLInputElement>(null);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [templateMsg, setTemplateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTplDragging, setIsTplDragging] = useState(false);

  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setUploadMsg({ type: "error", text: "Only CSV files are accepted." });
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredCols = ["USN", "Name", "Course", "Score"];
        const headers = results.meta.fields || [];
        const missing = requiredCols.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          setUploadMsg({ type: "error", text: `Missing columns: ${missing.join(", ")}` });
          return;
        }
        const parsed: Student[] = (results.data as Record<string, string>[])
          .map((row) => ({
            usn: row.USN?.trim() || "",
            name: row.Name?.trim() || "",
            course: row.Course?.trim() || "",
            score: Number(row.Score) || 0,
          }))
          .filter((s) => s.usn);
        setStudents(parsed);
        setUploadMsg({ type: "success", text: `${parsed.length} student(s) loaded successfully.` });
      },
      error: () => setUploadMsg({ type: "error", text: "Failed to parse CSV." }),
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  // ── Template upload logic ─────────────────────────────────────────────────
  const processTemplateFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setTemplateMsg({ type: "error", text: "Only PNG or JPG image files are supported." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setTemplateMsg({ type: "error", text: "File too large. Maximum size is 5 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      addTemplate(file.name, dataUrl);
      setTemplateMsg({ type: "success", text: `Template "${file.name}" uploaded successfully.` });
    };
    reader.onerror = () => setTemplateMsg({ type: "error", text: "Failed to read the file." });
    reader.readAsDataURL(file);
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processTemplateFile(file);
    e.target.value = "";
  };

  const handleTemplateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsTplDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processTemplateFile(file);
  };

  const stats = [
    { icon: Users, label: "Students Loaded", value: students.length, color: "blue" },
    { icon: FileText, label: "Certificates Issued", value: certificates.length, color: "teal" },
    { icon: TrendingUp, label: "Total Downloads", value: certificates.reduce((s, c) => s + c.downloads, 0), color: "cyan" },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
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
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold font-display gradient-text">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage student data and certificates</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className={`rounded-xl glass border p-5 transition-all duration-300 hover:-translate-y-1 ${color === "blue"
                ? "border-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_20px_hsl(217_91%_60%/0.15)]"
                : color === "teal"
                  ? "border-teal-500/20 hover:border-teal-500/40 hover:shadow-[0_0_20px_hsl(173_80%_40%/0.15)]"
                  : "border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_20px_hsl(185_100%_50%/0.12)]"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${color === "blue"
                    ? "bg-blue-500/15 text-blue-400"
                    : color === "teal"
                      ? "bg-teal-500/15 text-teal-400"
                      : "bg-cyan-500/15 text-cyan-400"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Download All Certificates Action Card ────────────────────── */}
        <div
          onClick={() => students.length > 0 ? navigate("/admin/download-certificates") : undefined}
          className={`rounded-2xl glass border border-border/40 shadow-card p-5 flex items-center justify-between gap-4 transition-all duration-300 ${students.length > 0
            ? "cursor-pointer hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-[0_0_25px_hsl(173_80%_40%/0.2)] group"
            : "opacity-60 cursor-not-allowed"
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-teal-500/15 border border-teal-500/20 p-3 group-hover:bg-teal-500/25 transition-colors">
              <Download className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-foreground">Download All Certificates</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {students.length > 0
                  ? `Generate and bulk-download PDFs for all ${students.length} student(s)`
                  : "Upload student data first to enable bulk download"}
              </p>
            </div>
          </div>
          {students.length > 0 && (
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          )}
        </div>

        {/* Upload Section */}
        <div className="rounded-2xl glass border-glow shadow-card p-6">
          <h2 className="text-lg font-bold font-display text-foreground mb-1">Upload Student Data</h2>
          <p className="text-sm text-muted-foreground mb-5">
            CSV must include columns:{" "}
            <span className="font-semibold text-foreground">USN, Name, Course, Score</span>
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${isDragging
              ? "border-blue-500/70 bg-blue-500/10 shadow-[0_0_25px_hsl(217_91%_60%/0.2)]"
              : "border-border/50 hover:border-blue-500/40 hover:bg-blue-500/5"
              }`}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              Drop your CSV here, or{" "}
              <span className="text-blue-400 hover:text-blue-300">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Only .csv files supported</p>
          </div>

          {uploadMsg && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 border text-sm font-medium ${uploadMsg.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
            >
              {uploadMsg.text}
            </div>
          )}
        </div>

        {/* Student Table */}
        {students.length > 0 && (
          <div className="rounded-2xl glass border border-border/40 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border/40">
              <h2 className="text-lg font-bold font-display text-foreground">
                Uploaded Students{" "}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({students.length})
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">USN</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Course</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.usn} className="border-border/20 hover:bg-white/2 transition-colors">
                      <TableCell className="font-mono text-sm text-blue-400">{s.usn}</TableCell>
                      <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.course}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/20">
                          {s.score}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Certificates Table */}
        {certificates.length > 0 && (
          <div className="rounded-2xl glass border border-border/40 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border/40">
              <h2 className="text-lg font-bold font-display text-foreground">
                Generated Certificates{" "}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({certificates.length})
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Certificate ID</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">USN</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Course</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">Score</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Download className="w-3 h-3" /> Downloads
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((c) => (
                    <TableRow key={c.id} className="border-border/20 hover:bg-white/2 transition-colors">
                      <TableCell className="font-mono text-xs text-blue-400/80">{c.id}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{c.usn}</TableCell>
                      <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.course}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/20">
                          {c.score}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{c.downloads}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {/* ════════════════════════════════════════════════════════════ */}
        {/* ── CERTIFICATE TEMPLATES SECTION ────────────────────────── */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl glass border border-border/40 shadow-card overflow-hidden">
          {/* Section header */}
          <div className="p-5 border-b border-border/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/15 border border-blue-500/20 p-2">
                <LayoutTemplate className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-foreground">Certificate Templates</h2>
                <p className="text-xs text-muted-foreground">Upload a PNG/JPG background template. Set one as active to use it for all certificate generation.</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => templateFileRef.current?.click()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-teal-500 border-0 shadow-[0_0_12px_hsl(217_91%_60%/0.3)] hover:shadow-[0_0_20px_hsl(217_91%_60%/0.5)] transition-all duration-300"
            >
              <ImagePlus className="w-3.5 h-3.5 mr-1.5" />
              Upload Template
            </Button>
            <input
              ref={templateFileRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleTemplateUpload}
            />
          </div>

          <div className="p-5 space-y-5">
            {/* Drag & drop upload zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsTplDragging(true); }}
              onDragLeave={() => setIsTplDragging(false)}
              onDrop={handleTemplateDrop}
              onClick={() => templateFileRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${isTplDragging
                  ? "border-blue-500/70 bg-blue-500/10 shadow-[0_0_25px_hsl(217_91%_60%/0.2)]"
                  : "border-border/50 hover:border-blue-500/40 hover:bg-blue-500/5"
                }`}
            >
              <ImagePlus className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                Drop your template here, or{" "}
                <span className="text-blue-400">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG or JPG — up to 5 MB</p>
            </div>

            {templateMsg && (
              <div
                className={`rounded-lg px-4 py-3 border text-sm font-medium ${templateMsg.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
              >
                {templateMsg.text}
              </div>
            )}

            {/* Template list */}
            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-border/40 flex items-center justify-center">
                  <LayoutTemplate className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-sm">No templates uploaded yet.</p>
                <p className="text-muted-foreground/50 text-xs max-w-xs">
                  Upload a PNG or JPG to use as the certificate background.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/40 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-white/3">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Template Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploaded</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((tpl, idx) => (
                      <tr
                        key={tpl.id}
                        className={`border-b border-border/20 last:border-0 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"
                          } hover:bg-white/[0.03]`}
                      >
                        {/* Preview thumbnail */}
                        <td className="px-4 py-3">
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-border/40 bg-white/5 flex items-center justify-center">
                            <img
                              src={tpl.dataUrl}
                              alt={tpl.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        {/* Template name */}
                        <td className="px-4 py-3 font-medium text-foreground max-w-[200px]">
                          <span className="truncate block" title={tpl.name}>{tpl.name}</span>
                        </td>
                        {/* Uploaded date */}
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(tpl.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </td>
                        {/* Status badge */}
                        <td className="px-4 py-3">
                          {tpl.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-muted-foreground border border-border/30">
                              Inactive
                            </span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!tpl.isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveTemplate(tpl.id)}
                                className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 transition-all"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Set Active
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteTemplate(tpl.id)}
                              className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </main>

      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground/50 border-t border-border/30">
        © DigiCertify – Secure Digital Certification Platform
      </footer>
    </div>
  );
};

export default AdminDashboard;
