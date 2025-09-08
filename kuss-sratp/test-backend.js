const http = require('http');

// Test backend connection
function testBackend() {
  console.log('🔍 Testing backend connection...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Backend is running! Status: ${res.statusCode}`);
    console.log(`📡 Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response body: ${data}`);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your backend server is running on port 3000');
    console.log('2. Check if the server is accessible at http://localhost:3000');
    console.log('3. Verify your backend routes are properly configured');
    console.log('4. Check for any CORS configuration issues');
  });

  req.setTimeout(5000, () => {
    console.error('⏰ Request timeout - backend might be slow or unresponsive');
    req.destroy();
  });

  req.end();
}

// Test POST endpoint
function testAddUser() {
  console.log('\n🔍 Testing add_user POST endpoint...');
  
  const postData = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    role: 'eq',
    ward: 'Entebbe'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/add_user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Add user endpoint responded! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response: ${data}`);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Add user test failed:', error.message);
  });

  req.write(postData);
  req.end();
}

// Test GET endpoint
function testGetUsers() {
  console.log('\n🔍 Testing add_user GET endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/add_user',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Get users endpoint responded! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response: ${data}`);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Get users test failed:', error.message);
  });

  req.end();
}

// Run tests
console.log('🚀 Starting backend connection tests...\n');
testBackend();

// Wait a bit before testing endpoints
setTimeout(() => {
  testAddUser();
  testGetUsers();
}, 2000);

