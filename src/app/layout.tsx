import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { FormCodesProvider } from "@/providers/form-codes-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";
import { validateRequest } from "@/lib/lucia";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Form Codes Management",
  description: "Ứng dụng quản lý form codes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await validateRequest();

  return (
    <html suppressHydrationWarning>
      <body className={`${beVietnamPro.className} antialiased`}>
        <AuthProvider initialUser={user}>
          <FormCodesProvider>
            <Toaster
              position="top-right"
              richColors
              duration={5000}
              closeButton
            />
            {children}
          </FormCodesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
