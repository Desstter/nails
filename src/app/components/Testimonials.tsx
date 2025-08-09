"use client";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Catalina Rodríguez",
      location: "Ciudad Jardín",
      rating: 5,
      comment: "Increíble servicio! Claudia Shirley Lopez es súper profesional y sus productos son de primera calidad. La comodidad de tener el servicio en casa no tiene precio. Mis uñas nunca habían lucido tan hermosas.",
      service: "Gel Premium",
      image: "CR"
    },
    {
      id: 2,
      name: "Isabel Montenegro", 
      location: "Santa Teresita",
      rating: 5,
      comment: "El mejor servicio de manicure que he tenido en Cali. Todo super higiénico, llegó puntual y el resultado quedó perfecto. Definitivamente volvería a solicitar el servicio.",
      service: "Tratamiento VIP",
      image: "IM"
    },
    {
      id: 3,
      name: "Alejandra Vargas",
      location: "El Peñón", 
      rating: 5,
      comment: "Excelente experiencia! Desde el primer contacto por WhatsApp hasta el servicio final, todo fue perfecto. Muy profesional y los precios son justos para la calidad que ofrece.",
      service: "Manicure Clásico",
      image: "AV"
    },
    {
      id: 4,
      name: "Valeria Castaño",
      location: "San Fernando",
      rating: 5,
      comment: "Me encantó el servicio! Es súper cómodo no tener que salir de casa y el trabajo quedó hermoso. Claudia Shirley Lopez es muy detallista y se nota su experiencia. 100% recomendado.",
      service: "Gel Premium",
      image: "VC"
    },
    {
      id: 5,
      name: "Daniela Herrera",
      location: "Pance",
      rating: 5,
      comment: "Primera vez que uso un servicio a domicilio y superó todas mis expectativas. Muy profesional, equipos de calidad y un trato excepcional. Ya tengo agendada mi próxima cita.",
      service: "Tratamiento VIP",
      image: "DH"
    },
    {
      id: 6,
      name: "Natalia Ospina",
      location: "Santa Rita",
      rating: 5,
      comment: "Servicio de 10! Muy responsable, puntual y el resultado es espectacular. Me encanta que use productos de tan buena calidad. Sin duda la recomiendo al 100%.",
      service: "Gel Premium",
      image: "NO"
    }
  ];

  const stats = [
    { number: "500+", label: "Clientes Satisfechas" },
    { number: "98%", label: "Satisfacción" },
    { number: "5.0", label: "Calificación Promedio" },
    { number: "8", label: "Años de Experiencia" }
  ];

  return (
    <section id="testimonios" className="section-padding bg-white">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <h2 className="text-luxury-lg mb-6">
            Lo que dicen nuestras <span className="gradient-gold">Clientas</span>
          </h2>
          <p className="text-premium max-w-2xl mx-auto">
            La satisfacción de nuestras clientas es nuestra mayor recompensa. 
            Lee lo que opinan sobre la experiencia Bella Nails Studio.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-gradient-to-br from-yellow-50 to-pink-50 rounded-xl p-6">
              <div className="text-3xl font-bold gradient-gold mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
                "{testimonial.comment}"
              </blockquote>

              {/* Client Info */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-medium text-sm">{testimonial.image}</span>
                </div>
                <h4 className="font-medium text-gray-800">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.location}</p>
                <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                  {testimonial.service}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonial Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl p-8 text-center border border-yellow-200">
          <h3 className="text-elegant mb-4">Video Testimonios</h3>
          <p className="text-premium mb-6">
            Escucha directamente de nuestras clientas sobre su experiencia con Bella Nails Studio
          </p>
          
          <div className="aspect-video bg-white rounded-xl shadow-soft flex items-center justify-center max-w-md mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Video testimonios disponibles</p>
              <p className="text-xs text-gray-500 mt-1">Próximamente</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-elegant mb-4">¿Lista para vivir la experiencia?</h3>
          <p className="text-premium mb-6">
            Únete a más de 500 mujeres que ya confían en Bella Nails Studio para el cuidado de sus uñas
          </p>
          <button 
            onClick={() => {
              const message = encodeURIComponent(
                "Hola! Leí los testimonios y me convencieron. Me gustaría agendar una cita para experimentar el servicio premium."
              );
              window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
            }}
            className="btn-primary mr-4"
          >
            Agendar Mi Primera Cita
          </button>
          <button 
            onClick={() => {
              window.open("https://instagram.com/bellanailsstudio", "_blank");
            }}
            className="btn-secondary"
          >
            Ver Más en Instagram
          </button>
        </div>
      </div>
    </section>
  );
}