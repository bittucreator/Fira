const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = process.argv.includes('--dev');

function createWindow() {
  console.log(`Creating Electron window in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode...`);
  
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    x: 100,
    y: 100,
    show: true,
    alwaysOnTop: isDev, // Only force on top in development
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  console.log('Window created, determining load strategy...');

  if (isDev) {
    // DEVELOPMENT MODE: Load from webpack dev server
    console.log('Development mode: Loading from webpack dev server...');
    
    // Show loading screen first
    mainWindow.loadURL('data:text/html,<html><body style="background: #f0f0f0; color: #333; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px;"><h1>🚀 AI Notes App</h1><p>Development Mode</p><p>Connecting to webpack dev server...</p><p style="font-size: 12px; color: #666;">http://localhost:3000</p></body></html>');
    
    mainWindow.focus();
    
    // Wait for webpack dev server, then load React app
    setTimeout(() => {
      console.log('Loading React app from localhost:3000...');
      mainWindow.loadURL('http://localhost:3000');
    }, 2000);
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
    
  } else {
    // PRODUCTION MODE: Load from built files
    console.log('Production mode: Loading from built files...');
    
    const indexPath = path.join(__dirname, '../public/index.html');
    console.log('Loading index.html from:', indexPath);
    
    mainWindow.focus();
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(indexPath)) {
      console.error('ERROR: index.html not found at:', indexPath);
      mainWindow.loadURL('data:text/html,<html><body style="background: #ff6b6b; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px;"><h1>⚠️ File Not Found</h1><p>index.html missing at:</p><code>' + indexPath + '</code><p>Run: npm run build</p></body></html>');
    } else {
      console.log('File exists, loading...');
      mainWindow.loadFile(indexPath);
    }
  }
  
  console.log('Window should be visible!');
  
  // Handle window events
  mainWindow.on('closed', () => {
    console.log('Window closed');
  });

  // Handle load events
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Failed to load:', errorDescription);
    
    if (isDev) {
      mainWindow.loadURL('data:text/html,<html><body style="background: #ff6b6b; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px;"><h1>⚠️ Development Server Error</h1><p>Could not connect to webpack dev server</p><p><strong>Error:</strong> ' + errorDescription + '</p><div style="background: rgba(0,0,0,0.2); padding: 20px; margin: 20px; border-radius: 8px; text-align: left;"><h3>To fix this:</h3><ol><li>Make sure webpack dev server is running</li><li>Run: <code>npm run dev-react</code></li><li>Check if port 3000 is available</li></ol></div></body></html>');
    } else {
      mainWindow.loadURL('data:text/html,<html><body style="background: #ff6b6b; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px;"><h1>⚠️ Production Build Error</h1><p>Could not load the application</p><p><strong>Error:</strong> ' + errorDescription + '</p><div style="background: rgba(0,0,0,0.2); padding: 20px; margin: 20px; border-radius: 8px; text-align: left;"><h3>To fix this:</h3><ol><li>Build the React app: <code>npm run build</code></li><li>Make sure index.html exists in public/</li></ol></div></body></html>');
    }
    
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Set up AI service IPC handlers
function setupAIHandlers() {
  console.log('Setting up AI handlers...');
  
  // Placeholder AI handlers
  ipcMain.handle('ai-fix-grammar', async (event, text) => {
    console.log('AI Fix Grammar requested for:', text.substring(0, 50) + '...');
    return `[Grammar Fixed] ${text}`;
  });

  ipcMain.handle('ai-summarize', async (event, text) => {
    console.log('AI Summarize requested for:', text.substring(0, 50) + '...');
    return `[Summary] This is a summary of: ${text.substring(0, 100)}...`;
  });

  ipcMain.handle('ai-expand', async (event, text) => {
    console.log('AI Expand requested for:', text.substring(0, 50) + '...');
    return `[Expanded] ${text}\n\nThis text has been expanded with additional details and context.`;
  });

  ipcMain.handle('ai-adjust-tone', async (event, text, tone) => {
    console.log('AI Adjust Tone requested:', tone, 'for:', text.substring(0, 50) + '...');
    return `[${tone.toUpperCase()} TONE] ${text}`;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('Electron app is ready, setting up...');
  createWindow();
  setupAIHandlers();
  
  // Force app to foreground on macOS
  if (process.platform === 'darwin') {
    app.dock.show();
  }
});

// macOS specific - recreate window when dock icon clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
