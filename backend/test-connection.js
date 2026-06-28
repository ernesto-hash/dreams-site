require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    console.log('🔑 Testing Stripe connection...');
    console.log('Key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...');
    
    // Teste 1: Listar produtos
    const products = await stripe.products.list({ limit: 3 });
    console.log('✅ Connected! Found', products.data.length, 'products');
    
    // Teste 2: Criar sessão de teste
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test Dream' },
          unit_amount: 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:8080/success',
      cancel_url: 'http://localhost:8080/cancel',
    });
    
    console.log('✅ Test session created:', session.id);
    console.log('✅ Test URL:', session.url);
    
    // Abre a URL no navegador
    console.log('\n🌐 Open this URL to test payment:');
    console.log(session.url);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Type:', error.type);
    console.error('Code:', error.code);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n🔴 AUTHENTICATION ERROR!');
      console.error('Please check:');
      console.error('1. Your Stripe Secret Key in .env file');
      console.error('2. If the key starts with "sk_test_"');
      console.error('3. If the key is complete (about 100 characters)');
      console.error('4. If the key has no spaces or line breaks');
    }
  }
}

test();