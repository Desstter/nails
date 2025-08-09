import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bella Nails Studio - Manicure y Pedicure Premium a Domicilio en Cali",
  description: "Manicure y pedicure de lujo a domicilio en Cali. Pago al finalizar, higiene certificada, 8 años de experiencia. Tu salón de belleza privado en casa.",
  keywords: "manicure a domicilio Cali, pedicure premium, uñas gel Cali, nail art domicilio, manicure profesional, belleza a domicilio Cali",
  authors: [{ name: "Claudia Shirley Lopez - Nail Artist Profesional" }],
  robots: "index, follow",
  openGraph: {
    title: "Bella Nails Studio - Manicure Premium a Domicilio en Cali",
    description: "Servicio de lujo de manicure y pedicure en tu hogar. Pago al finalizar, 500+ clientas satisfechas",
    type: "website",
    locale: "es_CO",
    siteName: "Bella Nails Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bella Nails Studio - Manicure Premium a Domicilio",
    description: "Tu salón de belleza privado en casa. Manicure y pedicure de lujo en Cali",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
