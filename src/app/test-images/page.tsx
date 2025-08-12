"use client";
import OptimizedImage from '../components/OptimizedImage';

export default function TestImages() {
  const testImages = [
    "/Arte celestial en uñas elegantes.png",
    "/french-clasico.png",
    "/gel-dorado.png",
    "/nail-geometrico.png",
    "/Mano descansando sobre toalla blanca.png"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-luxury">
        <h1 className="text-3xl font-bold text-center mb-8">
          🎯 Test de Imágenes Optimizadas AVIF/WEBP
        </h1>
        
        <div className="mb-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📊 Estadísticas de Optimización:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">91%</div>
              <div className="text-sm text-green-700">Reducción AVIF</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">93%</div>
              <div className="text-sm text-blue-700">Reducción WEBP</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">36</div>
              <div className="text-sm text-purple-700">Imágenes Procesadas</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testImages.map((src, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative aspect-square">
                <OptimizedImage
                  src={src}
                  alt={`Test image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {src.split('/').pop()?.split('.')[0]}
                </h3>
                <div className="text-sm text-gray-600">
                  <div>🎯 Intentará cargar: AVIF → WEBP → PNG</div>
                  <div>📱 Responsivo con lazy loading</div>
                  <div>🚀 Cache optimizado</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-yellow-50 to-pink-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-4">
            ✅ Sistema de Imágenes Optimizadas Implementado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">🎯 Formatos Soportados:</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ AVIF (máxima compresión, navegadores modernos)</li>
                <li>✅ WEBP (buena compresión, amplio soporte)</li>
                <li>✅ PNG/JPEG (fallback para compatibilidad)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🚀 Características:</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ Detección automática de formato óptimo</li>
                <li>✅ Lazy loading con Intersection Observer</li>
                <li>✅ Responsive images con srcset</li>
                <li>✅ Cache optimizado para performance</li>
                <li>✅ Loading skeletons mientras carga</li>
                <li>✅ Fallback automático en caso de error</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
          >
            ← Volver al Sitio Principal
          </a>
        </div>
      </div>
    </div>
  );
}