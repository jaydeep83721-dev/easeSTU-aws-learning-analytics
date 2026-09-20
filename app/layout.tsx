import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "easeSTU — Classroom understanding",
  description:
    "Offline assessments, clear learning insights and thoughtful support for teachers, principals and parents.",
  icons: {
    icon: "/easestu-mark.png",
    shortcut: "/easestu-mark.png",
    apple: "/easestu-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#078b87",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
