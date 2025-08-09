"use client";

export default function Services() {
  const services = [
    {
      id: "classic",
      name: "Manicure Clásico",
      price: "COP $45.000",
      duration: "45 min",
      description: "Manicure completo con limado, cutícula, hidratación y esmaltado clásico",
      features: [
        "Limado y forma perfecta",
        "Cuidado de cutículas",
        "Exfoliación suave",
        "Hidratación profunda",
        "Esmaltado clásico",
        "Secado profesional"
      ],
      popular: false
    },
    {
      id: "gel-premium",
      name: "Gel Premium",
      price: "COP $70.000",
      duration: "60 min",
      description: "Manicure gel con duración de hasta 3 semanas, perfecto para manos impecables. ¡2x1 en tu primera cita!",
      features: [
        "Todo lo del servicio clásico",
        "Esmaltado gel premium",
        "Duración 2-3 semanas",
        "Brillo perfecto",
        "Resistente al agua",
        "Secado UV/LED"
      ],
      popular: false
    },
    {
      id: "semi-permanent",
      name: "Semi Permanente",
      price: "COP $80.000",
      duration: "75 min",
      description: "Mi especialidad. Técnica avanzada semi permanente con acabado profesional de hasta 4 semanas",
      features: [
        "Preparación especializada de uñas",
        "Base adherente profesional",
        "Esmaltado semi permanente premium",
        "Técnica de aplicación exclusiva",
        "Duración 3-4 semanas",
        "Acabado ultra brillante",
        "Curado LED de alta calidad",
        "Resistente a golpes y agua"
      ],
      popular: true,
      specialty: true
    },
    {
      id: "vip-treatment",
      name: "Tratamiento VIP",
      price: "COP $95.000",
      duration: "90 min",
      description: "Experiencia completa de lujo con manicure, pedicure y tratamiento de manos",
      features: [
        "Manicure gel premium",
        "Pedicure completo",
        "Masaje relajante",
        "Mascarilla nutritiva",
        "Aceites esenciales",
        "Experiencia spa completa"
      ],
      popular: false
    }
  ];

  const handleBookService = (serviceName: string) => {
    const message = encodeURIComponent(
      `Hola! Me interesa agendar el servicio "${serviceName}". ¿Podrían darme más información sobre disponibilidad y confirmar el precio?`
    );
    window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
  };

  return (
    <section id="servicios" className="section-padding bg-white">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <h2 className="text-luxury-lg mb-6">
            Nuestros <span className="gradient-gold">Servicios Premium</span>
          </h2>
          <p className="text-premium max-w-2xl mx-auto">
            Cada servicio está diseñado para brindarte la máxima comodidad y elegancia. 
            Utilizamos solo productos de la más alta calidad y técnicas profesionales.
          </p>
        </div>

        {/* Carrusel de servicios */}
        <div className="relative mb-12">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-6" style={{width: 'fit-content'}}>
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative bg-white rounded-2xl p-8 shadow-elegant hover:shadow-luxury transition-all duration-300 border-2 flex-shrink-0 w-80 ${
                service.specialty
                  ? "border-purple-300 transform hover:scale-105 ring-2 ring-purple-100" 
                  : service.popular 
                  ? "border-yellow-300 transform hover:scale-105" 
                  : "border-gray-100 hover:border-yellow-200"
              }`}
            >
              {service.popular && !service.specialty && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
              )}
              {service.specialty && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    ⭐ MI ESPECIALIDAD
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-elegant mb-2">{service.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold gradient-gold">{service.price}</span>
                  <span className="text-gray-500 text-sm">/ {service.duration}</span>
                </div>
                <p className="text-premium text-sm">{service.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBookService(service.name)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                  service.specialty
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105"
                    : service.popular
                    ? "btn-primary"
                    : "bg-gray-50 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 border border-gray-200 hover:border-yellow-300"
                }`}
              >
                {service.specialty ? "Reservar Mi Especialidad" : `Agendar ${service.name}`}
              </button>

              {/* Payment Methods */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>Pago al finalizar:</span>
                  <div className="flex gap-2">
                    <span title="Efectivo">💵</span>
                    <span title="Nequi">📱</span>
                    <span title="Transferencia">🏦</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
          
          {/* Indicador de scroll */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              ← Desliza para ver todos los servicios →
            </p>
          </div>
        </div>

        {/* Promoción Especial */}
        <div className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-2xl p-8 text-center border-2 border-yellow-300 mb-8">
          <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            🎉 OFERTA ESPECIAL - PRIMERA CITA
          </div>
          <h3 className="text-elegant mb-4 text-2xl">¡2x1 en Gel Premium!</h3>
          <p className="text-premium mb-6 text-lg">
            En tu primera visita, lleva a una amiga y <strong>ambas pagan solo $70.000</strong> por el Gel Premium.
            <br />
            <span className="text-sm text-gray-600">*Válido solo para nuevas clientas. Una promoción por persona.</span>
          </p>
          <button
            onClick={() => handleBookService("Promoción 2x1 Gel Premium - Primera Cita")}
            className="btn-primary text-lg px-8 py-4"
          >
            Aprovechar Promoción 2x1
          </button>
        </div>

        {/* Additional info */}
        <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl p-8 text-center">
          <h3 className="text-elegant mb-4">¿Necesitas algo personalizado?</h3>
          <p className="text-premium mb-6">
            También ofrecemos servicios personalizados para eventos especiales, 
            bodas y celebraciones. Consulta por nuestros paquetes grupales.
          </p>
          <button
            onClick={() => handleBookService("Servicio Personalizado")}
            className="btn-secondary"
          >
            Consultar Servicio Personalizado
          </button>
        </div>
      </div>
    </section>
  );
}