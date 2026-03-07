import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Student {
  usn: string;
  name: string;
  course: string;
  score: number;
}

export interface Certificate {
  id: string;
  usn: string;
  name: string;
  course: string;
  score: number;
  issuedDate: string;
  downloads: number;
}

// ─── Template type ────────────────────────────────────────────────────────────
export interface CertificateTemplate {
  id: string;                // unique uuid-style id
  name: string;              // original file name
  dataUrl: string;           // base64 data URL (PNG or JPG)
  isActive: boolean;
  createdAt: string;         // ISO date string
}

const TEMPLATES_STORAGE_KEY = "digicertify_templates";

// ─── Context type ─────────────────────────────────────────────────────────────
interface AppContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  // Students
  students: Student[];
  setStudents: (s: Student[]) => void;
  // Certificates
  certificates: Certificate[];
  addCertificate: (cert: Certificate) => void;
  incrementDownload: (certId: string) => void;
  findCertificate: (certId: string) => Certificate | undefined;
  findStudent: (usn: string) => Student | undefined;
  // Templates
  templates: CertificateTemplate[];
  addTemplate: (name: string, dataUrl: string) => void;
  deleteTemplate: (id: string) => void;
  setActiveTemplate: (id: string) => void;
  activeTemplate: CertificateTemplate | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

// ─── Helper: load templates from localStorage ─────────────────────────────────
const loadTemplates = (): CertificateTemplate[] => {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CertificateTemplate[];
  } catch {
    /* ignore */
  }
  return [];
};

const saveTemplates = (templates: CertificateTemplate[]) => {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch {
    /* ignore – storage quota exceeded */
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>(loadTemplates);

  // Persist templates whenever they change
  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = (username: string, password: string) => {
    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  // ── Certificates ──────────────────────────────────────────────────────────
  const addCertificate = (cert: Certificate) => {
    setCertificates((prev) => {
      const exists = prev.find((c) => c.usn === cert.usn);
      if (exists) return prev;
      return [...prev, cert];
    });
  };

  const incrementDownload = (certId: string) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === certId ? { ...c, downloads: c.downloads + 1 } : c))
    );
  };

  const findCertificate = (certId: string) => certificates.find((c) => c.id === certId);
  const findStudent = (usn: string) =>
    students.find((s) => s.usn.toLowerCase() === usn.toLowerCase());

  // ── Templates ─────────────────────────────────────────────────────────────
  const addTemplate = (name: string, dataUrl: string) => {
    const newTemplate: CertificateTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      dataUrl,
      isActive: false,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const setActiveTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => ({ ...t, isActive: t.id === id }))
    );
  };

  const activeTemplate = templates.find((t) => t.isActive);

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        students,
        setStudents,
        certificates,
        addCertificate,
        incrementDownload,
        findCertificate,
        findStudent,
        templates,
        addTemplate,
        deleteTemplate,
        setActiveTemplate,
        activeTemplate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
