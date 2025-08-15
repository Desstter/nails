import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400","600","700"],
  fallback: ["Georgia", "serif"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
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
        {/* Preload critical fonts for better LCP performance */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
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
            
            // Tracking de scroll depth
            window.trackScrollDepth = function(percentage) {
              gtag('event', 'scroll', {
                'send_to': 'AW-17469563871',
                'event_category': 'engagement',
                'event_label': 'scroll_' + percentage + '_percent',
                'value': percentage
              });
            };
            
            // Tracking de tiempo en página
            window.trackTimeOnPage = function(seconds) {
              gtag('event', 'timing_complete', {
                'send_to': 'AW-17469563871',
                'event_category': 'engagement',
                'event_label': 'time_on_page_' + seconds + 's',
                'value': seconds
              });
            };
            
            // Tracking de interacciones con galería
            window.trackGalleryInteraction = function(action, category) {
              gtag('event', 'select_content', {
                'send_to': 'AW-17469563871',
                'event_category': 'gallery',
                'event_label': action + '_' + category,
                'content_type': 'gallery'
              });
            };
            
            // Tracking de engagement con carrusel
            window.trackCarouselInteraction = function(action, service) {
              gtag('event', 'select_content', {
                'send_to': 'AW-17469563871',
                'event_category': 'carousel',
                'event_label': action + '_' + service,
                'content_type': 'service_carousel'
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
