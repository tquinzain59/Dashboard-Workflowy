import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workflowy Dashboard",
  description: "Personal Workflowy Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
