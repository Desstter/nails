"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Gallery() {
  const [viewMode, setViewMode] = useState<"categories" | "gallery">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});

  // Efecto para manejar el cambio de categoría con animación
  useEffect(() => {
    setExpandedItem(null);
  }, [selectedCategory]);

  // Función para navegar a una categoría
  const navigateToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode("gallery");
  };

  // Función para volver a la vista de categorías
  const goBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(null);
    setExpandedItem(null);
  };

  const handleImageLoad = (itemId: number) => {
    setLoadedImages(prev => new Set([...prev, itemId]));
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
  };

  const handleImageLoadStart = (itemId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: true }));
  };

  // Categorías principales para vista inicial (sin "todos")
  const categories = [
    { 
      id: "semi-permanente", 
      name: "Semi-permanente Premium", 
      count: 8,
      description: "Duración de 2-3 semanas con acabado impecable",
      image: "/french-clasico.png",
      gradient: "from-pink-400 to-rose-500"
    },
    { 
      id: "acrilicas-molde", 
      name: "Uñas Acrílicas con Molde", 
      count: 6,
      description: "Extensión natural con diferentes formas",
      image: "/nail-geometrico.png",
      gradient: "from-purple-400 to-pink-500"
    },
    { 
      id: "forrado-acrilico", 
      name: "Forrado en Acrílico", 
      count: 7,
      description: "Refuerzo y reparación de uñas naturales",
      image: "/gel-dorado.png",
      gradient: "from-yellow-400 to-orange-500"
    },
    { 
      id: "acrilicas-tips", 
      name: "Uñas Acrílicas con Tips", 
      count: 6,
      description: "Extensión con tips decorativas y naturales",
      image: "/nail-geometrico.png",
      gradient: "from-blue-400 to-purple-500"
    },
    { 
      id: "eventos-especiales", 
      name: "Eventos Especiales", 
      count: 5,
      description: "Diseños únicos para ocasiones especiales",
      image: "/french-clasico.png",
      gradient: "from-emerald-400 to-teal-500"
    }
  ];

  // Gallery items - Trabajos organizados por tipo de servicio
  const galleryItems = [
    // Semi-permanente Premium
    { id: 1, category: "semi-permanente", title: "French Elegante", description: "Manicure francés con acabado semi-permanente, duración 2-3 semanas", image: "/french-clasico.png", isRealImage: true },
    { id: 2, category: "semi-permanente", title: "Nude Rosado", description: "Tono nude rosado con brillo natural, ideal para cualquier ocasión", image: null, placeholder: "Foto real - Semi-permanente nude rosado" },
    { id: 3, category: "semi-permanente", title: "Rojo Clásico", description: "Rojo intenso duradero con acabado impecable", image: null, placeholder: "Foto real - Semi-permanente rojo clásico" },
    { id: 4, category: "semi-permanente", title: "Dorado Premium", description: "Acabado dorado elegante con brillo duradero", image: "/gel-dorado.png", isRealImage: true },
    { id: 5, category: "semi-permanente", title: "Rosa Pastel", description: "Tonos suaves perfectos para un look natural y sofisticado", image: null, placeholder: "Foto real - Semi-permanente rosa pastel" },
    { id: 6, category: "semi-permanente", title: "Violeta Moderno", description: "Colores modernos con acabado profesional de larga duración", image: null, placeholder: "Foto real - Semi-permanente violeta" },
    { id: 7, category: "semi-permanente", title: "Coral Vibrante", description: "Tono coral perfecto para temporada de verano", image: null, placeholder: "Foto real - Semi-permanente coral" },
    { id: 8, category: "semi-permanente", title: "Beige Sofisticado", description: "Elegancia neutral para uso profesional y diario", image: null, placeholder: "Foto real - Semi-permanente beige" },

    // Uñas Acrílicas con Molde
    { id: 9, category: "acrilicas-molde", title: "Forma Almendra Natural", description: "Extensión con molde en forma almendra, look natural y elegante", image: null, placeholder: "Foto real - Acrílicas molde almendra" },
    { id: 10, category: "acrilicas-molde", title: "Square Medium", description: "Forma cuadrada media con acabado perfecto y resistente", image: null, placeholder: "Foto real - Acrílicas molde cuadradas" },
    { id: 11, category: "acrilicas-molde", title: "Coffin Shape", description: "Forma ataúd moderna y estilizada con técnica profesional", image: null, placeholder: "Foto real - Acrílicas molde coffin" },
    { id: 12, category: "acrilicas-molde", title: "Stiletto Elegante", description: "Forma stiletto dramática con acabado impecable", image: null, placeholder: "Foto real - Acrílicas molde stiletto" },
    { id: 13, category: "acrilicas-molde", title: "Round Clásico", description: "Forma redonda tradicional con acabado suave y natural", image: null, placeholder: "Foto real - Acrílicas molde redondas" },
    { id: 14, category: "acrilicas-molde", title: "Edge Square", description: "Forma cuadrada con bordes definidos y acabado moderno", image: null, placeholder: "Foto real - Acrílicas molde edge square" },

    // Forrado en Acrílico
    { id: 15, category: "forrado-acrilico", title: "Refuerzo Natural", description: "Forrado que mantiene la forma natural con extra resistencia", image: null, placeholder: "Foto real - Forrado acrílico natural" },
    { id: 16, category: "forrado-acrilico", title: "Forrado con Extensión Leve", description: "Ligera extensión con forrado para uñas más largas", image: null, placeholder: "Foto real - Forrado con extensión leve" },
    { id: 17, category: "forrado-acrilico", title: "Reparación Premium", description: "Forrado especializado para reparar uñas rotas o débiles", image: null, placeholder: "Foto real - Forrado reparación" },
    { id: 18, category: "forrado-acrilico", title: "Forrado Transparente", description: "Acabado transparente que respeta el color natural", image: null, placeholder: "Foto real - Forrado transparente" },
    { id: 19, category: "forrado-acrilico", title: "Forrado con Color", description: "Combinación de forrado resistente con color semi-permanente", image: null, placeholder: "Foto real - Forrado con color" },
    { id: 20, category: "forrado-acrilico", title: "Forrado Mate", description: "Acabado mate moderno sobre base de forrado resistente", image: null, placeholder: "Foto real - Forrado mate" },
    { id: 21, category: "forrado-acrilico", title: "Forrado Francés", description: "French clásico sobre base de forrado para mayor duración", image: null, placeholder: "Foto real - Forrado francés" },

    // Uñas Acrílicas con Tips
    { id: 22, category: "acrilicas-tips", title: "Tips Naturales", description: "Extensión con tips transparentes para look natural", image: null, placeholder: "Foto real - Acrílicas tips naturales" },
    { id: 23, category: "acrilicas-tips", title: "Tips con Diseño", description: "Tips decoradas con patrones geométricos modernos", image: "/nail-geometrico.png", isRealImage: true },
    { id: 24, category: "acrilicas-tips", title: "Tips Largas", description: "Extensión considerable con tips para uñas extra largas", image: null, placeholder: "Foto real - Tips largas" },
    { id: 25, category: "acrilicas-tips", title: "Tips con French", description: "Combinación de tips con french clásico elegante", image: null, placeholder: "Foto real - Tips french" },
    { id: 26, category: "acrilicas-tips", title: "Tips Coloridas", description: "Tips con colores vibrantes y acabados especiales", image: null, placeholder: "Foto real - Tips coloridas" },
    { id: 27, category: "acrilicas-tips", title: "Tips Ombre", description: "Efecto degradado sobre tips para look moderno", image: null, placeholder: "Foto real - Tips ombre" },

    // Eventos Especiales
    { id: 28, category: "eventos-especiales", title: "Novia Clásica", description: "Diseño especial para novias con detalles delicados y elegantes", image: null, placeholder: "Foto real - Diseño novia" },
    { id: 29, category: "eventos-especiales", title: "Graduación Elegante", description: "Manicure sofisticada perfecta para ceremonias de graduación", image: null, placeholder: "Foto real - Diseño graduación" },
    { id: 30, category: "eventos-especiales", title: "Fiesta de Gala", description: "Diseño con cristales y detalles dorados para eventos de gala", image: null, placeholder: "Foto real - Diseño gala" },
    { id: 31, category: "eventos-especiales", title: "Quinceañera", description: "Diseño especial con toques juveniles y elegantes", image: null, placeholder: "Foto real - Diseño quinceañera" },
    { id: 32, category: "eventos-especiales", title: "Año Nuevo", description: "Diseño festivo con brillos y colores especiales para celebrar", image: null, placeholder: "Foto real - Diseño año nuevo" }
  ];

  const filteredItems = selectedCategory 
    ? galleryItems.filter(item => item.category === selectedCategory)
    : [];

  return (
    <section id="galeria" className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-luxury" suppressHydrationWarning={true}>
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-luxury-lg mb-6">
            Galería de <span className="gradient-gold">Nuestro Trabajo</span>
          </h2>
          <p className="text-premium max-w-2xl mx-auto">
            {viewMode === "categories" 
              ? "Elige el tipo de servicio que más te interese para ver nuestros trabajos especializados."
              : "Cada trabajo es único y personalizado. Aquí puedes ver la calidad que nos caracteriza."
            }
          </p>
        </div>

        {/* Vista de Categorías */}
        {viewMode === "categories" && (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12"
            style={{ animation: "fadeInUp 0.8s ease-out" }}
          >
            {categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => navigateToCategory(category.id)}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-500 hover:transform hover:scale-105 cursor-pointer gallery-card"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Imagen de fondo */}
                <div className="aspect-[4/5] bg-gradient-to-br from-pink-100 to-yellow-100 overflow-hidden relative">
                  <div className="relative w-full h-full">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Overlay con gradiente */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 category-card-gradient`}></div>
                  </div>
                  
                  {/* Contenido superpuesto */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                    <div className="text-white">
                      <div className="mb-2">
                        <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                          {category.count} trabajos
                        </span>
                      </div>
                      <h3 className="font-bold text-lg sm:text-xl mb-2 leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-sm opacity-90 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ver más</span>
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista de Galería de Categoría */}
        {viewMode === "gallery" && (
          <div style={{ animation: "fadeInUp 0.8s ease-out" }}>
            {/* Botón Volver y Breadcrumb */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-4 shadow-soft">
              <button
                onClick={goBackToCategories}
                className="flex items-center gap-3 text-gray-600 hover:text-yellow-600 transition-colors duration-300 back-button-mobile"
              >
                <div className="w-10 h-10 bg-gray-100 hover:bg-yellow-100 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm text-gray-500">Volver a</span>
                  <div className="font-medium">Categorías de Servicios</div>
                </div>
                <div className="sm:hidden">
                  <span className="font-medium">Volver</span>
                </div>
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 breadcrumb-mobile">
                <span>Inicio</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-yellow-600 font-medium">
                  {categories.find(cat => cat.id === selectedCategory)?.name}
                </span>
              </div>
            </div>

            {/* Título de la categoría actual */}
            <div className="text-center mb-12">
              <h3 className="text-elegant mb-3">
                {categories.find(cat => cat.id === selectedCategory)?.name}
              </h3>
              <p className="text-premium max-w-xl mx-auto">
                {categories.find(cat => cat.id === selectedCategory)?.description}
              </p>
              <div className="mt-4">
                <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                  {filteredItems.length} trabajos disponibles
                </span>
              </div>
            </div>

            {/* Grid de trabajos de la categoría */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-500 hover:transform hover:scale-105 cursor-pointer gallery-card"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
            >
              {/* Image - Optimizada para móviles */}
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-yellow-100 overflow-hidden relative">
                {item.image ? (
                  <div className="relative w-full h-full">
                    {imageLoadingStates[item.id] && (
                      <div className="absolute inset-0 image-loading z-10"></div>
                    )}
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 progressive-image ${
                        loadedImages.has(item.id) ? 'loaded' : 'loading'
                      }`}
                      loading="lazy"
                      onLoadStart={() => handleImageLoadStart(item.id)}
                      onLoad={() => handleImageLoad(item.id)}
                      onError={() => setImageLoadingStates(prev => ({ ...prev, [item.id]: false }))}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-yellow-300">
                    <div className="text-center p-2 sm:p-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">{item.title}</p>
                      <p className="text-xs text-yellow-600 mt-1">Foto real próximamente</p>
                    </div>
                  </div>
                )}
                {/* Overlay de información rápida en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="text-white p-3 w-full">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs opacity-90 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 flex-1 text-sm sm:text-base">{item.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedItem(expandedItem === item.id ? null : item.id);
                    }}
                    className="ml-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium transition-all duration-300 active:scale-95"
                  >
                    {expandedItem === item.id ? "−" : "+"}
                  </button>
                </div>
                <p className={`text-xs sm:text-sm text-gray-600 transition-all duration-300 ${
                  expandedItem === item.id ? 'line-clamp-none' : 'line-clamp-2'
                }`}>
                  {expandedItem === item.id 
                    ? `${item.description} - Técnica profesional con productos premium. Duración aproximada: 60-90 minutos. Resultado duradero y de alta calidad.`
                    : item.description
                  }
                </p>
                {/* Información adicional del servicio */}
                {expandedItem === item.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">✨ Calidad premium</span>
                      <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-full">🎨 Personalizable</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">⏰ Duradero</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
              ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-elegant mb-2">No se encontraron trabajos</h3>
                <p className="text-premium">No hay trabajos disponibles en esta categoría por el momento.</p>
                <button 
                  onClick={goBackToCategories}
                  className="mt-4 btn-secondary"
                >
                  Volver a categorías
                </button>
              </div>
            )}
          </div>
        )}

        {/* Before/After Section - Solo en vista de categorías */}
        {viewMode === "categories" && (
          <div className="bg-white rounded-2xl p-8 shadow-elegant"
            style={{ animation: "fadeInUp 1s ease-out 0.5s both" }}
          >
          <h3 className="text-elegant text-center mb-4">Antes y Después</h3>
          <p className="text-center text-sm text-gray-600 mb-8">
            *Próximamente subiremos fotos reales de transformaciones de nuestras clientas
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-gray-500">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">ANTES</p>
                  <p className="text-xs text-gray-400 mt-1">Uñas naturales</p>
                </div>
              </div>
              <h4 className="font-medium text-gray-800">Estado Inicial</h4>
              <p className="text-xs text-gray-500">Foto real próximamente</p>
            </div>

            <div className="text-center flex items-center justify-center">
              <div className="text-yellow-600">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">➡️</span>
                </div>
                <p className="text-xs mt-2">Transformación</p>
              </div>
            </div>

            <div className="text-center">
              <div className="aspect-square bg-gradient-to-br from-yellow-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-yellow-300">
                <div className="text-yellow-600">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <p className="text-xs">DESPUÉS</p>
                  <p className="text-xs text-yellow-500 mt-1">Resultado premium</p>
                </div>
              </div>
              <h4 className="font-medium text-gray-800">Resultado Final</h4>
              <p className="text-xs text-gray-500">Foto real próximamente</p>
            </div>
            </div>
          </div>
        )}

        {/* Call to Action - Aparece en ambas vistas */}
        <div className="text-center mt-12">
          <p className="text-premium mb-6">
            {viewMode === "categories" 
              ? "¿Te gustó lo que viste? ¡Agenda tu cita y vive la experiencia completa!"
              : "¿Te interesa este servicio? ¡Contáctanos para agendar tu cita!"
            }
          </p>
          <button 
            onClick={() => {
              const categoryName = selectedCategory 
                ? categories.find(cat => cat.id === selectedCategory)?.name 
                : "servicios";
              const message = encodeURIComponent(
                viewMode === "categories"
                  ? "Hola! Vi su galería y me encantó el trabajo. Me gustaría agendar una cita."
                  : `Hola! Me interesa el servicio de ${categoryName}. Me gustaría agendar una cita.`
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
  );
}