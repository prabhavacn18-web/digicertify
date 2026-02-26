# DigiCertify

A secure digital certificate generation and verification platform built with React, TypeScript, and Vite.

## Features

- 🎓 **Certificate Generation** – Generate professional Coursera-style completion certificates for students
- 🔍 **Certificate Verification** – Verify certificates via unique Certificate ID or QR code scan
- 👨‍💼 **Admin Dashboard** – Upload student CSV data and manage all certificates
- 📄 **PDF Export** – Download pixel-perfect A4 landscape PDF certificates
- 🔒 **Secure** – Each certificate has a unique ID and QR code linking to `digicertify.com/verify`

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** + **shadcn/ui** (styling)
- **jsPDF** + **html2canvas** (PDF generation)
- **react-qr-code** (QR code generation)

## Getting Started

```sh
# 1. Clone the repository
git clone https://github.com/prabhavacn18-web/digicertify.git

# 2. Navigate into the project
cd digicertify

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Project Structure

```
src/
├── components/
│   ├── CertificatePreview.tsx   # Certificate preview + PDF export
│   └── ui/                      # shadcn/ui components
├── pages/
│   ├── Index.tsx                # Landing page
│   ├── AdminLogin.tsx           # Admin login
│   ├── AdminDashboard.tsx       # CSV upload & certificate management
│   ├── CertificateGenerate.tsx  # Generate & bulk-download certificates
│   └── CertificateVerify.tsx    # Public verification page
└── context/
    └── AppContext.tsx            # Global state (students, certificates)
```

## License

MIT
