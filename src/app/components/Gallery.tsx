"use client";

import { useState } from "react";
import Image from "next/image";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const categories = [
    { id: "todos", name: "Todos", count: 24 },
    { id: "gel", name: "Gel Premium", count: 12 },
    { id: "clasico", name: "Manicure Clásico", count: 8 },
    { id: "nail-art", name: "Nail Art", count: 4 }
  ];

  // Gallery items with real example
  const galleryItems = [
    { id: 1, category: "gel", title: "Gel Rosa Elegante", description: "Manicure gel en tono rosa nude", image: null },
    { id: 2, category: "nail-art", title: "Diseño Floral", description: "Nail art con flores delicadas", image: null },
    { id: 3, category: "clasico", title: "French Clásico", description: "Manicure francés tradicional con diseño de nubes y lettering", image: "/french-clasico.png" },
    { id: 4, category: "gel", title: "Gel Dorado", description: "Brillo dorado premium", image: "/gel-dorado.png" },
    { id: 5, category: "nail-art", title: "Diseño Geométrico", description: "Patrones modernos con líneas elegantes", image: "/nail-geometrico.png" },
    { id: 6, category: "clasico", title: "Nude Natural", description: "Elegancia natural", image: null },
    { id: 7, category: "gel", title: "Gel Rojo Pasión", description: "Rojo intenso duradero", image: null },
    { id: 8, category: "nail-art", title: "Cristales Swarovski", description: "Lujo con cristales", image: null }
  ];

  const filteredItems = selectedCategory === "todos" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <section id="galeria" className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-luxury" suppressHydrationWarning={true}>
        <div className="text-center mb-16">
          <h2 className="text-luxury-lg mb-6">
            Galería de <span className="gradient-gold">Nuestro Trabajo</span>
          </h2>
          <p className="text-premium max-w-2xl mx-auto">
            Cada trabajo es único y personalizado. Aquí puedes ver algunos de nuestros 
            diseños más destacados y la calidad que nos caracteriza.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-elegant"
                  : "bg-white text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 shadow-soft"
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-yellow-100 overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">💅</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{item.title}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 flex-1">{item.title}</h4>
                  {item.image && (
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="ml-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    >
                      {expandedItem === item.id ? "Menos" : "Más"}
                    </button>
                  )}
                </div>
                <p className={`text-sm text-gray-600 transition-all duration-300 ${
                  expandedItem === item.id ? 'line-clamp-none' : 'line-clamp-2'
                }`}>
                  {expandedItem === item.id 
                    ? `${item.description} - Técnica profesional con productos premium. Duración aproximada: 60-90 minutos. Ideal para eventos especiales o uso diario.`
                    : item.description
                  }
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Before/After Section */}
        <div className="bg-white rounded-2xl p-8 shadow-elegant">
          <h3 className="text-elegant text-center mb-8">Antes y Después</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Antes del tratamiento</p>
                </div>
              </div>
              <h4 className="font-medium text-gray-800">Estado Inicial</h4>
              <p className="text-sm text-gray-600">Uñas naturales sin tratamiento</p>
            </div>

            <div className="text-center">
              <div className="aspect-video bg-gradient-to-br from-yellow-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-yellow-600">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <p className="text-sm">Después del tratamiento</p>
                </div>
              </div>
              <h4 className="font-medium text-gray-800">Resultado Final</h4>
              <p className="text-sm text-gray-600">Manicure premium profesional</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-premium mb-6">
            ¿Te gustó lo que viste? ¡Agenda tu cita y vive la experiencia completa!
          </p>
          <button 
            onClick={() => {
              const message = encodeURIComponent(
                "Hola! Vi su galería y me encantó el trabajo. Me gustaría agendar una cita para un servicio premium."
              );
              window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
            }}
            className="btn-primary"
          >
            Agendar Mi Cita Ahora
          </button>
        </div>
      </div>
    </section>
  );
}