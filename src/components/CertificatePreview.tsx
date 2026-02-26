import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { Certificate } from "@/context/AppContext";
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

const CertificatePreview = ({ certificate, onDownload, hideButton }: Props) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 100));

    // ── Off-screen clone approach ──────────────────────────────────────────
    // certRef sits inside a CSS-scaled wrapper (transform: scale(~0.71)).
    // html2canvas reads the DOM layout box, not the visual scaled size, so
    // we must clone the element into a neutral container (no parent transform)
    // at its true 1120×790 size before capturing — otherwise devicePixelRatio
    // and the parent transform stack can produce wrong canvas dimensions.
    let offscreen: HTMLDivElement | null = null;

    try {
      // 1. Create an off-screen host that has no transform or scaling
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
        // Completely outside the visible viewport
        transform: "translateX(-200vw)",
      });
      document.body.appendChild(offscreen);

      // 2. Deep-clone the certificate node into the off-screen host
      const clone = certRef.current.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        width: `${CERT_W}px`,
        height: `${CERT_H}px`,
        minWidth: `${CERT_W}px`,
        minHeight: `${CERT_H}px`,
        maxWidth: `${CERT_W}px`,
        maxHeight: `${CERT_H}px`,
        position: "relative",
        transform: "none",  // guarantee no inherited transform
      });
      offscreen.appendChild(clone);

      // Allow browser one paint cycle to lay out the clone
      await new Promise((r) => setTimeout(r, 60));

      // 3. Capture at scale:1 → canvas is exactly CERT_W × CERT_H pixels
      //    Setting windowWidth/windowHeight prevents html2canvas from using
      //    the actual viewport size as a reference, which can cause DPR drift.
      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
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

      // 4. Build A4 landscape PDF — image fills the entire page, zero margins
      const imgData = canvas.toDataURL("image/png"); // PNG = lossless, no JPEG artefacts
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfW = doc.internal.pageSize.getWidth();   // 297 mm
      const pdfH = doc.internal.pageSize.getHeight();  // 210 mm

      // addImage(data, format, x, y, width, height) — all in mm, starting at (0,0)
      doc.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      doc.save(`Certificate_${certificate.usn}.pdf`);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
      if (onDownload) onDownload();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      // 5. Always clean up the off-screen clone
      if (offscreen && document.body.contains(offscreen)) {
        document.body.removeChild(offscreen);
      }
      setDownloading(false);
    }
  };

  // Always use digicertify.com domain for QR/verification URL
  const verificationUrl = `https://digicertify.com/verify?certId=${certificate.id}`;

  // ── Certificate body (shared between preview and hidden export) ──────────
  const CertBody = (
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

      {/* ── Corner decorators (thin lines at each corner, like Coursera) ── */}
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
      <div
        style={{
          position: "absolute",
          top: -320,
          left: -160,
          width: 680,
          height: 680,
          borderRadius: "50%",
          border: "1px solid #D1D5DB",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -480,
          left: 220,
          width: 900,
          height: 900,
          borderRadius: "50%",
          border: "1px solid #D1D5DB",
          opacity: 0.15,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ════════════════════════════════════════ */}
      {/* ── LEFT CONTENT AREA ── */}
      {/* ════════════════════════════════════════ */}

      {/* Title: COMPLETION CERTIFICATE */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 64,
          right: 340,
          zIndex: 10,
        }}
      >
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

      {/* "This is to certify that" */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 64,
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 15,
            color: "#6B7280",
            margin: 0,
            fontWeight: 500,
          }}
        >
          This is to certify that
        </p>
      </div>

      {/* Student Name */}
      <div
        style={{
          position: "absolute",
          top: 282,
          left: 64,
          right: 340,
          zIndex: 10,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#0F172A",
            margin: "0 0 6px 0",
            lineHeight: 1.1,
            letterSpacing: "-0.3px",
          }}
        >
          {certificate.name}
        </h2>
        <p
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          USN: {certificate.usn}
        </p>
      </div>

      {/* "has successfully completed the course" + course name */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 64,
          right: 340,
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: "#6B7280",
            margin: "0 0 8px 0",
          }}
        >
          has successfully completed the course
        </p>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#1E293B",
            letterSpacing: "-0.2px",
            margin: 0,
          }}
        >
          {certificate.course}
        </h3>
      </div>

      {/* Issue Date */}
      <div
        style={{
          position: "absolute",
          top: 530,
          left: 64,
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#374151",
            margin: 0,
          }}
        >
          {certificate.issuedDate}
        </p>
      </div>

      {/* QR Code at bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 64,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            backgroundColor: "#fff",
            padding: 4,
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <QRCode
            value={verificationUrl}
            size={82}
            style={{ display: "block", width: "100%", height: "100%" }}
            level="M"
          />
        </div>
        <div>
          <p
            style={{
              fontSize: 9,
              color: "#9CA3AF",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              margin: "0 0 3px 0",
            }}
          >
            VERIFY AT
          </p>
          <p
            style={{
              fontSize: 10,
              color: "#6B7280",
              fontFamily: "monospace",
              margin: 0,
              wordBreak: "break-all",
              maxWidth: 200,
            }}
          >
            digicertify.com/verify?certId={certificate.id}
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* ── RIGHT RIBBON AREA ── */}
      {/* ════════════════════════════════════════ */}

      {/* Vertical Ribbon (light grey with a chevron cut at bottom) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 80,
          width: 148,
          height: 340,
          backgroundColor: "#E2E8F0",
          opacity: 0.88,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 87%, 0 100%)",
          zIndex: 5,
        }}
      />

      {/* "VERIFIED" label inside ribbon */}
      <div
        style={{
          position: "absolute",
          top: 32,
          right: 80,
          width: 148,
          textAlign: "center",
          zIndex: 6,
        }}
      >
        <span
          style={{
            display: "block",
            paddingBottom: 14,
            paddingTop: 20,
            fontSize: 11.5,
            fontWeight: 700,
            color: "#475569",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            borderBottom: "1px solid #CBD5E1",
          }}
        >
          VERIFIED
        </span>
      </div>

      {/* Circular seal inside ribbon */}
      <div
        style={{
          position: "absolute",
          top: 126,
          right: 80 + (148 - 112) / 2, // centered in ribbon
          width: 112,
          height: 112,
          borderRadius: "50%",
          border: "1.5px dashed #94A3B8",
          backgroundColor: "#FDFDFB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 6,
        }}
      >
        <div
          style={{
            width: "88%",
            height: "88%",
            borderRadius: "50%",
            border: "1px solid #CBD5E1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 6,
              fontWeight: 700,
              color: "#64748B",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: 3,
              width: "72%",
              textAlign: "center",
            }}
          >
            Digitally Verified
          </span>
          <Award
            style={{
              width: 22,
              height: 22,
              color: "#94A3B8",
              marginTop: 2,
              marginBottom: 2,
            }}
          />
          <span
            style={{
              fontSize: 6,
              fontWeight: 700,
              color: "#64748B",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderTop: "1px solid #E2E8F0",
              paddingTop: 3,
              width: "72%",
              textAlign: "center",
            }}
          >
            Certificate
          </span>
        </div>
      </div>

      {/* ── Signature at bottom-right ── */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 64,
          textAlign: "center",
          zIndex: 10,
          width: 200,
        }}
      >
        {/* Cursive signature */}
        <div
          style={{
            fontFamily: "'Brush Script MT', 'Segoe Print', 'Lucida Handwriting', cursive",
            fontSize: 38,
            color: "#1E293B",
            opacity: 0.88,
            transform: "rotate(-2deg)",
            marginBottom: 6,
            whiteSpace: "nowrap",
          }}
        >
          J. Anderson
        </div>
        {/* Signature line */}
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#64748B",
            marginBottom: 6,
          }}
        />
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#374151",
            margin: "0 0 2px 0",
          }}
        >
          Authorized Signatory
        </p>
        <p
          style={{
            fontSize: 9.5,
            color: "#9CA3AF",
            letterSpacing: "0.06em",
            margin: "0 0 12px 0",
          }}
        >
          DigiCertify Platform
        </p>
        {/* Certificate ID */}
        <p
          style={{
            fontSize: 9.5,
            color: "#9CA3AF",
            fontFamily: "monospace",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Certificate ID:<br />
          <span style={{ fontWeight: 600, color: "#6B7280" }}>{certificate.id}</span>
        </p>
      </div>
    </div>
  );

  // ── On-screen preview wrapper ──────────────────────────────────────────────
  // We scale the fixed 1120×790 canvas down to fit inside the viewport.
  // The outer "stage" div is sized to match the visual footprint after scaling,
  // so it doesn't push other elements off-screen.
  const PREVIEW_MAX_W = 800; // max visible width of the preview area (px)
  const scale = Math.min(1, PREVIEW_MAX_W / CERT_W); // e.g. 800/1120 ≈ 0.714

  return (
    <div className="animate-fade-in flex flex-col items-center w-full" style={{ gap: 24 }}>
      {/* Stage: sized to the SCALED dimensions so page layout is correct */}
      <div
        style={{
          width: Math.round(CERT_W * scale),
          height: Math.round(CERT_H * scale),
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
            transform: `scale(${scale})`,
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
