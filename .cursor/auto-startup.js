// Cursor Auto Startup Configuration
// This script automatically starts the development servers

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Design Agents in Auto Mode...');

// Function to start backend server
function startBackend() {
  console.log('🔧 Starting backend server...');
  const backend = spawn('npm', ['run', 'dev-backend'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  backend.on('error', (err) => {
    console.error('Backend error:', err);
  });

  return backend;
}

// Function to start frontend server
function startFrontend() {
  console.log('🌐 Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });

  return frontend;
}

// Auto-start both servers
setTimeout(() => {
  const backend = startBackend();
  
  setTimeout(() => {
    const frontend = startFrontend();
    
    console.log('✅ Both servers started successfully!');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:3001');
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping servers...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
    
  }, 5000); // Wait 5 seconds for backend to start
  
}, 1000); // Wait 1 second before starting
