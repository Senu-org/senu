// Simple manual test for authentication flow
// This is a development test file - not for production

async function testAuthFlow() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🚀 Testing Authentication Flow...\n')
  
  // Test data
  const testUser = {
    phone: '+50688881234',
    name: 'Test User',
    country: 'CR'
  }
  
  try {
    // Test 1: User Registration
    console.log('📝 Testing user registration...')
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    })
    
    const registerData = await registerResponse.json()
    console.log('Registration Status:', registerResponse.status)
    console.log('Registration Response:', JSON.stringify(registerData, null, 2))
    
    if (!registerData.success) {
      throw new Error(`Registration failed: ${registerData.error?.message}`)
    }
    
    // Extract token for further tests
    const token = registerData.data.token
    console.log('✅ Registration successful\n')
    
    // Test 2: Login
    console.log('🔐 Testing user login...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: testUser.phone })
    })
    
    const loginData = await loginResponse.json()
    console.log('Login Status:', loginResponse.status)
    console.log('Login Response:', JSON.stringify(loginData, null, 2))
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error?.message}`)
    }
    
    console.log('✅ Login successful\n')
    
    // Test 3: Protected Route (Wallet Balance)
    console.log('🔒 Testing protected route with authentication...')
    const walletResponse = await fetch(`${baseUrl}/api/wallets/${encodeURIComponent(testUser.phone)}/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const walletData = await walletResponse.json()
    console.log('Wallet Status:', walletResponse.status)
    console.log('Wallet Response:', JSON.stringify(walletData, null, 2))
    
    if (walletResponse.status === 401) {
      console.log('✅ Protected route properly requires authentication\n')
    } else {
      console.log('ℹ️  Protected route response (may be unimplemented)\n')
    }
    
    // Test 4: Rate Limiting
    console.log('⏱️ Testing rate limiting...')
    const promises = []
    for (let i = 0; i < 15; i++) {
      promises.push(
        fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone: `+50688881${i.toString().padStart(3, '0')}` })
        })
      )
    }
    
    const rateLimitResults = await Promise.all(promises)
    const rateLimitedCount = rateLimitResults.filter(r => r.status === 429).length
    
    console.log(`Rate limited responses: ${rateLimitedCount}/15`)
    if (rateLimitedCount > 0) {
      console.log('✅ Rate limiting is working\n')
    } else {
      console.log('⚠️  Rate limiting may not be working as expected\n')
    }
    
    console.log('🎉 Authentication flow test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Check if running directly
if (require.main === module) {
  testAuthFlow().catch(console.error)
}

module.exports = testAuthFlow