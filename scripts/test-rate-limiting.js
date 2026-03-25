#!/usr/bin/env node

/**
 * Script para probar el Rate Limiting implementado
 * 
 * Uso: node scripts/test-rate-limiting.js [baseUrl]
 * Ejemplo: node scripts/test-rate-limiting.js http://localhost:5001
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.argv[2] || 'http://localhost:5001';
const API_PREFIX = '/api/v1';

// Función helper para hacer requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Función para esperar un tiempo
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRateLimiting() {
  console.log('🧪 Probando Rate Limiting en endpoints de autenticación...\n');

  // Test 1: Rate Limiting en login
  console.log('📝 Test 1: Rate Limiting en endpoint /auth/login');
  console.log('   Enviando 6 requests rápidos (límite: 5 por 15 min)...\n');

  const loginRequests = [];
  for (let i = 1; i <= 6; i++) {
    loginRequests.push(
      makeRequest(`${BASE_URL}${API_PREFIX}/auth/login`, {
        method: 'POST',
        body: {
          documentNumber: 'test123',
          password: 'wrongpassword'
        }
      }).then(response => {
        console.log(`   Request ${i}: Status ${response.status}`);
        if (response.status === 429) {
          console.log(`   ✅ Rate limit activado: ${response.data?.message || 'Demasiados intentos'}`);
        } else if (response.status === 401) {
          console.log(`   ✅ Request permitido (credenciales inválidas)`);
        }
        return response;
      }).catch(error => {
        console.log(`   ❌ Request ${i} falló: ${error.message}`);
        return null;
      })
    );
    
    // Pequeña pausa entre requests
    await sleep(100);
  }

  const loginResults = await Promise.all(loginRequests);
  const rateLimitedRequests = loginResults.filter(r => r && r.status === 429);
  
  console.log(`\n   📊 Resultado: ${rateLimitedRequests.length} request(s) fueron limitados`);
  
  if (rateLimitedRequests.length > 0) {
    console.log('   ✅ Rate limiting funcionando correctamente en login');
  } else {
    console.log('   ⚠️  Rate limiting no se activó como esperado');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Rate Limiting en registro
  console.log('📝 Test 2: Rate Limiting en endpoint /auth/register');
  console.log('   Enviando 4 requests rápidos (límite: 3 por 5 min)...\n');

  const registerRequests = [];
  for (let i = 1; i <= 4; i++) {
    registerRequests.push(
      makeRequest(`${BASE_URL}${API_PREFIX}/auth/register`, {
        method: 'POST',
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: `test${i}@example.com`,
          documentNumber: `1234567${i}`,
          phone: `123456789${i}`,
          password: 'password123'
        }
      }).then(response => {
        console.log(`   Request ${i}: Status ${response.status}`);
        if (response.status === 429) {
          console.log(`   ✅ Rate limit activado: ${response.data?.message || 'Demasiados intentos'}`);
        } else if (response.status === 201 || response.status === 400) {
          console.log(`   ✅ Request permitido (${response.status === 201 ? 'registro exitoso' : 'error de validación'})`);
        }
        return response;
      }).catch(error => {
        console.log(`   ❌ Request ${i} falló: ${error.message}`);
        return null;
      })
    );
    
    await sleep(100);
  }

  const registerResults = await Promise.all(registerRequests);
  const rateLimitedRegister = registerResults.filter(r => r && r.status === 429);
  
  console.log(`\n   📊 Resultado: ${rateLimitedRegister.length} request(s) fueron limitados`);
  
  if (rateLimitedRegister.length > 0) {
    console.log('   ✅ Rate limiting funcionando correctamente en registro');
  } else {
    console.log('   ⚠️  Rate limiting no se activó como esperado');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Verificar que endpoints sin rate limiting funcionen
  console.log('📝 Test 3: Endpoints sin rate limiting (health check)');
  console.log('   Enviando múltiples requests al health check...\n');

  const healthRequests = [];
  for (let i = 1; i <= 10; i++) {
    healthRequests.push(
      makeRequest(`${BASE_URL}${API_PREFIX}/`).then(response => {
        console.log(`   Request ${i}: Status ${response.status}`);
        return response;
      }).catch(error => {
        console.log(`   ❌ Request ${i} falló: ${error.message}`);
        return null;
      })
    );
  }

  const healthResults = await Promise.all(healthRequests);
  const successfulHealth = healthResults.filter(r => r && r.status === 200);
  
  console.log(`\n   📊 Resultado: ${successfulHealth.length}/10 requests exitosos`);
  
  if (successfulHealth.length === 10) {
    console.log('   ✅ Health check no afectado por rate limiting (correcto)');
  } else {
    console.log('   ⚠️  Health check puede estar siendo afectado por rate limiting');
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE TESTS DE RATE LIMITING:');
  console.log(`   ✅ Login rate limiting: ${rateLimitedRequests.length > 0 ? 'FUNCIONANDO' : 'NO ACTIVADO'}`);
  console.log(`   ✅ Register rate limiting: ${rateLimitedRegister.length > 0 ? 'FUNCIONANDO' : 'NO ACTIVADO'}`);
  console.log(`   ✅ Health check sin límites: ${successfulHealth.length === 10 ? 'CORRECTO' : 'POSIBLE PROBLEMA'}`);

  const totalTests = 3;
  const passedTests = 
    (rateLimitedRequests.length > 0 ? 1 : 0) +
    (rateLimitedRegister.length > 0 ? 1 : 0) +
    (successfulHealth.length === 10 ? 1 : 0);

  console.log(`\n🎯 Tests pasados: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡Todos los tests de rate limiting pasaron correctamente!');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisar configuración de rate limiting.');
  }
}

// Ejecutar tests
testRateLimiting().catch(console.error);
