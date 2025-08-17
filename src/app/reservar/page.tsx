import type { Metadata } from "next";
import ReservationPage from "./components/ReservationPage";

export const metadata: Metadata = {
  title: "Reserva tu Cita - Joangel Nails Studio | Manicure Premium a Domicilio",
  description: "Agenda tu cita de manicure premium a domicilio en Cali. Proceso rápido, sin pago anticipado. ¡Descuento especial por reservar online!",
  keywords: "reservar cita manicure, agenda manicure Cali, reserva online nail art, cita domicilio belleza",
  openGraph: {
    title: "🗓️ Reserva tu Cita - Joangel Nails Studio",
    description: "✨ Manicure premium a domicilio en Cali. Reserva en 2 minutos, sin pago anticipado. ¡Descuento especial online!",
    type: "website",
    locale: "es_CO",
    siteName: "Joangel Nails Studio",
    images: [
      {
        url: "/images/medium/Arte-celestial-en-unas-elegantes.webp",
        width: 1200,
        height: 630,
        alt: "Joangel Nails Studio - Reserva tu cita de manicure premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🗓️ Reserva tu Cita - Joangel Nails Studio",
    description: "✨ Manicure premium a domicilio en Cali. ¡Reserva en 2 minutos!",
    images: ["/images/medium/Arte-celestial-en-unas-elegantes.webp"],
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://joangelnails.com/reservar",
  },
};

export default function ReservarPage() {
  return <ReservationPage />;
}