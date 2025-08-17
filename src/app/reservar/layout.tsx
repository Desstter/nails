import Script from "next/script";

export default function ReservarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Tracking específico para página de reservas */}
      <Script id="reservar-page-tracking" strategy="afterInteractive">
        {`
          if (typeof window !== 'undefined' && window.gtag) {
            // Configuración específica para la página de reservas
            window.gtag('config', 'AW-17469563871', {
              page_title: 'Página de Reservas',
              custom_map: {'custom_parameter': 'booking_funnel'}
            });
            
            // Función para trackear eventos de reserva específicos
            window.trackBookingStep = function(step, data = {}) {
              window.gtag('event', 'booking_step', {
                'send_to': 'AW-17469563871',
                'event_category': 'booking_funnel',
                'event_label': step,
                'custom_parameter': 'booking_page',
                ...data
              });
            };
            
            // Función para trackear conversiones exitosas
            window.trackBookingSuccess = function(appointmentId, value, serviceId) {
              window.gtag('event', 'conversion', {
                'send_to': 'AW-17469563871',
                'value': value,
                'currency': 'COP',
                'transaction_id': appointmentId,
                'event_category': 'booking_completed',
                'custom_parameter': 'direct_booking'
              });
              
              // Evento de purchase para e-commerce tracking
              window.gtag('event', 'purchase', {
                'send_to': 'AW-17469563871',
                'transaction_id': appointmentId,
                'value': value,
                'currency': 'COP',
                'items': [{
                  'item_id': serviceId,
                  'item_name': 'Servicio de Manicure',
                  'category': 'beauty_service',
                  'quantity': 1,
                  'price': value
                }]
              });
            };
            
            // Función para trackear errores en el booking
            window.trackBookingError = function(error, step) {
              window.gtag('event', 'exception', {
                'description': 'booking_error_' + step + '_' + error,
                'fatal': false,
                'custom_parameter': 'booking_error'
              });
            };
          }
        `}
      </Script>
      {children}
    </>
  );
}