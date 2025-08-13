import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://joangelnails.com'
  
  // URLs principales del sitio
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/galeria`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(), 
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }
  ]

  // URLs de categorías de servicios
  const serviceCategories = [
    'semi-permanente',
    'acrilicas-molde', 
    'forrado-acrilico',
    'acrilicas-tips',
    'eventos-especiales'
  ]

  const categoryRoutes = serviceCategories.map(category => ({
    url: `${baseUrl}/galeria/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // URLs de imágenes para SEO de imágenes
  const imageRoutes = [
    'manicura-elegante-con-detalles-dorados',
    'arte-de-uñas-moderno-y-detallado',
    'gel-dorado',
    'french-clasico',
    'arte-celestial-en-uñas-elegantes',
    'diseño-de-uñas-acrílicas-coloridas',
    'arte-de-uñas-navideñas-elegante',
    'manicura-francesa-con-ojos-de-mal-de-ojo',
    'diseño-minimalista-en-uñas-acrílicas',
    'mano-descansando-sobre-toalla-blanca'
  ].map(imageName => ({
    url: `${baseUrl}/galeria/imagen/${imageName}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    ...routes,
    ...categoryRoutes,
    ...imageRoutes
  ]
}