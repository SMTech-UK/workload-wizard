#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function openTestDashboard() {
  console.log('🚀 Starting Test Dashboard...');
  
  try {
    // Check if Next.js dev server is already running
    const { stdout } = await execAsync('lsof -ti:3000');
    if (stdout.trim()) {
      console.log('✅ Development server already running on port 3000');
    } else {
      console.log('📡 Starting development server...');
      const devProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        detached: true
      });
      
      // Wait a bit for the server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Open the test dashboard in the browser
    console.log('🌐 Opening test dashboard in browser...');
    
    const platform = process.platform;
    let command;
    
    switch (platform) {
      case 'darwin':
        command = 'open';
        break;
      case 'win32':
        command = 'start';
        break;
      default:
        command = 'xdg-open';
    }
    
    await execAsync(`${command} http://localhost:3000/test-dashboard`);
    
    console.log('✅ Test Dashboard opened!');
    console.log('📊 Navigate to: http://localhost:3000/test-dashboard');
    console.log('🔄 You can now run tests directly from the web interface');
    
  } catch (error) {
    console.error('❌ Error starting test dashboard:', error.message);
    console.log('💡 Make sure you have a development server running on port 3000');
    console.log('💡 Run: npm run dev');
  }
}

// Run if called directly
if (require.main === module) {
  openTestDashboard();
}

module.exports = { openTestDashboard }; 