const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'optimized');

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Configuración de calidad
const QUALITY_CONFIG = {
  avif: {
    quality: 80,
    effort: 6, // 0-9, más alto = mejor compresión pero más lento
  },
  webp: {
    quality: 85,
    effort: 6,
  },
  jpeg: {
    quality: 90,
    progressive: true,
  },
  png: {
    compressionLevel: 9,
    adaptiveFiltering: true,
  }
};

// Función para limpiar nombres de archivo
function cleanFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/--+/g, '-');
}

// Función para convertir imagen
async function convertImage(inputPath, outputDir, baseName) {
  try {
    const cleanName = cleanFileName(baseName);
    
    console.log(`🔄 Procesando: ${baseName}`);
    
    // Obtener información de la imagen original
    const metadata = await sharp(inputPath).metadata();
    console.log(`   📏 Tamaño original: ${metadata.width}x${metadata.height}, ${Math.round(fs.statSync(inputPath).size / 1024)}KB`);
    
    const image = sharp(inputPath);
    
    // Redimensionar si es muy grande (máximo 1920px de ancho)
    if (metadata.width && metadata.width > 1920) {
      image.resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Crear versión AVIF
    const avifPath = path.join(outputDir, `${cleanName}.avif`);
    await image
      .clone()
      .avif(QUALITY_CONFIG.avif)
      .toFile(avifPath);
    
    const avifSize = Math.round(fs.statSync(avifPath).size / 1024);
    
    // Crear versión WEBP
    const webpPath = path.join(outputDir, `${cleanName}.webp`);
    await image
      .clone()
      .webp(QUALITY_CONFIG.webp)
      .toFile(webpPath);
    
    const webpSize = Math.round(fs.statSync(webpPath).size / 1024);
    
    // Crear versión optimizada PNG/JPEG como fallback
    const ext = path.extname(inputPath).toLowerCase();
    const fallbackPath = path.join(outputDir, `${cleanName}${ext}`);
    
    if (ext === '.png') {
      await image
        .clone()
        .png(QUALITY_CONFIG.png)
        .toFile(fallbackPath);
    } else {
      await image
        .clone()
        .jpeg(QUALITY_CONFIG.jpeg)
        .toFile(fallbackPath);
    }
    
    const fallbackSize = Math.round(fs.statSync(fallbackPath).size / 1024);
    const originalSize = Math.round(fs.statSync(inputPath).size / 1024);
    
    const avifSaving = Math.round(((originalSize - avifSize) / originalSize) * 100);
    const webpSaving = Math.round(((originalSize - webpSize) / originalSize) * 100);
    
    console.log(`   ✅ AVIF: ${avifSize}KB (${avifSaving}% reducción)`);
    console.log(`   ✅ WEBP: ${webpSize}KB (${webpSaving}% reducción)`);
    console.log(`   ✅ Fallback: ${fallbackSize}KB`);
    
    return {
      original: baseName,
      clean: cleanName,
      originalSize,
      avifSize,
      webpSize,
      fallbackSize,
      avifSaving,
      webpSaving
    };
    
  } catch (error) {
    console.error(`❌ Error procesando ${baseName}:`, error.message);
    return null;
  }
}

// Función principal
async function optimizeImages() {
  console.log('🚀 Iniciando optimización de imágenes...\n');
  
  const files = fs.readdirSync(PUBLIC_DIR);
  const imageFiles = files.filter(file => 
    /\.(png|jpg|jpeg)$/i.test(file) && 
    !file.startsWith('optimized')
  );
  
  console.log(`📁 Encontradas ${imageFiles.length} imágenes para optimizar\n`);
  
  const results = [];
  let totalOriginalSize = 0;
  let totalAvifSize = 0;
  let totalWebpSize = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const baseName = path.parse(file).name;
    
    const result = await convertImage(inputPath, OUTPUT_DIR, baseName);
    if (result) {
      results.push(result);
      totalOriginalSize += result.originalSize;
      totalAvifSize += result.avifSize;
      totalWebpSize += result.webpSize;
    }
    
    console.log(''); // Línea en blanco entre archivos
  }
  
  // Generar mapeo de archivos
  const mapping = {};
  results.forEach(result => {
    mapping[result.original] = result.clean;
  });
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'image-mapping.json'),
    JSON.stringify(mapping, null, 2)
  );
  
  // Estadísticas finales
  console.log('📊 RESUMEN DE OPTIMIZACIÓN');
  console.log('═'.repeat(50));
  console.log(`📸 Imágenes procesadas: ${results.length}`);
  console.log(`📦 Tamaño original total: ${Math.round(totalOriginalSize)}KB`);
  console.log(`🎯 Tamaño AVIF total: ${Math.round(totalAvifSize)}KB`);
  console.log(`🎯 Tamaño WEBP total: ${Math.round(totalWebpSize)}KB`);
  
  const totalAvifSaving = Math.round(((totalOriginalSize - totalAvifSize) / totalOriginalSize) * 100);
  const totalWebpSaving = Math.round(((totalOriginalSize - totalWebpSize) / totalOriginalSize) * 100);
  
  console.log(`💾 Ahorro con AVIF: ${totalAvifSaving}%`);
  console.log(`💾 Ahorro con WEBP: ${totalWebpSaving}%`);
  console.log('\n✅ Optimización completada!');
  console.log(`📁 Archivos guardados en: ${OUTPUT_DIR}`);
}

// Ejecutar el script
optimizeImages().catch(console.error);