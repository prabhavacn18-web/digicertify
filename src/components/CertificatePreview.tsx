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

const CertificatePreview = ({ certificate, onDownload, hideButton }: Props) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);

    // Wait for state update to show spinner
    await new Promise((r) => setTimeout(r, 100));

    try {
      const el = certRef.current;
      const originalClass = el.className;

      // Force fixed A4 dimensions and remove shadow temporarily
      el.className = originalClass + " certificate-export-container";

      // Small delay to let browser re-layout the fixed dimensions
      await new Promise((r) => setTimeout(r, 50));

      const canvas = await html2canvas(el, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#FDFDFB", // Match the light cream bg
      });

      // Restore responsive classes immediately
      el.className = originalClass;

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();

      doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`Certificate_${certificate.usn}.pdf`);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
      if (onDownload) onDownload();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const verificationUrl = `${window.location.origin}/verify?certId=${certificate.id}`;

  // ── On-screen preview ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in flex flex-col items-center justify-center w-full">
      {/* 
         On-screen wrapper: explicitly scaled down to "medium" (65% of A4 size).
         Prevents the massive 1122px box from expanding the parent horizontally.
      */}
      <div className="relative w-full max-w-[730px] aspect-[297/210] overflow-hidden flex justify-center overflow-x-auto shadow-2xl bg-gray-100 rounded-lg">
        <div
          ref={certRef}
          id={hideButton ? "certificate-print-node" : undefined}
          className="bg-[#FDFDFB] origin-top-left flex-shrink-0"
          style={{
            width: "1122px",
            height: "793px",
            transform: "scale(min(0.65, calc(100vw / 1122)))",
            position: "relative",
            fontFamily: "'Inter', sans-serif",
            color: "#111827", // gray-900
            padding: "16px" // padding for the outer border
          }}
        >
          {/* Outer border and inner layout container */}
          <div className="relative w-full h-full border-[3px] border-gray-300/60 p-14 flex flex-col overflow-hidden">

            {/* Subtle background circular wireframes (watermark) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute top-[-400px] left-[-200px] w-[800px] h-[800px] rounded-full border-[1px] border-gray-300 opacity-20 bg-transparent rotate-45 scale-[2]" style={{ backgroundImage: "repeating-radial-gradient(transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)" }} />
              <div className="absolute bottom-[-600px] left-[300px] w-[1000px] h-[1000px] rounded-full border-[1px] border-gray-300 opacity-20 bg-transparent rotate-12 scale-[1.5]" style={{ backgroundImage: "repeating-radial-gradient(transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)" }} />
            </div>

            {/* ── Left Content Area ── */}
            <div className="absolute top-14 left-14 bottom-14 right-[320px] flex flex-col z-10">
              {/* Header */}
              <div className="mb-10 w-full">
                <h1 className="text-5xl font-bold tracking-tight text-gray-900 uppercase leading-[1.1]">
                  COMPLETION<br />CERTIFICATE
                </h1>
              </div>

              {/* Dynamic Content */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-base text-gray-500 font-medium">This is to certify that</p>
                </div>

                <div className="pt-4 pl-1">
                  <h2 className="text-5xl font-bold text-gray-900 mb-2 leading-tight">
                    {certificate.name}
                  </h2>
                  <p className="text-sm text-gray-400 font-mono tracking-wide mb-8">
                    USN: {certificate.usn}
                  </p>

                  <p className="text-base text-gray-500 mb-3">
                    has successfully completed the course
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-800 tracking-tight">
                    {certificate.course}
                  </h3>
                </div>
              </div>

              {/* Footer Info Area: QR Code, Issue Date */}
              <div className="absolute bottom-0 left-0 flex flex-col gap-6">
                <div className="text-base font-medium text-gray-800">
                  {certificate.issuedDate}
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 border border-gray-200 shadow-sm relative z-20 shrink-0 w-[96px] h-[96px] flex items-center justify-center">
                    <QRCode
                      value={verificationUrl}
                      size={256}
                      style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                      level="L"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">VERIFY AT</p>
                    <p className="text-xs text-gray-700 font-mono break-all max-w-[250px]">
                      {verificationUrl.replace("https://", "").replace("http://", "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Content Area (Ribbon & Signature) ── */}
            <div className="absolute right-0 top-0 bottom-0 w-[320px] flex flex-col items-center justify-between z-10 pointer-events-none pb-14 pr-14">

              {/* The Ribbon overlaying top border */}
              <div
                className="w-36 h-[320px] bg-[#E2E8F0] bg-opacity-[0.85] flex flex-col items-center z-10"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}
              >
                <div className="w-full border-b-[1px] border-[#CBD5E1] py-6 mt-6 text-center">
                  <span className="text-sm font-bold text-gray-600 tracking-[0.25em] uppercase">VERIFIED</span>
                </div>

                <div className="flex-1 w-full flex items-center justify-center -mt-6">
                  {/* Circular Seal */}
                  <div className="w-28 h-28 rounded-full border-[1.5px] border-dashed border-gray-400 p-[2px] flex items-center justify-center bg-[#FDFDFB]">
                    <div className="w-full h-full rounded-full border-[1px] border-gray-300 flex items-center justify-center flex-col text-center">
                      <span className="text-[5.5px] font-bold text-gray-500 tracking-widest uppercase mb-1 px-2 border-b border-gray-200 pb-1 w-[80%]">Digitally Verified</span>
                      <Award className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-[5.5px] font-bold text-gray-500 tracking-widest uppercase mt-0.5 px-2 border-t border-gray-200 pt-1 w-[80%]">Certificate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="absolute bottom-14 flex flex-col items-center z-20 w-[180px]">
                <div
                  className="text-gray-800 opacity-90 -rotate-2 whitespace-nowrap mb-2"
                  style={{ fontFamily: "'Brush Script MT', 'Segoe Print', 'Lucida Handwriting', cursive", fontSize: "2.5rem" }}
                >
                  J. Anderson
                </div>
                <div className="w-[180px] h-[1px] bg-gray-500 mb-2" />
                <p className="text-[11px] text-gray-800 font-medium">
                  Authorized Signatory
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5 tracking-wider">
                  DigiCertify Platform
                </p>

                <div className="mt-10 text-center text-[10px] text-gray-400 font-mono">
                  Certificate ID: <br />
                  <span className="font-semibold text-gray-500">{certificate.id}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Download button ── */}
      {!hideButton && (
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full max-w-md mx-auto h-12 font-semibold text-base transition-all duration-300 border-0 mt-6 ${downloaded
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
