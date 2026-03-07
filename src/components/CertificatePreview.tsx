import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { Certificate, useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Award } from "lucide-react";

interface Props {
  certificate: Certificate;
  onDownload?: () => void;
  hideButton?: boolean;
}

// Certificate canvas dimensions (A4 Landscape in px at 96dpi)
const CERT_W = 1120;
const CERT_H = 790;

// ─── On-screen preview scale ──────────────────────────────────────────────────
const PREVIEW_MAX_W = 800;
const PREVIEW_SCALE = Math.min(1, PREVIEW_MAX_W / CERT_W); // ≈ 0.714

const CertificatePreview = ({ certificate, onDownload, hideButton }: Props) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Active custom template from context (undefined = use built-in design)
  const { activeTemplate } = useApp();

  // ── Verification URL ────────────────────────────────────────────────────────
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const baseUrl = isLocalhost ? window.location.origin : "https://digicertify.com";
  const verificationUrl = `${baseUrl}/verify?certId=${certificate.id}`;

  // ── PDF download handler ────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 100));

    let offscreen: HTMLDivElement | null = null;
    try {
      offscreen = document.createElement("div");
      Object.assign(offscreen.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: `${CERT_W}px`,
        height: `${CERT_H}px`,
        zIndex: "-9999",
        pointerEvents: "none",
        overflow: "hidden",
        transform: "translateX(-200vw)",
      });
      document.body.appendChild(offscreen);

      const clone = certRef.current.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        width: `${CERT_W}px`,
        height: `${CERT_H}px`,
        minWidth: `${CERT_W}px`,
        minHeight: `${CERT_H}px`,
        maxWidth: `${CERT_W}px`,
        maxHeight: `${CERT_H}px`,
        position: "relative",
        transform: "none",
      });
      offscreen.appendChild(clone);

      await new Promise((r) => setTimeout(r, 80));

      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#FDFDFB",
        width: CERT_W,
        height: CERT_H,
        windowWidth: CERT_W,
        windowHeight: CERT_H,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      doc.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      doc.save(`Certificate_${certificate.usn}.pdf`);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
      if (onDownload) onDownload();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      if (offscreen && document.body.contains(offscreen)) {
        document.body.removeChild(offscreen);
      }
      setDownloading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // BRANCH A — Custom template is active
  // Only the template image + clean overlay of student data. No built-in HTML.
  // ════════════════════════════════════════════════════════════════════════════
  const TemplateCertBody = (
    <div
      ref={certRef}
      id={hideButton ? "certificate-print-node" : undefined}
      style={{
        width: `${CERT_W}px`,
        height: `${CERT_H}px`,
        minWidth: `${CERT_W}px`,
        minHeight: `${CERT_H}px`,
        maxWidth: `${CERT_W}px`,
        maxHeight: `${CERT_H}px`,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── Full-bleed template background ── */}
      <img
        src={activeTemplate?.dataUrl}
        alt="certificate template"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          display: "block",
          zIndex: 0,
        }}
        crossOrigin="anonymous"
      />

      {/* ── Student Name ── top: 42%, centered ── */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          width: "72%",
        }}
      >
        <h2
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: "#0F172A",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {certificate.name}
        </h2>
      </div>

      {/* ── USN ── top: 48%, centered ── */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          width: "60%",
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: "#6B7280",
            fontFamily: "monospace",
            letterSpacing: "0.1em",
            margin: 0,
            fontWeight: 500,
          }}
        >
          {certificate.usn}
        </p>
      </div>

      {/* ── Course Name ── top: 56%, centered ── */}
      <div
        style={{
          position: "absolute",
          top: "56%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          width: "70%",
        }}
      >
        <h3
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#1E293B",
            margin: 0,
            letterSpacing: "-0.2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {certificate.course}
        </h3>
      </div>

      {/* ── Score ── top: 64%, centered ── */}
      <div
        style={{
          position: "absolute",
          top: "64%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(255,255,255,0.88)",
          border: "1.5px solid #0EA5E9",
          borderRadius: 999,
          padding: "5px 22px",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 12, color: "#0EA5E9", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Score
        </span>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
          {certificate.score}%
        </span>
      </div>

      {/* ── Issue Date ── bottom: 70px, left: 120px ── */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 120,
          zIndex: 10,
        }}
      >
        <p style={{ fontSize: 13, color: "#374151", fontWeight: 600, margin: 0 }}>
          {certificate.issuedDate}
        </p>
      </div>

      {/* ── Certificate ID ── bottom: 40px, center ── */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
          whiteSpace: "nowrap",
        }}
      >
        <p
          style={{
            fontSize: 9.5,
            color: "#9CA3AF",
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Certificate ID:{" "}
          <span style={{ fontWeight: 700, color: "#6B7280" }}>{certificate.id}</span>
        </p>
      </div>

      {/* ── QR Code ── bottom: 50px, right: 120px, 90×90 ── */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          right: 120,
          width: 90,
          height: 90,
          backgroundColor: "#ffffff",
          padding: 4,
          border: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          boxSizing: "border-box",
        }}
      >
        <QRCode value={verificationUrl} size={82} level="M" />
      </div>
    </div>
  );



  // ════════════════════════════════════════════════════════════════════════════
  // BRANCH B — No template: built-in premium certificate design (unchanged)
  // ════════════════════════════════════════════════════════════════════════════
  const BuiltInCertBody = (
    <div
      ref={certRef}
      id={hideButton ? "certificate-print-node" : undefined}
      style={{
        width: `${CERT_W}px`,
        height: `${CERT_H}px`,
        minWidth: `${CERT_W}px`,
        minHeight: `${CERT_H}px`,
        maxWidth: `${CERT_W}px`,
        maxHeight: `${CERT_H}px`,
        position: "relative",
        backgroundColor: "#FDFDFB",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        color: "#111827",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* ── Outer thin grey border ── */}
      <div
        style={{
          position: "absolute",
          inset: "14px",
          border: "1.5px solid #CBD5E1",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── Corner decorators ── */}
      {[
        { top: 10, left: 10 },
        { top: 10, right: 10 },
        { bottom: 10, left: 10 },
        { bottom: 10, right: 10 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            ...pos,
            border: "2px solid #94A3B8",
            borderRadius: 1,
            zIndex: 2,
          }}
        />
      ))}

      {/* ── Watermark geometric circles ── */}
      <div style={{ position: "absolute", top: -320, left: -160, width: 680, height: 680, borderRadius: "50%", border: "1px solid #D1D5DB", opacity: 0.18, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: -480, left: 220, width: 900, height: 900, borderRadius: "50%", border: "1px solid #D1D5DB", opacity: 0.15, pointerEvents: "none", zIndex: 0 }} />

      {/* ── Title: COMPLETION CERTIFICATE ── */}
      <div style={{ position: "absolute", top: 64, left: 64, right: 340, zIndex: 10 }}>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.5px",
            color: "#0F172A",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          COMPLETION<br />CERTIFICATE
        </h1>
      </div>

      {/* ── "This is to certify that" ── */}
      <div style={{ position: "absolute", top: 250, left: 64, zIndex: 10 }}>
        <p style={{ fontSize: 15, color: "#6B7280", margin: 0, fontWeight: 500 }}>
          This is to certify that
        </p>
      </div>

      {/* ── Student Name + USN ── */}
      <div style={{ position: "absolute", top: 282, left: 64, right: 340, zIndex: 10 }}>
        <h2 style={{ fontSize: 48, fontWeight: 700, color: "#0F172A", margin: "0 0 6px 0", lineHeight: 1.1, letterSpacing: "-0.3px" }}>
          {certificate.name}
        </h2>
        <p style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "monospace", letterSpacing: "0.08em", margin: 0 }}>
          USN: {certificate.usn}
        </p>
      </div>

      {/* ── Course ── */}
      <div style={{ position: "absolute", top: 430, left: 64, right: 340, zIndex: 10 }}>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 8px 0" }}>
          has successfully completed the course
        </p>
        <h3 style={{ fontSize: 22, fontWeight: 600, color: "#1E293B", letterSpacing: "-0.2px", margin: 0 }}>
          {certificate.course}
        </h3>
      </div>

      {/* ── Issue Date ── */}
      <div style={{ position: "absolute", top: 530, left: 64, zIndex: 10 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>
          {certificate.issuedDate}
        </p>
      </div>

      {/* ── QR Code at bottom-left ── */}
      <div style={{ position: "absolute", bottom: 48, left: 64, zIndex: 10, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 90, height: 90, backgroundColor: "#fff", padding: 4, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <QRCode value={verificationUrl} size={82} style={{ display: "block", width: "100%", height: "100%" }} level="M" />
        </div>
        <div>
          <p style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 3px 0" }}>
            VERIFY AT
          </p>
          <p style={{ fontSize: 10, color: "#6B7280", fontFamily: "monospace", margin: 0, wordBreak: "break-all", maxWidth: 200 }}>
            {verificationUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>

      {/* ── RIGHT RIBBON AREA ── */}
      {/* Ribbon */}
      <div style={{ position: "absolute", top: 0, right: 80, width: 148, height: 340, backgroundColor: "#E2E8F0", opacity: 0.88, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 87%, 0 100%)", zIndex: 5 }} />
      {/* VERIFIED label */}
      <div style={{ position: "absolute", top: 32, right: 80, width: 148, textAlign: "center", zIndex: 6 }}>
        <span style={{ display: "block", paddingBottom: 14, paddingTop: 20, fontSize: 11.5, fontWeight: 700, color: "#475569", letterSpacing: "0.26em", textTransform: "uppercase", borderBottom: "1px solid #CBD5E1" }}>
          VERIFIED
        </span>
      </div>
      {/* Circular seal */}
      <div style={{ position: "absolute", top: 126, right: 80 + (148 - 112) / 2, width: 112, height: 112, borderRadius: "50%", border: "1.5px dashed #94A3B8", backgroundColor: "#FDFDFB", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 6 }}>
        <div style={{ width: "88%", height: "88%", borderRadius: "50%", border: "1px solid #CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <span style={{ fontSize: 6, fontWeight: 700, color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0", paddingBottom: 3, width: "72%", textAlign: "center" }}>
            Digitally Verified
          </span>
          <Award style={{ width: 22, height: 22, color: "#94A3B8", marginTop: 2, marginBottom: 2 }} />
          <span style={{ fontSize: 6, fontWeight: 700, color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase", borderTop: "1px solid #E2E8F0", paddingTop: 3, width: "72%", textAlign: "center" }}>
            Certificate
          </span>
        </div>
      </div>

      {/* ── Signature at bottom-right ── */}
      <div style={{ position: "absolute", bottom: 48, right: 64, textAlign: "center", zIndex: 10, width: 200 }}>
        <div style={{ fontFamily: "'Brush Script MT', 'Segoe Print', 'Lucida Handwriting', cursive", fontSize: 38, color: "#1E293B", opacity: 0.88, transform: "rotate(-2deg)", marginBottom: 6, whiteSpace: "nowrap" }}>
          J. Anderson
        </div>
        <div style={{ width: "100%", height: 1, backgroundColor: "#64748B", marginBottom: 6 }} />
        <p style={{ fontSize: 11, fontWeight: 600, color: "#374151", margin: "0 0 2px 0" }}>
          Authorized Signatory
        </p>
        <p style={{ fontSize: 9.5, color: "#9CA3AF", letterSpacing: "0.06em", margin: "0 0 12px 0" }}>
          DigiCertify Platform
        </p>
        <p style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: "monospace", margin: 0, lineHeight: 1.5 }}>
          Certificate ID:<br />
          <span style={{ fontWeight: 600, color: "#6B7280" }}>{certificate.id}</span>
        </p>
      </div>
    </div>
  );

  // ── Pick which body to render based on whether a template is active ──────────
  const CertBody = activeTemplate ? TemplateCertBody : BuiltInCertBody;

  // ── On-screen preview wrapper ──────────────────────────────────────────────
  return (
    <div className="animate-fade-in flex flex-col items-center w-full" style={{ gap: 24 }}>
      {/* Stage: sized to the SCALED dimensions so page layout is correct */}
      <div
        style={{
          width: Math.round(CERT_W * PREVIEW_SCALE),
          height: Math.round(CERT_H * PREVIEW_SCALE),
          position: "relative",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          borderRadius: 4,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Inner container: full cert size, scaled down */}
        <div
          style={{
            transformOrigin: "top left",
            transform: `scale(${PREVIEW_SCALE})`,
            width: CERT_W,
            height: CERT_H,
          }}
        >
          {CertBody}
        </div>
      </div>

      {/* Download button */}
      {!hideButton && (
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full max-w-md mx-auto h-12 font-semibold text-base transition-all duration-300 border-0 ${downloaded
            ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
            : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20"
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          size="lg"
        >
          {downloading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating PDF…
            </span>
          ) : downloaded ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              Certificate Downloaded
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Certificate (PDF)
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default CertificatePreview;
