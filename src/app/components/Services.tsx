"use client";
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * SERVICES SECTION - Sección de servicios
 * 
 * Funcionalidad:
 * - Carrusel responsivo de servicios principales
 * - Pricing claro y transparente para conversiones
 * - Características detalladas de cada servicio
 * - CTAs individuales para cada servicio
 * 
 * Servicios principales:
 * - Semi Permanente Premium (servicio más demandado)
 * - Uñas Acrílicas con Molde (mayor valor)
 * - Forrado en Acrílico (intermedio)
 * - Pedicure Premium (servicio complementario)
 * 
 * Optimizado para:
 * - Conversión de anuncios pagados
 * - Navegación móvil (swipe gestures)
 * - Clarity en pricing para reducir fricción
 */
export default function Services() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const services = [
    {
      id: "semi-permanent",
      name: "✨ Semi Permanente Premium",
      price: "COP $60.000",
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
    // Track service booking intent
    if (typeof window !== 'undefined' && window.trackServiceView) {
      window.trackServiceView(serviceName);
    }
    
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
    
    // Track carousel interaction
    if (typeof window !== 'undefined' && window.trackCarouselInteraction) {
      window.trackCarouselInteraction('next_slide', services[nextIndex].name);
    }
    
    scrollToSlide(nextIndex);
  }, [currentSlide, services.length, scrollToSlide, services]);

  const prevSlide = useCallback(() => {
    const prevIndex = currentSlide > 0 ? currentSlide - 1 : services.length - 1;
    
    // Track carousel interaction
    if (typeof window !== 'undefined' && window.trackCarouselInteraction) {
      window.trackCarouselInteraction('prev_slide', services[prevIndex].name);
    }
    
    scrollToSlide(prevIndex);
  }, [currentSlide, services.length, scrollToSlide, services]);

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
    <section 
      id="servicios" 
      className="section-padding bg-white" 
      itemScope 
      itemType="https://schema.org/LocalBusiness"
    >
      <div className="container-luxury">
        <div className="text-center mb-16">
          <h2 itemProp="name" className="text-luxury-lg mb-6">
            Nuestros <span className="gradient-gold">Servicios Premium</span>
          </h2>
          <p itemProp="description" className="text-premium max-w-2xl mx-auto">
            Cada servicio está diseñado para brindarte la máxima comodidad y elegancia. 
            Utilizamos solo productos de la más alta calidad y técnicas profesionales.
          </p>
          
          {/* Hidden SEO metadata */}
          <div className="sr-only">
            <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span itemProp="addressLocality">Bogotá</span>
              <span itemProp="addressCountry">Colombia</span>
            </span>
            <span itemProp="telephone">+57 318 722 9548</span>
            <span itemProp="priceRange">$50,000 - $100,000 COP</span>
            <span itemProp="hasOfferingCatalog" itemScope itemType="https://schema.org/OfferingCatalog">
              <span itemProp="name">Servicios de Manicure y Uñas</span>
              <span itemProp="itemListElement" itemScope itemType="https://schema.org/OfferCatalog">
                <span itemProp="itemOffered">Semi Permanente, Uñas Acrílicas, Forrado en Acrílico</span>
              </span>
            </span>
          </div>
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
                <article
                  key={service.id}
                  itemScope
                  itemType="https://schema.org/Service"
                  className={`relative bg-white rounded-3xl p-5 md:p-8 shadow-elegant hover:shadow-luxury transition-all duration-300 border-2 flex-shrink-0 w-80 md:w-96 snap-center service-card-mobile ${
                    service.specialty
                      ? "border-purple-400 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 transform hover:scale-[1.02] ring-2 ring-purple-200/50 shadow-purple-100/50" 
                      : service.popular 
                      ? "border-yellow-400 bg-gradient-to-br from-white via-yellow-50/20 to-orange-50/20 transform hover:scale-[1.02] shadow-yellow-100/50" 
                      : "border-gray-200 hover:border-yellow-300 hover:shadow-yellow-100/30"
                  }`}
                >
              {service.popular && !service.specialty && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white px-5 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg whitespace-nowrap">
                    ✨ MÁS POPULAR
                  </span>
                </div>
              )}
              {service.specialty && (
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-xl whitespace-nowrap border-2 border-white/20">
                    ⭐ NUESTRA ESPECIALIDAD
                  </span>
                </div>
              )}

              <div className="text-center mb-6 pt-16">
                <h3 itemProp="name" className="text-elegant mb-3 text-lg md:text-xl font-semibold leading-tight px-2">
                  {service.name}
                </h3>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-center">
                    <span 
                      itemProp="offers" 
                      itemScope 
                      itemType="https://schema.org/Offer"
                      className="block"
                    >
                      <span itemProp="price" className="text-2xl md:text-3xl font-bold gradient-gold whitespace-nowrap">
                        {service.price}
                      </span>
                      <meta itemProp="priceCurrency" content="COP" />
                    </span>
                  </div>
                  <div className="text-gray-400 text-lg">•</div>
                  <div className="text-center">
                    <span className="text-sm md:text-base text-gray-600 font-medium whitespace-nowrap">
                      ⏱️ {service.duration}
                    </span>
                  </div>
                </div>
                <p itemProp="description" className="text-premium text-sm md:text-base leading-relaxed px-2 text-gray-700">
                  {service.description}
                </p>
              </div>

              <div className="mb-8 px-1">
                <ul className="space-y-3 md:space-y-3.5">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                        service.specialty 
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200' 
                          : service.popular
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 group-hover:from-yellow-200 group-hover:to-orange-200'
                          : 'bg-green-100 group-hover:bg-green-200'
                      }`}>
                        <svg className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-colors duration-200 ${
                          service.specialty 
                            ? 'text-purple-600' 
                            : service.popular
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm md:text-base leading-relaxed font-medium break-words hyphens-auto" lang="es">
                        {feature.replace('✅ ', '')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleBookService(service.name)}
                className={`w-full py-4 md:py-4 px-6 rounded-xl font-bold transition-all duration-300 min-h-[48px] btn-touch group overflow-hidden relative ${
                  service.specialty
                    ? "bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white shadow-xl hover:shadow-purple-300/50 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20"
                    : service.popular
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-yellow-300/50 transform hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-yellow-100 text-gray-800 hover:text-yellow-800 border-2 border-gray-200 hover:border-yellow-400 active:scale-[0.98] shadow-md hover:shadow-lg"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap">
                  {service.specialty && <span>⭐</span>}
                  {service.popular && !service.specialty && <span>✨</span>}
                  Reservar Ahora
                  <span className="group-hover:translate-x-1 transition-transform duration-200">📱</span>
                </span>
                {service.specialty && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                )}
              </button>

              {/* Payment Methods */}
              <div className="mt-5 pt-4 border-t border-gray-200/60">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600 mb-3 whitespace-nowrap">💳 Métodos de Pago Aceptados</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 px-3 py-2 rounded-lg border border-green-200/50 hover:shadow-sm transition-all duration-200">
                      <span className="text-base">💵</span>
                      <span className="text-xs font-medium text-green-800 whitespace-nowrap">Efectivo</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-2 rounded-lg border border-purple-200/50 hover:shadow-sm transition-all duration-200">
                      <span className="text-base">📱</span>
                      <span className="text-xs font-medium text-purple-800 whitespace-nowrap">Nequi</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-lg border border-blue-200/50 hover:shadow-sm transition-all duration-200">
                      <span className="text-base">🏦</span>
                      <span className="text-xs font-medium text-blue-800 whitespace-nowrap">Banco</span>
                    </div>
                  </div>
                </div>
              </div>
                </article>
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
          <h3 className="text-elegant mb-3 md:mb-4 text-xl md:text-2xl">¡2x1 en Semi Permanente Premium!</h3>
          <p className="text-premium mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
            En tu primera visita, lleva a una amiga y <strong>ambas pagan solo $60.000</strong> por el Semi Permanente Premium.
            <br className="hidden md:block" />
            <span className="block md:inline text-sm text-gray-600 mt-2 md:mt-0">*Válido solo para nuevas clientas. Una promoción por persona.</span>
          </p>
          <button
            onClick={() => handleBookService("Promoción 2x1 Semi Permanente Premium - Primera Cita")}
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