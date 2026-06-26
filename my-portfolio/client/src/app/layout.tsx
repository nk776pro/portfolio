import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Systems & Web Portfolio",
  description: "Personal site of a full-stack developer working with Next.js, Node.js, and Verilog logic design. Independent code and deployment pipelines.",
  keywords: ["Backend Developer", "VLSI Design", "Next.js", "PostgreSQL", "Systems Engineering"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "Your Name",
      "jobTitle": "Hardware-Software Infrastructure Engineer",
      "knowsAbout": ["Full-Stack Development", "Docker Containerization", "Asynchronous Systems", "Verilog Design"]
    }
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />
      </head>
      <body className="bg-[#0c0d0e] text-[#00ff66] font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
