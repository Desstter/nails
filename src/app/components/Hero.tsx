"use client";

import { useState } from "react";

export default function Hero() {
  const [showBooking, setShowBooking] = useState(false);

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(
      "Hola! Me interesa agendar una cita de manicure y pedicure premium a domicilio. ¿Podrían darme más información sobre sus servicios?"
    );
    window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
  };

  return (
    <section className="relative min-h-screen flex items-center bg-luxury overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full blur-2xl"></div>
      </div>

      <div className="container-luxury relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 mb-6">
                ✨ Servicio Premium a Domicilio en Cali
              </span>
            </div>
            
            <h1 className="text-luxury-xl mb-6">
              Tu salón de belleza{" "}
              <span className="gradient-gold">privado</span>{" "}
              en la comodidad de tu hogar
            </h1>
            
            <p className="text-premium mb-6 max-w-xl mx-auto lg:mx-0">
              Manicure y pedicure de lujo para mujeres que valoran la excelencia, 
              la comodidad y la exclusividad. Nos desplazamos hasta tu hogar con 
              todo el equipamiento profesional.
            </p>

            {/* Beneficios clave */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto lg:mx-0">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-600 text-2xl mb-2">🛡️</div>
                <h3 className="font-semibold text-green-700 mb-1">Pago al finalizar</h3>
                <p className="text-green-600 text-xs">Solo cuando estés satisfecha</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-blue-600 text-2xl mb-2">🧼</div>
                <h3 className="font-semibold text-blue-700 mb-1">Higiene certificada</h3>
                <p className="text-blue-600 text-xs">Protocolo de bioseguridad</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-purple-600 text-2xl mb-2">📍</div>
                <h3 className="font-semibold text-purple-700 mb-1">Zonas de servicio</h3>
                <p className="text-purple-600 text-xs">Sur de Cali y alrededores</p>
              </div>
            </div>

            {/* CTA principal */}
            <div className="text-center lg:text-left mb-6">
              <button
                onClick={handleWhatsAppBooking}
                className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
                </svg>
                Reservar Ahora
              </button>
            </div>

            {/* Indicadores de confianza simplificados */}
            <div className="text-center lg:text-left text-sm text-gray-600">
              <p>500+ clientas satisfechas • 15 años experiencia • Caleña profesional</p>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-pink-100 to-yellow-100 rounded-3xl shadow-luxury overflow-hidden">
              {/* Placeholder for hero image */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-yellow-50">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-4xl">💅</span>
                  </div>
                  <h3 className="text-elegant text-gray-700 mb-4">
                    Bella Nails Studio
                  </h3>
                  <p className="text-premium">
                    Elegancia y comodidad<br />
                    en cada detalle
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Disponible ahora</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-elegant">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">5.0</div>
                <div className="text-xs text-gray-600">★★★★★</div>
                <div className="text-xs text-gray-500">Clientes satisfechas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}