import React, { createContext, useContext, useState, ReactNode } from "react";

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

interface AppContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  students: Student[];
  setStudents: (s: Student[]) => void;
  certificates: Certificate[];
  addCertificate: (cert: Certificate) => void;
  incrementDownload: (certId: string) => void;
  findCertificate: (certId: string) => Certificate | undefined;
  findStudent: (usn: string) => Student | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const login = (username: string, password: string) => {
    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

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
  const findStudent = (usn: string) => students.find((s) => s.usn.toLowerCase() === usn.toLowerCase());

  return (
    <AppContext.Provider
      value={{ isAdmin, login, logout, students, setStudents, certificates, addCertificate, incrementDownload, findCertificate, findStudent }}
    >
      {children}
    </AppContext.Provider>
  );
};
