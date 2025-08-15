import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
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
  title: "Joangel Nails Studio - Manicure y Pedicure Premium a Domicilio en Cali",
  description: "Manicure y pedicure de lujo a domicilio en Cali. Pago al finalizar, higiene certificada, 8 años de experiencia. Tu salón de belleza privado en casa.",
  keywords: "manicure a domicilio Cali, pedicure premium, uñas gel Cali, nail art domicilio, manicure profesional, belleza a domicilio Cali",
  authors: [{ name: "Claudia Shirley Lopez - Nail Artist Profesional" }],
  robots: "index, follow",
  openGraph: {
    title: "Joangel Nails Studio - Manicure Premium a Domicilio en Cali",
    description: "Servicio de lujo de manicure y pedicure en tu hogar. Pago al finalizar, 500+ clientas satisfechas",
    type: "website",
    locale: "es_CO",
    siteName: "Joangel Nails Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joangel Nails Studio - Manicure Premium a Domicilio",
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
      <head>
        {/* Google Ads Conversion Tracking - AW-17469563871 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17469563871"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Configuración principal de Google Ads
            gtag('config', 'AW-17469563871');
            
            // Función para trackear conversiones de WhatsApp
            window.trackWhatsAppClick = function() {
              gtag('event', 'conversion', {
                'send_to': 'AW-17469563871',
                'event_category': 'engagement',
                'event_label': 'whatsapp_click'
              });
            };
            
            // Función para trackear visualización de servicios
            window.trackServiceView = function(serviceName) {
              gtag('event', 'view_item', {
                'send_to': 'AW-17469563871',
                'event_category': 'service',
                'event_label': serviceName
              });
            };
          `}
        </Script>
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
