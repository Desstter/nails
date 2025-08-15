"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import OptimizedImage from "./OptimizedImage";

export default function Gallery() {
  const [viewMode, setViewMode] = useState<"categories" | "gallery">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setExpandedItem] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  // Lazy Loading: Estado para controlar cuántas imágenes mostrar
  const [visibleImagesCount, setVisibleImagesCount] = useState(6); // Mobile-first: 6 iniciales
  const IMAGES_PER_LOAD = 6; // Cargar de 6 en 6

  // Gallery items - Trabajos organizados por tipo de servicio
  const galleryItems = useMemo(() => [
    // Semi-permanente Premium
    { id: 1, category: "semi-permanente", title: null, description: null, image: "/Arte celestial en uñas elegantes.png" },
    { id: 2, category: "semi-permanente", title: null, description: null, image: "/Manicura francesa con corazones abstractos.png" },
    { id: 3, category: "semi-permanente", title: null, description: null, image: "/Detalles elegantes de manicura francesa.png" },
    { id: 4, category: "semi-permanente", title: null, description: null, image: "/french-clasico.png" },
    { id: 5, category: "semi-permanente", title: null, description: null, image: "/Manicura rosa con detalles dorados.png" },
    { id: 6, category: "semi-permanente", title: null, description: null, image: "/Manicura francesa con mármol dorado.png" },
    { id: 7, category: "semi-permanente", title: null, description: null, image: "/Manicura Elegante con Brillo Dorado.png" },
    { id: 8, category: "semi-permanente", title: null, description: null, image: "/Manicura francesa con ojos de mal de ojo.png" },
    { id: 9, category: "semi-permanente", title: null, description: null, image: "/Manicure elegante con detalles dorados.png" },
    { id: 10, category: "semi-permanente", title: null, description: null, image: "/Detalles delicados de uñas con brillo.png" },
    
    // Uñas Acrílicas con Molde
    { id: 12, category: "acrilicas-molde", title: null, description: null, image: "/Arte de uñas elegante y detallado.png" },
    { id: 15, category: "acrilicas-molde", title: null, description: null, image: "/Arte de uñas moderno y detallado.png" },
    { id: 16, category: "acrilicas-molde", title: null, description: null, image: "/Diseño de uñas acrílicas coloridas.png" },
    { id: 17, category: "acrilicas-molde", title: null, description: null, image: "/Arte de uñas con detalles dorados.png" },
    { id: 18, category: "acrilicas-molde", title: null, description: null, image: "/Arte de uñas con detalles dorados (1).png" },
    { id: 19, category: "acrilicas-molde", title: null, description: null, image: "/Arte en uñas con tips verde neón.png" },
    { id: 20, category: "acrilicas-molde", title: null, description: null, image: "/Diseño minimalista en uñas acrílicas.png" },
    { id: 21, category: "acrilicas-molde", title: null, description: null, image: "/Arte de uñas detallado y vibrante.png" },
    { id: 22, category: "acrilicas-molde", title: null, description: null, image: "/Arte en uñas con detalles geométricos.png" },
    
    // Forrado en Acrílico
    { id: 23, category: "forrado-acrilico", title: null, description: null, image: "/gel-dorado.png" },
    { id: 24, category: "forrado-acrilico", title: null, description: null, image: "/Diseño de uñas con detalles dorados.png" },
    { id: 25, category: "forrado-acrilico", title: null, description: null, image: "/Manicura elegante con detalles dorados.png" },
    { id: 26, category: "forrado-acrilico", title: null, description: null, image: "/Manicura Elegante con Detalles Dorados (1).png" },
    { id: 27, category: "forrado-acrilico", title: null, description: null, image: "/Diseño de uñas con detalles naturales.png" },
    { id: 28, category: "forrado-acrilico", title: null, description: null, image: "/Arte de uñas con diseño botánico y geométrico.png" },
    { id: 29, category: "forrado-acrilico", title: null, description: null, image: "/Arte de uñas con detalles botánicos.png" },
    { id: 30, category: "forrado-acrilico", title: null, description: null, image: "/Arte de uñas con flores y detalles.png" },
    { id: 31, category: "forrado-acrilico", title: null, description: null, image: "/Diseño geométrico y esmalte rosado.png" },
    { id: 32, category: "forrado-acrilico", title: null, description: null, image: "/Arte en uñas con diseño geométrico.png" },
    { id: 33, category: "forrado-acrilico", title: null, description: null, image: "/Arte de uñas con detalles gráficos.png" },
    
    // Uñas Acrílicas con Tips
    { id: 34, category: "acrilicas-tips", title: null, description: null, image: "/Arte de Uñas Colorido y Geométrico.png" },
    { id: 35, category: "acrilicas-tips", title: null, description: null, image: "/Arte de uñas colorido y alegre.png" },
    { id: 36, category: "acrilicas-tips", title: null, description: null, image: "/Arte de uñas colorido y moderno.png" },
    { id: 37, category: "acrilicas-tips", title: null, description: null, image: "/Arte en Uñas con Toque Pop.png" },
    { id: 38, category: "acrilicas-tips", title: null, description: null, image: "/Uñas de arte pop y diseño.png" },
    { id: 39, category: "acrilicas-tips", title: null, description: null, image: "/Uñas de leopardo en tonos vibrantes.png" },
    { id: 40, category: "acrilicas-tips", title: null, description: null, image: "/Uñas pastel con diseño y logo.png" },
    { id: 41, category: "acrilicas-tips", title: null, description: null, image: "/Arte de Uñas con Atardecer Tropical.png" },
    { id: 42, category: "acrilicas-tips", title: null, description: null, image: "/Arte de uñas vibrante y moderno.png" },
    { id: 43, category: "acrilicas-tips", title: null, description: null, image: "/Arte de uñas con Ojos Turcos.png" },
    { id: 44, category: "acrilicas-tips", title: null, description: null, image: "/Diseño de uñas rojo y blanco.png" },
    
    // Eventos Especiales
    { id: 45, category: "eventos-especiales", title: null, description: null, image: "/Arte de Uñas Navideñas Elegante.png" },
    { id: 46, category: "eventos-especiales", title: null, description: null, image: "/Arte de uñas navideño con Santa.png" },
    { id: 47, category: "eventos-especiales", title: null, description: null, image: "/Arte de uñas para Halloween.png" },
    { id: 48, category: "eventos-especiales", title: null, description: null, image: "/Uñas con arte de copos de nieve.png" },
    { id: 49, category: "eventos-especiales", title: null, description: null, image: "/Manicura rosa con copos de nieve.png" },
    { id: 50, category: "eventos-especiales", title: null, description: null, image: "/Arte de uñas con mariposas y amor.png" },
    { id: 51, category: "eventos-especiales", title: null, description: null, image: "/Arte de uñas con mariposas y frase.png" },
    { id: 52, category: "eventos-especiales", title: null, description: null, image: "/Arte de uñas con mariposas y glitter.png" },
    { id: 53, category: "eventos-especiales", title: null, description: null, image: "/Arte de uñas con mensaje _LOVE_.png" },
    { id: 55, category: "eventos-especiales", title: null, description: null, image: "/nails.png" }
  ], []);

  // Efecto para manejar el cambio de categoría con animación
  useEffect(() => {
    setExpandedItem(null);
    // Reset lazy loading al cambiar categoría
    setVisibleImagesCount(6);
  }, [selectedCategory]);

  // Efecto para cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Función para navegar imágenes en el lightbox
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const currentFilteredItems = selectedCategory 
      ? galleryItems.filter(item => item.category === selectedCategory)
      : [];
    const imagesWithSrc = currentFilteredItems.filter(item => item.image);
    const totalImages = imagesWithSrc.length;
    
    if (direction === 'next') {
      const nextIndex = (currentImageIndex + 1) % totalImages;
      setCurrentImageIndex(nextIndex);
      setExpandedImage(imagesWithSrc[nextIndex].image);
    } else {
      const prevIndex = currentImageIndex === 0 ? totalImages - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setExpandedImage(imagesWithSrc[prevIndex].image);
    }
  }, [selectedCategory, currentImageIndex, galleryItems]);

  // Efecto para manejar tecla ESC, navegación y gestos táctiles
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
      }
      if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && isLightboxOpen) {
        navigateImage(event.key === 'ArrowLeft' ? 'prev' : 'next');
      }
    };

    // Variables para gestos táctiles
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isLightboxOpen) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchEndY - touchStartY;
      const deltaX = touchEndX - touchStartX;
      
      // Swipe down para cerrar (mínimo 50px)
      if (deltaY > 50 && Math.abs(deltaX) < Math.abs(deltaY)) {
        closeLightbox();
      }
      // Swipe left para siguiente (mínimo 50px)
      else if (deltaX < -50 && Math.abs(deltaY) < Math.abs(deltaX)) {
        navigateImage('next');
      }
      // Swipe right para anterior (mínimo 50px)
      else if (deltaX > 50 && Math.abs(deltaY) < Math.abs(deltaX)) {
        navigateImage('prev');
      }
    };

    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Cleanup: restaurar scroll del body al desmontar componente
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, currentImageIndex, navigateImage]);

  // Función para navegar a una categoría con transición
  const navigateToCategory = (categoryId: string) => {
    if (selectedCategory === categoryId) return; // Si ya está seleccionada, no hacer nada
    
    setExpandedItem(null); // Cerrar cualquier item expandido
    setSelectedCategory(categoryId);
    setViewMode("gallery");
    setIsDropdownOpen(false); // Cerrar dropdown en móvil
  };

  // Función para manejar el dropdown
  const handleDropdownSelect = (categoryId: string) => {
    navigateToCategory(categoryId);
  };

  // Función para volver a la vista de categorías
  const goBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(null);
    setExpandedItem(null);
  };

  // Funciones para el lightbox
  const openLightbox = (imageSrc: string, imageIndex: number) => {
    setExpandedImage(imageSrc);
    setCurrentImageIndex(imageIndex);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setExpandedImage(null);
    document.body.style.overflow = 'unset'; // Restaurar scroll del body
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
      count: 11,
      description: "Duración de 2-3 semanas con acabado impecable",
      image: "/Manicura elegante con detalles dorados.png",
      gradient: "from-pink-400 to-rose-500"
    },
    { 
      id: "acrilicas-molde", 
      name: "Uñas Acrílicas con Molde", 
      count: 11,
      description: "Extensión natural con diferentes formas",
      image: "/Arte de uñas moderno y detallado.png",
      gradient: "from-purple-400 to-pink-500"
    },
    { 
      id: "forrado-acrilico", 
      name: "Forrado en Acrílico", 
      count: 11,
      description: "Refuerzo y reparación de uñas naturales",
      image: "/gel-dorado.png",
      gradient: "from-yellow-400 to-orange-500"
    },
    { 
      id: "acrilicas-tips", 
      name: "Uñas Acrílicas con Tips", 
      count: 11,
      description: "Extensión con tips decorativas y naturales",
      image: "/Arte de Uñas Colorido y Geométrico.png",
      gradient: "from-blue-400 to-purple-500"
    },
    { 
      id: "eventos-especiales", 
      name: "Eventos Especiales", 
      count: 11,
      description: "Diseños únicos para ocasiones especiales",
      image: "/Arte de Uñas Navideñas Elegante.png",
      gradient: "from-emerald-400 to-teal-500"
    }
  ];


  // Filtrar y aplicar lazy loading
  const allFilteredItems = selectedCategory 
    ? galleryItems.filter(item => item.category === selectedCategory)
    : [];
  
  // Aplicar lazy loading: solo mostrar las primeras X imágenes
  const filteredItems = allFilteredItems.slice(0, visibleImagesCount);
  
  // Función para cargar más imágenes
  const loadMoreImages = () => {
    setVisibleImagesCount(prev => Math.min(prev + IMAGES_PER_LOAD, allFilteredItems.length));
  };
  
  // Verificar si hay más imágenes para cargar
  const hasMoreImages = visibleImagesCount < allFilteredItems.length;

  return (
    <section id="galeria" className="bg-gradient-to-br from-gray-50 to-white">
      {/* Header Principal - Solo en vista inicial */}
      {viewMode === "categories" && (
        <div className="section-padding">
          <div className="container-luxury">
            <div className="text-center mb-16">
              <h2 className="text-luxury-lg mb-6">
                Galería de <span className="gradient-gold">Nuestro Trabajo</span>
              </h2>
              <p className="text-premium max-w-2xl mx-auto">
                Elige el tipo de servicio que más te interese para ver nuestros trabajos especializados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación Fija - Solo aparece en vista de galería */}
      {viewMode === "gallery" && (
        <div className="sticky top-0 z-50 bg-white/95 sticky-nav border-b border-gray-100 shadow-soft nav-transition-enter">
          <div className="container-luxury py-2 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Botón Volver */}
              <button
                onClick={goBackToCategories}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-gray-100 hover:bg-yellow-100 text-gray-700 hover:text-yellow-700 transition-all duration-300 flex-shrink-0 back-button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Inicio</span>
              </button>

              {/* Dropdown Selector - Solo MÓVILES */}
              <div className="relative flex-1 sm:hidden dropdown-container">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2 bg-white border rounded-full shadow-sm font-medium text-sm transition-all duration-200 category-selector ${
                    isDropdownOpen 
                      ? "border-yellow-300 ring-2 ring-yellow-100 text-yellow-700" 
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="truncate">
                    {categories.find(cat => cat.id === selectedCategory)?.name || "Seleccionar servicio"}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-luxury z-50 animate-dropdown-enter">
                    <div className="py-2">
                      {categories.map((category, index) => (
                        <button
                          key={category.id}
                          onClick={() => handleDropdownSelect(category.id)}
                          className={`w-full text-left px-4 py-3 transition-all duration-200 touch-manipulation dropdown-option ${
                            selectedCategory === category.id
                              ? "bg-yellow-50 text-yellow-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                          }`}
                          style={{
                            animationDelay: `${index * 50}ms`
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{category.name}</span>
                            {selectedCategory === category.id && (
                              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{category.count} trabajos</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs Horizontales - Solo DESKTOP */}
              <div className="hidden sm:flex flex-1 overflow-x-auto tabs-container">
                <div className="flex gap-2 min-w-max pr-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => navigateToCategory(category.id)}
                      className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-all duration-300 nav-tab ${
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-elegant tab-active"
                          : "bg-white text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 shadow-sm"
                      }`}
                    >
                      <span className="whitespace-nowrap text-xs sm:text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={viewMode === "gallery" ? "" : "container-luxury"}>

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
                  <OptimizedImage
                    src={category.image} 
                    alt={category.name}
                    fill
                    context="gallery-thumb"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay con gradiente */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 category-card-gradient`}></div>
                  
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

        {/* Vista de Galería de Categoría - Optimizada */}
        {viewMode === "gallery" && (
          <div className="container-luxury py-6">
            {/* Grid de trabajos - Sin header redundante */}
            {filteredItems.length > 0 ? (
              <>
                <div 
                  key={selectedCategory} // Key para forzar re-render en cambio de categoría
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 gallery-grid-mobile gallery-transition"
                >
                  {filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`group bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-300 hover:transform hover:scale-105 gallery-card gallery-card-mobile ${
                        item.image ? 'cursor-pointer' : ''
                      }`}
                      style={{
                        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                      }}
                      onClick={() => {
                        if (item.image) {
                          const imagesWithSrc = filteredItems.filter(i => i.image);
                          const imageIndex = imagesWithSrc.findIndex(i => i.id === item.id);
                          openLightbox(item.image, imageIndex);
                        }
                      }}
                    >
                      {/* Imagen optimizada y compacta */}
                      <div className="aspect-square bg-gradient-to-br from-pink-100 to-yellow-100 overflow-hidden relative">
                        {item.image ? (
                          <OptimizedImage
                            src={item.image} 
                            alt={`Trabajo de uñas ${item.category}`}
                            fill
                            context="gallery-thumb"
                            className="object-cover group-hover:scale-110 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-yellow-300">
                            <div className="text-center p-2">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-xs text-yellow-600 font-medium">Próximamente</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Botón "Ver más" - Lazy Loading */}
                {hasMoreImages && (
                  <div className="text-center mt-8 mb-4">
                    <button
                      onClick={loadMoreImages}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-full font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-elegant hover:shadow-luxury hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Ver {Math.min(IMAGES_PER_LOAD, allFilteredItems.length - visibleImagesCount)} más
                      <span className="text-yellow-100 text-sm">
                        ({visibleImagesCount} de {allFilteredItems.length})
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No hay trabajos disponibles</h3>
                <p className="text-sm text-gray-600">Esta categoría se está preparando con nuevos diseños.</p>
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
            Transformaciones reales de nuestras clientas
          </p>
          
          {/* Versión móvil - Stack vertical */}
          <div className="block sm:hidden space-y-6">
            {/* Antes - Móvil */}
            <div className="text-center">
              <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-soft">
                {/* Imagen ANTES */}
                <Image 
                  src="/optimized/mano-descansando-sobre-toalla-blanca.webp" 
                  alt="Uñas antes del tratamiento"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300" style={{ display: 'none' }}>
                  <div className="text-gray-500 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">ANTES</p>
                    <p className="text-xs text-gray-400"></p>
                  </div>
                </div>
                {/* Badge ANTES */}
                <div className="absolute top-3 left-3 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  ANTES
                </div>
              </div>
              <h4 className="font-medium text-gray-800 text-sm">Estado Natural</h4>
            </div>

            {/* Flecha de transformación - Móvil */}
            <div className="flex justify-center">
              <div className="text-yellow-600">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center rotate-90">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <p className="text-xs mt-2 font-medium">Transformación</p>
              </div>
            </div>

            {/* Después - Móvil */}
            <div className="text-center">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-yellow-100 to-pink-100 rounded-2xl overflow-hidden mb-3 shadow-soft">
                {/* Placeholder para imagen DESPUÉS */}
                <Image 
                  src="/optimized/diseño-minimalista-en-uñas-acrílicas.webp" 
                  alt="Uñas después del tratamiento"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-pink-100 flex items-center justify-center border-2 border-dashed border-yellow-300" style={{ display: 'none' }}>
                  <div className="text-yellow-600 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">DESPUÉS</p>
                    <p className="text-xs text-yellow-500">Agregar imagen aquí</p>
                  </div>
                </div>
                {/* Badge DESPUÉS */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  DESPUÉS
                </div>
              </div>
              <h4 className="font-medium text-gray-800 text-sm">Resultado Premium</h4>
            </div>
          </div>

          {/* Versión desktop - Horizontal */}
          <div className="hidden sm:grid grid-cols-3 gap-8 items-center">
            {/* Antes - Desktop */}
            <div className="text-center">
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-soft">
                <Image 
                  src="/optimized/mano-descansando-sobre-toalla-blanca.webp" 
                  alt="Uñas antes del tratamiento"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300" style={{ display: 'none' }}>
                  <div className="text-gray-500 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-400 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-base font-medium">ANTES</p>
                    <p className="text-sm text-gray-400">Agregar imagen aquí</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ANTES
                </div>
              </div>
              <h4 className="font-medium text-gray-800">Estado Natural</h4>
            </div>

            {/* Flecha - Desktop */}
            <div className="text-center">
              <div className="text-yellow-600">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center shadow-elegant">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <p className="text-sm mt-3 font-medium">Transformación Premium</p>
              </div>
            </div>

            {/* Después - Desktop */}
            <div className="text-center">
              <div className="relative aspect-square bg-gradient-to-br from-yellow-100 to-pink-100 rounded-2xl overflow-hidden mb-4 shadow-soft">
                <Image 
                  src="/optimized/diseño-minimalista-en-uñas-acrílicas.webp" 
                  alt="Uñas después del tratamiento"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-pink-100 flex items-center justify-center border-2 border-dashed border-yellow-300" style={{ display: 'none' }}>
                  <div className="text-yellow-600 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002 2v12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-base font-medium">DESPUÉS</p>
                    <p className="text-sm text-yellow-500">Agregar imagen aquí</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  DESPUÉS
                </div>
              </div>
              <h4 className="font-medium text-gray-800">Resultado Premium</h4>
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

        {/* Lightbox Modal */}
        {isLightboxOpen && expandedImage && (
          <div 
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center lightbox-container lightbox-backdrop lightbox-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeLightbox();
              }
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white lightbox-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navegación anterior */}
            {filteredItems.filter(item => item.image).length > 1 && (
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white lightbox-btn"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Navegación siguiente */}
            {filteredItems.filter(item => item.image).length > 1 && (
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white lightbox-btn"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Imagen expandida - Máxima calidad para lightbox */}
            <div className="relative max-w-full max-h-full">
              <OptimizedImage
                src={expandedImage}
                alt={`Trabajo de uñas ${selectedCategory}`}
                width={800}
                height={600}
                context="gallery-full"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl lightbox-image lightbox-image-transition"
                style={{
                  animation: 'lightboxImageEnter 0.4s ease-out'
                }}
              />
              
              {/* Indicador de posición */}
              {filteredItems.filter(item => item.image).length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm lightbox-position-indicator">
                  {currentImageIndex + 1} / {filteredItems.filter(item => item.image).length}
                </div>
              )}
            </div>

            {/* Instrucción para móviles */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs text-center sm:hidden max-w-xs">
              Desliza ↓ para cerrar • ← → para navegar
            </div>
          </div>
        )}
      </div>
    </section>
  );
}