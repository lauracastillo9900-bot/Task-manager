import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "./providers";
import { LocaleProvider } from "@/context/LocaleContext";

export const metadata: Metadata = {
  title: "Task Calendar",
  description: "Task calendar with CRUD and localStorage persistence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LocaleProvider>
          <ClientProvider>{children}</ClientProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
