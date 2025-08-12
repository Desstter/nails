"use client";

export default function Contact() {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "Hola! Me gustaría obtener más información sobre sus servicios de manicure y pedicure premium a domicilio."
    );
    window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
  };

  const handleInstagramContact = () => {
    window.open("https://instagram.com/joangel_nails", "_blank");
  };

  const serviceAreas = [
    "Ciudad Jardín",
    "Santa Teresita", 
    "El Peñón",
    "San Fernando",
    "Santa Rita",
    "Pance",
    "La Hacienda",
    "Bochalema"
  ];

  return (
    <section id="contacto" className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <h2 className="text-luxury-lg mb-6">
            Agenda tu <span className="gradient-gold">Cita Premium</span>
          </h2>
          <p className="text-premium max-w-2xl mx-auto">
            Estamos aquí para brindarte la mejor experiencia de belleza en la comodidad de tu hogar. 
            Contáctanos para agendar tu cita o resolver cualquier duda.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form / Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-elegant">
              <h3 className="text-elegant mb-6">¿Cómo agendar?</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Contacta por WhatsApp</h4>
                    <p className="text-gray-600 text-sm">
                      Envíanos un mensaje indicando el servicio que deseas y tu ubicación en Cali.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Confirmamos disponibilidad</h4>
                    <p className="text-gray-600 text-sm">
                      Te confirmaremos la fecha y hora disponible más conveniente para ti.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Llegamos a tu hogar</h4>
                    <p className="text-gray-600 text-sm">
                      Nos desplazamos con todo el equipo profesional y productos premium.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleWhatsAppContact}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
                  </svg>
                  Reservar Ahora
                </button>
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-2xl p-8 shadow-elegant">
              <h3 className="text-elegant mb-6">Zonas de Servicio en Cali</h3>
              <div className="grid grid-cols-2 gap-3">
                {serviceAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                *¿Tu zona no aparece? Contáctanos, podemos evaluar la cobertura.
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            {/* WhatsApp Card */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">WhatsApp</h4>
                  <p className="text-green-600 font-medium">+57 318 722 9548</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Respuesta inmediata • Disponible de 7:00 AM a 9:00 PM
              </p>
              <button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Chatear ahora
              </button>
            </div>

            {/* Instagram Card */}
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Instagram</h4>
                  <p className="text-pink-600 font-medium">@joangel_nails</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Ve nuestro trabajo y últimas tendencias en uñas
              </p>
              <button
                onClick={handleInstagramContact}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Seguir en Instagram
              </button>
            </div>

            {/* Hours Card */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h4 className="font-medium text-gray-800 mb-4">Horarios de Atención</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lunes - Viernes</span>
                  <span className="text-gray-800 font-medium">7:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sábados</span>
                  <span className="text-gray-800 font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Domingos</span>
                  <span className="text-gray-800 font-medium">9:00 AM - 5:00 PM</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                *Citas de emergencia fuera de horario con recargo del 20%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}