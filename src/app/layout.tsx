"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarNav from "@/components/custom/SidebarNav";
import QueryProvider from "./QueryProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/login");
  const router = useRouter();

  useEffect(() => {
    if (!isLogin) {
      if (typeof window !== "undefined" && localStorage.getItem("admin_session") !== "true") {
        router.push("/login");
      }
    }
  }, [isLogin, router]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {isLogin ? (
            children
          ) : (
            <SidebarProvider>
              <SidebarNav />
              <Toaster />
              {children}
            </SidebarProvider>
          )}
        </QueryProvider>
      </body>
    </html>
  );
}
