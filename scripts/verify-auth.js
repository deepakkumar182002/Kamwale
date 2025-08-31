#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Authentication setup verification script
// Run with: node scripts/verify-auth.js

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    
    lib.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function verifyAuth() {
  console.log('🔍 Verifying NextAuth setup...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  const requiredVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  requiredVars.forEach(v => {
    const value = process.env[v];
    if (value) {
      console.log(`  ✅ ${v}: ${v.includes('SECRET') ? '***' : value}`);
    } else {
      console.log(`  ❌ ${v}: Not set`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n❌ Missing variables: ${missingVars.join(', ')}`);
    return;
  }
  
  console.log('\n🌐 Testing API endpoints:');
  
  try {
    // Test providers endpoint
    const providersUrl = `${BASE_URL}/api/auth/providers`;
    console.log(`  Testing: ${providersUrl}`);
    
    const providersRes = await makeRequest(providersUrl);
    if (providersRes.status === 200 && providersRes.data.google) {
      console.log('  ✅ Providers endpoint working');
      console.log(`  ✅ Google provider configured`);
    } else {
      console.log(`  ❌ Providers endpoint failed: ${providersRes.status}`);
    }
    
    // Test CSRF endpoint
    const csrfUrl = `${BASE_URL}/api/auth/csrf`;
    console.log(`  Testing: ${csrfUrl}`);
    
    const csrfRes = await makeRequest(csrfUrl);
    if (csrfRes.status === 200 && csrfRes.data.csrfToken) {
      console.log('  ✅ CSRF endpoint working');
    } else {
      console.log(`  ❌ CSRF endpoint failed: ${csrfRes.status}`);
    }
    
  } catch (error) {
    console.log(`  ❌ API test failed: ${error.message}`);
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Ensure Google OAuth redirect URI includes:');
  console.log(`   ${BASE_URL}/api/auth/callback/google`);
  console.log('2. For production, set NEXTAUTH_URL to your domain');
  console.log('3. Test authentication at:');
  console.log(`   ${BASE_URL}/signin`);
}

verifyAuth().catch(console.error);
