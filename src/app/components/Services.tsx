"use client";
import { useState, useCallback, useRef, useEffect } from 'react';

export default function Services() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const services = [
    {
      id: "semi-permanent",
      name: "✨ Semi Permanente Premium",
      price: "COP $50.000",
      duration: "75 min",
      description: "Técnica avanzada con acabado profesional de hasta 4 semanas. Ideal para manos impecables y brillantes por más tiempo.",
      features: [
        "✅ Preparación especializada de uñas",
        "✅ Base adherente profesional",
        "✅ Esmaltado semi permanente premium",
        "✅ Técnica de aplicación exclusiva",
        "✅ Duración 3-4 semanas",
        "✅ Acabado ultra brillante",
        "✅ Curado LED de alta calidad",
        "✅ Resistente a golpes y agua",
        "✅ Incluye exfoliación y trato VIP"
      ],
      popular: false,
      specialty: false
    },
    {
      id: "acrylic-mold",
      name: "💅 Uñas Acrílicas con Molde",
      price: "COP $100.000",
      duration: "120 min",
      description: "Diseño estructural personalizado para mayor resistencia y elegancia.",
      features: [
        "✅ Extensión con molde profesional",
        "✅ Acrílico de alta calidad",
        "✅ Forma y largo a elección",
        "✅ Acabado resistente y natural",
        "✅ Curado y sellado perfecto",
        "✅ Incluye exfoliación y trato VIP"
      ],
      popular: true,
      specialty: true
    },
    {
      id: "acrylic-coating",
      name: "💖 Forrado en Acrílico",
      price: "COP $85.000",
      duration: "90 min",
      description: "Refuerzo ideal para uñas naturales, más fuertes y duraderas sin perder la naturalidad.",
      features: [
        "✅ Cobertura completa con acrílico",
        "✅ Mayor dureza y resistencia",
        "✅ Acabado liso y brillante",
        "✅ Protección contra quiebres",
        "✅ Incluye exfoliación y trato VIP"
      ],
      popular: false,
      specialty: false
    },
    {
      id: "acrylic-tips",
      name: "🌟 Uñas Acrílicas con Tips",
      price: "COP $80.000",
      duration: "100 min",
      description: "Extensiones rápidas y perfectas para lucir uñas largas y estilizadas.",
      features: [
        "✅ Aplicación con tips profesionales",
        "✅ Acrílico duradero",
        "✅ Forma y largo a elección",
        "✅ Acabado brillante",
        "✅ Incluye exfoliación y trato VIP"
      ],
      popular: false,
      specialty: false
    }
  ];

  const handleBookService = (serviceName: string) => {
    const message = encodeURIComponent(
      `Hola! Me interesa agendar el servicio "${serviceName}". ¿Podrían darme más información sobre disponibilidad y confirmar el precio?`
    );
    window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
  };


  const scrollToSlide = useCallback((slideIndex: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const cardWidth = window.innerWidth < 768 ? 320 + 16 : 384 + 24; // w-80 + gap-4 or w-96 + gap-6
    const scrollPosition = slideIndex * cardWidth;
    
    carousel.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
    
    setCurrentSlide(slideIndex);
  }, []);

  const nextSlide = useCallback(() => {
    const nextIndex = currentSlide < services.length - 1 ? currentSlide + 1 : 0;
    scrollToSlide(nextIndex);
  }, [currentSlide, services.length, scrollToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = currentSlide > 0 ? currentSlide - 1 : services.length - 1;
    scrollToSlide(prevIndex);
  }, [currentSlide, services.length, scrollToSlide]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let startX: number;
    let startY: number;
    let isScrolling: boolean | undefined;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      isScrolling = undefined;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling === undefined) {
        const deltaX = Math.abs(e.touches[0].pageX - startX);
        const deltaY = Math.abs(e.touches[0].pageY - startY);
        
        // Determine if scrolling horizontally or vertically
        isScrolling = deltaY > deltaX;
        
        // If scrolling vertically, allow page scroll
        if (isScrolling) {
          carousel.style.touchAction = 'pan-y';
        } else {
          // If scrolling horizontally, allow carousel scroll
          carousel.style.touchAction = 'pan-x';
        }
      }
      
      // If trying to scroll vertically, don't prevent default
      if (isScrolling) {
        return;
      }
    };

    const handleTouchEnd = () => {
      // Reset touch action
      carousel.style.touchAction = 'pan-x pan-y';
      isScrolling = undefined;
    };

    // Handle scroll to update current slide
    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = window.innerWidth < 768 ? 320 + 16 : 384 + 24;
      const newSlide = Math.round(scrollLeft / cardWidth);
      
      if (newSlide !== currentSlide && newSlide >= 0 && newSlide < services.length) {
        setCurrentSlide(newSlide);
      }
    };

    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
    carousel.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      carousel.removeEventListener('touchstart', handleTouchStart);
      carousel.removeEventListener('touchmove', handleTouchMove);
      carousel.removeEventListener('touchend', handleTouchEnd);
      carousel.removeEventListener('scroll', handleScroll);
    };
  }, [currentSlide, services.length]);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

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
        <div className="relative mb-12 carousel-container">
          {/* Botones de navegación - Solo en móvil */}
          <button
            onClick={prevSlide}
            className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:text-yellow-600 carousel-nav-btn btn-touch"
            aria-label="Servicio anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:text-yellow-600 carousel-nav-btn btn-touch"
            aria-label="Siguiente servicio"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div ref={carouselRef} className="overflow-x-auto scrollbar-hide scroll-smooth carousel-scroller">
            <div className="flex gap-4 md:gap-6 pb-6 px-4 md:px-0 snap-x snap-mandatory mobile-optimized" style={{width: 'fit-content'}}>
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative bg-white rounded-2xl p-6 md:p-8 shadow-elegant hover:shadow-luxury transition-all duration-300 border-2 flex-shrink-0 w-80 md:w-96 snap-center service-card-mobile ${
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
                    ⭐ NUESTRA ESPECIALIDAD
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-elegant mb-2 text-lg md:text-xl">{service.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-2xl md:text-3xl font-bold gradient-gold">{service.price}</span>
                  <span className="text-gray-500 text-sm">/ {service.duration}</span>
                </div>
                <p className="text-premium text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              <ul className="space-y-2 md:space-y-3 mb-8">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-xs md:text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBookService(service.name)}
                className={`w-full py-4 md:py-3 px-6 rounded-lg font-medium transition-all duration-300 min-h-[48px] btn-touch ${
                  service.specialty
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 active:scale-95"
                    : service.popular
                    ? "btn-primary active:scale-95"
                    : "bg-gray-50 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 border border-gray-200 hover:border-yellow-300 active:scale-95"
                }`}
              >
                <span className="text-sm md:text-base">Reservar Ahora</span>
              </button>

              {/* Payment Methods */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Pago al finalizar:</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                      <span className="text-lg">💵</span>
                      <span className="text-xs text-gray-600 hidden sm:block">Efectivo</span>
                    </div>
                    <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full">
                      <span className="text-lg">📱</span>
                      <span className="text-xs text-gray-600 hidden sm:block">Nequi</span>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                      <span className="text-lg">🏦</span>
                      <span className="text-xs text-gray-600 hidden sm:block">Transferencia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
          
          {/* Indicador de scroll */}
          <div className="text-center mt-4">
            {/* Indicadores de posición - Solo en móvil */}
            <div className="flex items-center justify-center gap-4 md:hidden">
              <div className="flex items-center gap-2">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`rounded-full carousel-dot ${
                      index === currentSlide 
                        ? 'bg-yellow-400 w-6 h-2 active' 
                        : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                    }`}
                    aria-label={`Ir al servicio ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 ml-2">
                {currentSlide + 1} de {services.length}
              </p>
            </div>
            
            <p className="hidden md:block text-sm text-gray-500">
              ← Desliza para ver todos los servicios →
            </p>
          </div>
        </div>

        {/* Promoción Especial */}
        <div className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-2xl p-6 md:p-8 text-center border-2 border-yellow-300 mb-8">
          <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold mb-3 md:mb-4">
            🎉 OFERTA ESPECIAL - PRIMERA CITA
          </div>
          <h3 className="text-elegant mb-3 md:mb-4 text-xl md:text-2xl">¡2x1 en Gel Premium!</h3>
          <p className="text-premium mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
            En tu primera visita, lleva a una amiga y <strong>ambas pagan solo $70.000</strong> por el Gel Premium.
            <br className="hidden md:block" />
            <span className="block md:inline text-sm text-gray-600 mt-2 md:mt-0">*Válido solo para nuevas clientas. Una promoción por persona.</span>
          </p>
          <button
            onClick={() => handleBookService("Promoción 2x1 Gel Premium - Primera Cita")}
            className="btn-primary text-base md:text-lg px-6 md:px-8 py-4 min-h-[48px] btn-touch active:scale-95"
          >
            Reservar Promoción
          </button>
        </div>

        {/* Additional info */}
        <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-elegant mb-3 md:mb-4 text-lg md:text-xl">¿Necesitas algo personalizado?</h3>
          <p className="text-premium mb-4 md:mb-6 text-sm md:text-base leading-relaxed">
            También ofrecemos servicios personalizados para eventos especiales, 
            bodas y celebraciones. Consulta por nuestros paquetes grupales.
          </p>
          <button
            onClick={() => handleBookService("Servicio Personalizado")}
            className="btn-secondary min-h-[48px] btn-touch active:scale-95 text-sm md:text-base"
          >
            Consultar Personalizado
          </button>
        </div>
      </div>
    </section>
  );
}