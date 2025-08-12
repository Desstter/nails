export default function About() {
  return (
    <section id="nosotros" className="section-padding bg-white">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-luxury-lg mb-6">
              Experiencia y <span className="gradient-gold">Profesionalismo</span>
            </h2>
            
            <p className="text-premium mb-6">
              Con más de 8 años de experiencia en el mundo de la belleza y las uñas, 
              me especializo en brindar servicios premium de manicure y pedicure en la 
              comodidad de tu hogar.
            </p>

            <p className="text-premium mb-8">
              Mi pasión por la perfección y el detalle me ha llevado a capacitarme 
              constantemente en las últimas técnicas y tendencias, siempre utilizando 
              productos de la más alta calidad para garantizar resultados excepcionales.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-yellow-50 rounded-xl p-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Certificación Profesional</h4>
                <p className="text-sm text-gray-600">
                  Certificada en técnicas avanzadas de nail art y cuidado de uñas
                </p>
              </div>

              <div className="bg-pink-50 rounded-xl p-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Productos Premium</h4>
                <p className="text-sm text-gray-600">
                  Solo productos de marcas reconocidas y de alta calidad
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Protocolos de Higiene</h4>
                <p className="text-sm text-gray-600">
                  Estrictos estándares de limpieza y esterilización
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Puntualidad</h4>
                <p className="text-sm text-gray-600">
                  Respeto absoluto por tu tiempo y agenda
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-xl p-6 border border-yellow-200">
              <h4 className="font-medium text-gray-800 mb-3">Mi Compromiso Contigo</h4>
              <p className="text-sm text-gray-600">
                "Cada cliente es única y especial. Mi objetivo es no solo embellecer tus uñas, 
                sino brindarte una experiencia relajante y de lujo que te haga sentir mimada y especial. 
                Tu satisfacción es mi mayor recompensa."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">C</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Shirley Lopez</p>
                  <p className="text-xs text-gray-500">Fundadora & Nail Artist</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-yellow-50 to-pink-50 rounded-3xl shadow-elegant overflow-hidden">
              {/* Placeholder for about image */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-elegant text-gray-700 mb-4">
                    Shirley Lopez
                  </h3>
                  <p className="text-premium">
                    "Tu belleza es mi inspiración"
                  </p>
                  <div className="mt-6 flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">15 años de experiencia</p>
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-elegant">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">500+</div>
                <div className="text-xs text-gray-600">Clientes felices</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-elegant">
              <div className="text-center">
                <div className="text-xl font-bold text-pink-600">98%</div>
                <div className="text-xs text-gray-600">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}