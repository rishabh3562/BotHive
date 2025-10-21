// Quick test to verify our webhook fixes
const { execSync } = require('child_process');

try {
  console.log('🧪 Testing webhook fixes...');
  
  // Test TypeScript compilation
  console.log('1. Checking TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation passed');
  
  // Test Jest with our specific test file
  console.log('2. Running webhook tests...');
  execSync('npx jest __tests__/api/webhooks/stripe.test.ts --verbose', { stdio: 'inherit' });
  console.log('✅ Webhook tests passed');
  
  console.log('🎉 All fixes successful!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
