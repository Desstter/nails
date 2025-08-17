import type { Metadata } from "next";
import ManageAppointment from "./components/ManageAppointment";

export const metadata: Metadata = {
  title: "Gestionar Cita - Joangel Nails Studio",
  description: "Consulta los detalles de tu cita, cancela o modifica información.",
  robots: "noindex, nofollow", // No indexar páginas de gestión
};

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ManageAppointmentPage({ params }: PageProps) {
  const { token } = await params;
  return <ManageAppointment token={token} />;
}