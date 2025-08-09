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
  title: "Bella Nails Studio - Manicure y Pedicure de Lujo a Domicilio en Cali",
  description: "Servicio premium de manicure y pedicure a domicilio en Cali. Para mujeres que valoran la elegancia y comodidad. Tu salón de belleza privado en casa.",
  keywords: "manicure a domicilio Cali, pedicure lujo, uñas premium, belleza domicilio, nail art Cali",
  openGraph: {
    title: "Bella Nails Studio - Manicure Premium a Domicilio",
    description: "Servicio exclusivo de manicure y pedicure en la comodidad de tu hogar en Cali",
    type: "website",
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
