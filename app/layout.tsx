import type { Metadata } from "next";
import AuthProvider from "@/components/SessionProvider";
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
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
