"use client";

export default function TrustSection() {
  const trustFeatures = [
    {
      icon: "🛡️",
      title: "Pago al finalizar",
      description: "Solo pagas cuando estés completamente satisfecha con el servicio",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    {
      icon: "💳",
      title: "Efectivo o Nequi",
      description: "Acepta efectivo, Nequi, Bancolombia y transferencias",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200", 
      textColor: "text-blue-700"
    },
    {
      icon: "✅",
      title: "100% Satisfacción Garantizada",
      description: "Si no quedas feliz, no cobro. Tu satisfacción es mi prioridad",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700"
    }
  ];

  const paymentMethods = [
    { name: "Efectivo", icon: "💵" },
    { name: "Nequi", icon: "📱" },
    { name: "Bancolombia", icon: "🏦" },
    { name: "Transferencia", icon: "💰" }
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="container-luxury">
        {/* Main Trust Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-elegant mb-6">
            <span className="text-2xl">🔒</span>
            <span className="font-medium text-gray-800">100% Seguro y Confiable</span>
          </div>
          
          <h2 className="text-luxury-lg mb-6">
            <span className="gradient-gold">Cero Riesgo</span> para Ti
          </h2>
          
          <p className="text-premium max-w-3xl mx-auto mb-8">
            Entendemos tus preocupaciones sobre estafas online. Por eso, trabajamos con total transparencia: 
            <strong className="text-gray-800"> no pagas nada por adelantado, solo cuando estés feliz con tu servicio.</strong>
          </p>
        </div>

        {/* Trust Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-2xl p-6 text-center hover:shadow-elegant transition-all duration-300`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className={`text-xl font-semibold ${feature.textColor} mb-3`}>
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Professional Profile */}
        <div className="bg-white rounded-3xl p-8 shadow-luxury mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Profile Image & Info */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center shadow-elegant">
                  <span className="text-white text-2xl font-bold">CS</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800">Shirley Lopez</h3>
                  <p className="text-yellow-600 font-medium">Nail Artist Profesional</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                    <span className="text-gray-500 text-sm ml-2">15 años de experiencia</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-green-600 text-xl">📱</span>
                  <span className="font-medium text-green-700">Habla directo con la profesional</span>
                </div>
                <p className="text-green-600 text-sm">
                  No intermediarios, no bots. Hablas directamente conmigo por WhatsApp
                </p>
              </div>
            </div>

            {/* Credentials & Certifications */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Mis Credenciales</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <span className="text-blue-600 text-xl">🎓</span>
                  <div>
                    <p className="font-medium text-gray-800">Certificación Profesional</p>
                    <p className="text-gray-600 text-sm">Instituto de Belleza Integral - Cali</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <span className="text-green-600 text-xl">🏆</span>
                  <div>
                    <p className="font-medium text-gray-800">500+ Clientas Satisfechas</p>
                    <p className="text-gray-600 text-sm">98% de satisfacción comprobada</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <span className="text-purple-600 text-xl">🛡️</span>
                  <div>
                    <p className="font-medium text-gray-800">Protocolo de Higiene</p>
                    <p className="text-gray-600 text-sm">Certificada en bioseguridad</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <span className="text-yellow-600 text-xl">📍</span>
                  <div>
                    <p className="font-medium text-gray-800">Caleña de Corazón</p>
                    <p className="text-gray-600 text-sm">Nacida y criada en Cali</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-6 shadow-elegant text-center">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Métodos de Pago Aceptados</h4>
          <p className="text-gray-600 mb-6">Paga como prefieras, siempre al finalizar el servicio</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <span className="text-lg">{method.icon}</span>
                <span className="text-gray-700 font-medium">{method.name}</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            *No se requiere pago anticipado ni depósitos
          </p>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-12">
          <p className="text-premium mb-6">
            ¿Aún tienes dudas? Escríbeme por WhatsApp y resolvemos todas tus preguntas
          </p>
          <button 
            onClick={() => {
              const message = encodeURIComponent(
                "Hola Claudia! Vi tu página web y me da mucha confianza que no se pague por adelantado. Me gustaría hacerte algunas preguntas sobre el servicio."
              );
              window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <span className="text-xl">💬</span>
            Hacer Preguntas por WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}