import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "John Luis Magtoto — Android & Full-Stack Software Developer",
  description: "John Luis Magtoto is a UP Computer Science graduate and software developer specializing in Android, full-stack web development, enterprise WMS solutions, Java, C# MVC, Oracle, and PostgreSQL.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
