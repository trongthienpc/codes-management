import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { FormCodesProvider } from "@/providers/form-codes-provider";
import { Toaster } from "sonner";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Form Codes Management",
  description: "Ứng dụng quản lý form codes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${beVietnamPro.className} antialiased`}>
        <FormCodesProvider>
          <Toaster position="top-right" richColors duration={5000} />
          {children}
        </FormCodesProvider>
      </body>
    </html>
  );
}
