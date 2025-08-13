#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuración de testing
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'optimized');

// Estadísticas de testing
let testResults = {
  totalOriginal: 0,
  totalOptimized: 0,
  passedTests: 0,
  failedTests: 0,
  warnings: [],
  errors: [],
  recommendations: []
};

/**
 * Obtener el tamaño de un archivo
 */
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

/**
 * Formatear bytes para lectura humana
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Limpiar nombre de imagen según el estándar
 */
function cleanImageName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/--+/g, '-');
}

/**
 * Test 1: Verificar que existen imágenes originales
 */
function testOriginalImages() {
  console.log('🔍 Test 1: Verificando imágenes originales...');
  
  if (!fs.existsSync(PUBLIC_DIR)) {
    testResults.errors.push('Directorio public/ no existe');
    return false;
  }

  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  const allFiles = fs.readdirSync(PUBLIC_DIR);
  const imageFiles = allFiles.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext) && !file.startsWith('.');
  });

  testResults.totalOriginal = imageFiles.length;

  if (imageFiles.length === 0) {
    testResults.warnings.push('No se encontraron imágenes originales para optimizar');
    return false;
  }

  console.log(`   ✅ Encontradas ${imageFiles.length} imágenes originales`);
  testResults.passedTests++;
  return true;
}

/**
 * Test 2: Verificar que existe el directorio optimizado
 */
function testOptimizedDirectory() {
  console.log('🔍 Test 2: Verificando directorio optimizado...');
  
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    testResults.errors.push('Directorio public/optimized/ no existe. Ejecuta: npm run optimize-images');
    return false;
  }

  console.log('   ✅ Directorio optimizado existe');
  testResults.passedTests++;
  return true;
}

/**
 * Test 3: Verificar formatos optimizados
 */
function testOptimizedFormats() {
  console.log('🔍 Test 3: Verificando formatos optimizados...');
  
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    testResults.failedTests++;
    return false;
  }

  const optimizedFiles = fs.readdirSync(OPTIMIZED_DIR);
  const avifFiles = optimizedFiles.filter(file => file.endsWith('.avif'));
  const webpFiles = optimizedFiles.filter(file => file.endsWith('.webp'));

  testResults.totalOptimized = optimizedFiles.length;

  if (avifFiles.length === 0) {
    testResults.warnings.push('No se encontraron archivos AVIF optimizados');
  } else {
    console.log(`   ✅ Encontrados ${avifFiles.length} archivos AVIF`);
  }

  if (webpFiles.length === 0) {
    testResults.warnings.push('No se encontraron archivos WebP optimizados');
  } else {
    console.log(`   ✅ Encontrados ${webpFiles.length} archivos WebP`);
  }

  if (avifFiles.length > 0 || webpFiles.length > 0) {
    testResults.passedTests++;
    return true;
  }

  testResults.failedTests++;
  return false;
}

/**
 * Test 4: Comparar tamaños de archivos
 */
function testFileCompression() {
  console.log('🔍 Test 4: Verificando compresión de archivos...');
  
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  const originalFiles = fs.readdirSync(PUBLIC_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext) && !file.startsWith('.');
  });

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let comparedFiles = 0;

  originalFiles.forEach(file => {
    const originalPath = path.join(PUBLIC_DIR, file);
    const originalSize = getFileSize(originalPath);
    totalOriginalSize += originalSize;

    // Buscar versiones optimizadas
    const nameWithoutExt = path.parse(file).name;
    const cleanName = cleanImageName(nameWithoutExt);
    
    const avifPath = path.join(OPTIMIZED_DIR, `${cleanName}.avif`);
    const webpPath = path.join(OPTIMIZED_DIR, `${cleanName}.webp`);

    const avifSize = getFileSize(avifPath);
    const webpSize = getFileSize(webpPath);

    if (avifSize > 0 || webpSize > 0) {
      comparedFiles++;
      const bestOptimizedSize = Math.min(
        avifSize > 0 ? avifSize : Infinity,
        webpSize > 0 ? webpSize : Infinity
      );
      totalOptimizedSize += bestOptimizedSize;

      const reduction = ((originalSize - bestOptimizedSize) / originalSize) * 100;
      
      if (reduction < 20) {
        testResults.warnings.push(
          `${file}: Compresión baja (${reduction.toFixed(1)}%). Original: ${formatBytes(originalSize)}, Optimizado: ${formatBytes(bestOptimizedSize)}`
        );
      }
    }
  });

  if (comparedFiles === 0) {
    testResults.errors.push('No se pudieron comparar archivos originales con optimizados');
    testResults.failedTests++;
    return false;
  }

  const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100;
  
  console.log(`   📊 Comparación de ${comparedFiles} archivos:`);
  console.log(`   📦 Tamaño original total: ${formatBytes(totalOriginalSize)}`);
  console.log(`   📦 Tamaño optimizado total: ${formatBytes(totalOptimizedSize)}`);
  console.log(`   📈 Reducción total: ${totalReduction.toFixed(1)}%`);

  if (totalReduction >= 50) {
    console.log('   ✅ Excelente compresión (>50%)');
    testResults.passedTests++;
  } else if (totalReduction >= 30) {
    console.log('   ⚠️  Compresión moderada (30-50%)');
    testResults.warnings.push(`Compresión moderada: ${totalReduction.toFixed(1)}%. Objetivo: >50%`);
    testResults.passedTests++;
  } else {
    console.log('   ❌ Compresión insuficiente (<30%)');
    testResults.errors.push(`Compresión insuficiente: ${totalReduction.toFixed(1)}%. Revisar configuración.`);
    testResults.failedTests++;
    return false;
  }

  return true;
}

/**
 * Test 5: Verificar estructura de nombres
 */
function testNamingConvention() {
  console.log('🔍 Test 5: Verificando convención de nombres...');
  
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    testResults.failedTests++;
    return false;
  }

  const optimizedFiles = fs.readdirSync(OPTIMIZED_DIR);
  let namingIssues = 0;

  optimizedFiles.forEach(file => {
    const fileName = path.parse(file).name;
    
    // Verificar convención de nombres (minúsculas, guiones, sin espacios)
    if (fileName !== fileName.toLowerCase()) {
      namingIssues++;
      testResults.warnings.push(`Nombre no en minúsculas: ${file}`);
    }

    if (fileName.includes(' ')) {
      namingIssues++;
      testResults.warnings.push(`Nombre con espacios: ${file}`);
    }

    if (fileName.includes('__')) {
      namingIssues++;
      testResults.warnings.push(`Nombre con doble guión: ${file}`);
    }
  });

  if (namingIssues === 0) {
    console.log('   ✅ Convención de nombres correcta');
    testResults.passedTests++;
    return true;
  } else {
    console.log(`   ⚠️  ${namingIssues} problemas de nomenclatura encontrados`);
    testResults.warnings.push(`${namingIssues} archivos con problemas de nomenclatura`);
    testResults.passedTests++; // No es crítico
    return true;
  }
}

/**
 * Test 6: Verificar mapping de imágenes
 */
function testImageMapping() {
  console.log('🔍 Test 6: Verificando mapping de imágenes...');
  
  const mappingFile = path.join(OPTIMIZED_DIR, 'image-mapping.json');
  
  if (!fs.existsSync(mappingFile)) {
    testResults.warnings.push('Archivo image-mapping.json no encontrado');
    testResults.passedTests++; // No es crítico
    return true;
  }

  try {
    const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    const mappingEntries = Object.keys(mapping).length;
    
    console.log(`   ✅ Mapping existe con ${mappingEntries} entradas`);
    testResults.passedTests++;
    return true;
  } catch (error) {
    testResults.warnings.push(`Error leyendo image-mapping.json: ${error.message}`);
    testResults.passedTests++; // No es crítico
    return true;
  }
}

/**
 * Generar recomendaciones
 */
function generateRecommendations() {
  console.log('💡 Generando recomendaciones...');

  // Recomendación de compresión
  if (testResults.errors.some(e => e.includes('Compresión insuficiente'))) {
    testResults.recommendations.push(
      'Aumentar la compresión en scripts/optimize-images.js (reducir quality en QUALITY_CONFIG)'
    );
  }

  // Recomendación de formatos
  if (testResults.warnings.some(w => w.includes('archivos AVIF'))) {
    testResults.recommendations.push(
      'Verificar que Sharp esté configurado correctamente para generar archivos AVIF'
    );
  }

  // Recomendación de script
  if (testResults.errors.some(e => e.includes('optimized/ no existe'))) {
    testResults.recommendations.push(
      'Ejecutar: npm run optimize-images para generar versiones optimizadas'
    );
  }

  // Recomendación de performance
  if (testResults.totalOriginal > 0 && testResults.totalOptimized === 0) {
    testResults.recommendations.push(
      'Configurar el build process para incluir optimización automática: npm run build'
    );
  }
}

/**
 * Mostrar reporte final
 */
function showReport() {
  console.log('\n📋 REPORTE DE OPTIMIZACIÓN DE IMÁGENES\n');
  
  console.log('📊 Resumen:');
  console.log(`   • Tests pasados: ${testResults.passedTests}`);
  console.log(`   • Tests fallidos: ${testResults.failedTests}`);
  console.log(`   • Imágenes originales: ${testResults.totalOriginal}`);
  console.log(`   • Archivos optimizados: ${testResults.totalOptimized}`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ Errores críticos:');
    testResults.errors.forEach(error => console.log(`   • ${error}`));
  }

  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  Advertencias:');
    testResults.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  if (testResults.recommendations.length > 0) {
    console.log('\n💡 Recomendaciones:');
    testResults.recommendations.forEach(rec => console.log(`   • ${rec}`));
  }

  const overallScore = Math.round((testResults.passedTests / (testResults.passedTests + testResults.failedTests)) * 100);
  
  console.log(`\n🏆 Puntuación general: ${overallScore}%`);
  
  if (overallScore >= 90) {
    console.log('🎉 ¡Excelente! La optimización de imágenes está funcionando perfectamente.');
  } else if (overallScore >= 70) {
    console.log('👍 Bien! Hay algunas áreas de mejora menores.');
  } else {
    console.log('⚠️  Necesitas mejorar la configuración de optimización de imágenes.');
    process.exit(1);
  }
}

/**
 * Función principal
 */
async function runTests() {
  console.log('🚀 Iniciando tests de optimización de imágenes...\n');

  // Ejecutar todos los tests
  testOriginalImages();
  testOptimizedDirectory();
  testOptimizedFormats();
  testFileCompression();
  testNamingConvention();
  testImageMapping();
  
  // Generar recomendaciones y mostrar reporte
  generateRecommendations();
  showReport();
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n❌ Error durante los tests:', error);
    process.exit(1);
  });
}

module.exports = { runTests };