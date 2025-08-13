"use client";

import { useState } from 'react';

export default function Testimonials() {
  const [,] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Alejandra Vargas",
      rating: 5,
      comment: "Excelente experiencia! Muy profesional y los precios son justos para la calidad que ofrece.",
      service: "Uñas Acrílicas",
      image: "AV"
    },
    {
      id: 2,
      name: "Valeria Castaño",
      rating: 5,
      comment: "Me encantó el servicio! Es súper cómodo no tener que salir de casa y el trabajo quedó hermoso.",
      service: "Uñas Acrílicas",
      image: "VC"
    },
    {
      id: 3,
      name: "Daniela Herrera",
      rating: 5,
      comment: "Primera vez que uso un servicio a domicilio y superó todas mis expectativas. Muy profesional.",
      service: "Semi Permanente",
      image: "DH"
    }
  ];


  const stats = [
    { number: "500+", label: "Clientes Satisfechas" },
    { number: "98%", label: "Satisfacción" },
    { number: "5.0", label: "Calificación Promedio" },
    { number: "15", label: "Años de Experiencia" }
  ];

  const generateStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Joangel Nails Studio",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": testimonials.length,
      "bestRating": "5",
      "worstRating": "5"
    },
    "review": testimonials.map(testimonial => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": testimonial.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": "5"
      },
      "reviewBody": testimonial.comment,
      "publisher": {
        "@type": "Organization",
        "name": "Joangel Nails Studio"
      }
    }))
  });

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStructuredData()) }}
      />
      <section 
        id="testimonios" 
        className="section-padding bg-white"
        itemScope 
        itemType="https://schema.org/Organization"
      >
        <div className="container-luxury">
          <div className="text-center mb-12">
            <h2 className="text-luxury-lg mb-6">
              Testimonios de <span className="gradient-gold">Nuestras Clientas</span>
            </h2>
          </div>

          {/* Mobile testimonials */}
          <div className="block sm:hidden mb-8">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              
              <blockquote className="text-gray-700 text-center mb-6 italic">
                &ldquo;{testimonials[0].comment}&rdquo;
              </blockquote>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-medium text-sm">{testimonials[0].image}</span>
                </div>
                <h4 className="font-medium text-gray-800">{testimonials[0].name}</h4>
                <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                  {testimonials[0].service}
                </div>
              </div>
            </div>
          </div>

          {/* Professional profile section - mobile optimized */}
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl p-4 sm:p-8 shadow-luxury mb-8 sm:mb-16 border border-yellow-100">
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Professional profile */}
              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center shadow-elegant">
                    <span className="text-white text-2xl sm:text-3xl font-bold">SL</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800" itemProp="employee">Shirley Lopez</h3>
                    <p className="text-yellow-600 font-semibold">Nail Artist Certificada</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1 mt-1" itemProp="aggregateRating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">★</span>
                      ))}
                      <span className="text-gray-600 text-sm ml-2">5.0 • 15 años exp.</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-blue-600 text-xl flex-shrink-0">🎓</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Certificación Profesional</p>
                      <p className="text-gray-600 text-sm">Instituto de Belleza Integral - Cali</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-green-600 text-xl flex-shrink-0">🛡️</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Protocolo de Bioseguridad</p>
                      <p className="text-gray-600 text-sm">Certificada • Equipos esterilizados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics - mobile optimized */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-yellow-200">
                    <div className="text-2xl sm:text-3xl font-bold gradient-gold mb-1 sm:mb-2">{stat.number}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment methods - mobile optimized */}
            <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 text-center">
              <h4 className="text-lg font-bold text-gray-800 mb-4">💳 Métodos de Pago Aceptados</h4>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border">
                  <span className="text-lg">💵</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Efectivo</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border">
                  <span className="text-lg">📱</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Nequi</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border">
                  <span className="text-lg">🏦</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Transferencia</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 font-medium">
                ✅ Pago al finalizar el servicio • Sin anticipos requeridos
              </p>
            </div>
          </div>

          {/* Desktop testimonials grid - hidden on mobile */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-elegant transition-all duration-300 border border-gray-100"
              >
                {/* Rating Stars */}
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-gray-700 text-center mb-6 italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </blockquote>

                {/* Client Info */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-medium text-sm">{testimonial.image}</span>
                  </div>
                  <h4 className="font-medium text-gray-800">{testimonial.name}</h4>
                  <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                    {testimonial.service}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Call to Action */}
          <div className="text-center mt-12">
            <h3 className="text-elegant mb-4">¿Lista para vivir la experiencia?</h3>
            <p className="text-premium mb-6">
              Únete a más de 500 mujeres que ya confían en Joangel Nails Studio
            </p>
            <button 
              onClick={() => {
                const message = encodeURIComponent(
                  "Hola! Leí los testimonios y me convencieron. Me gustaría agendar una cita."
                );
                window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
              }}
              className="btn-primary"
            >
              Reservar Ahora
            </button>
          </div>
      </div>
      </section>
    </>
  );
}