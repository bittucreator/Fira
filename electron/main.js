const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Load environment variables
require('dotenv').config();

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
    mainWindow.loadURL('data:text/html,<html><body style="background: #f0f0f0; color: #333; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px;"><h1>🚀 Fira AI App</h1><p>Development Mode</p><p>Connecting to webpack dev server...</p><p style="font-size: 12px; color: #666;">http://localhost:3000</p></body></html>');
    
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
  
  // Import OpenAI
  const OpenAI = require('openai');
  
  // Initialize Azure OpenAI client with GPT-5 deployment
  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: process.env.AZURE_OPENAI_ENDPOINT || 'https://slane-resource.cognitiveservices.azure.com/openai/deployments/slane-gpt-5',
    defaultQuery: { 'api-version': '2025-01-01-preview' },
    defaultHeaders: {
      'api-key': process.env.AZURE_OPENAI_API_KEY,
    },
  });

  console.log('Azure OpenAI GPT-5 client initialized successfully');

  // Professional AI Fix Grammar Handler
  ipcMain.handle('ai-fix-grammar', async (event, text) => {
    console.log('AI Fix Grammar requested for:', text.substring(0, 50) + '...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional grammar and style assistant powered by GPT-5. Your task is to:
            1. Fix all grammatical errors with advanced understanding
            2. Improve sentence structure and clarity using sophisticated language patterns
            3. Maintain the original meaning and tone perfectly
            4. Return ONLY the corrected text without any explanations or formatting
            5. Apply advanced writing techniques while keeping the same length and style as the original
            6. Use GPT-5's enhanced reasoning for context-aware corrections`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.2,
        max_tokens: Math.min(4000, text.length * 2),
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const result = completion.choices[0].message.content.trim();
      console.log('GPT-5 grammar correction completed successfully');
      return result;
    } catch (error) {
      console.error('Grammar correction failed:', error);
      return `Error: ${error.message}`;
    }
  });

  // Professional AI Summarize Handler
  ipcMain.handle('ai-summarize', async (event, text) => {
    console.log('AI Summarize requested for:', text.substring(0, 50) + '...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional summarization expert powered by GPT-5. Create a concise, well-structured summary that:
            1. Captures all key points and main ideas with advanced comprehension
            2. Uses clear, professional language optimized by GPT-5's language capabilities
            3. Is approximately 20-30% of the original length
            4. Maintains logical flow and structure with superior organization
            5. Includes action items or conclusions if present
            6. Uses bullet points for complex information when appropriate
            7. Leverages GPT-5's enhanced reasoning for deeper insights`
          },
          {
            role: "user",
            content: `Please summarize this text:\n\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: Math.min(2000, Math.max(150, text.length * 0.3)),
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const result = completion.choices[0].message.content.trim();
      console.log('GPT-5 summarization completed successfully');
      return result;
    } catch (error) {
      console.error('Summarization failed:', error);
      return `Error: ${error.message}`;
    }
  });

  // Professional AI Expand Handler
  ipcMain.handle('ai-expand', async (event, text) => {
    console.log('AI Expand requested for:', text.substring(0, 50) + '...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional writing assistant powered by GPT-5. Expand the given text by:
            1. Adding relevant details and context with GPT-5's advanced knowledge
            2. Providing examples and explanations using sophisticated reasoning
            3. Maintaining the original tone and style perfectly
            4. Adding depth without redundancy using advanced content generation
            5. Ensuring all additions are valuable and relevant with superior judgment
            6. Keeping the expanded version cohesive and well-structured
            7. Aim for 150-200% of the original length with high-quality content`
          },
          {
            role: "user",
            content: `Please expand this text with relevant details and context:\n\n${text}`
          }
        ],
        temperature: 0.4,
        max_tokens: Math.min(4000, text.length * 3),
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const result = completion.choices[0].message.content.trim();
      console.log('GPT-5 text expansion completed successfully');
      return result;
    } catch (error) {
      console.error('Text expansion failed:', error);
      return `Error: ${error.message}`;
    }
  });

  // Professional AI Tone Adjustment Handler
  ipcMain.handle('ai-adjust-tone', async (event, text, tone) => {
    console.log('AI Adjust Tone requested:', tone, 'for:', text.substring(0, 50) + '...');
    
    const toneInstructions = {
      professional: `Transform the text to be professional, formal, and business-appropriate using GPT-5's advanced language capabilities:
        - Use formal language and proper business terminology with sophisticated vocabulary
        - Remove casual expressions and slang with intelligent replacements
        - Ensure clarity and precision with enhanced coherence
        - Maintain respectful and authoritative tone with perfect balance
        - Structure for professional communication with optimal flow`,
      
      casual: `Transform the text to be casual, friendly, and conversational using GPT-5's natural language understanding:
        - Use everyday language and natural expressions with authentic voice
        - Make it feel like a friendly conversation with genuine warmth
        - Remove overly formal language with smart simplification
        - Add warmth and personality with appropriate touches
        - Keep it approachable and relatable with perfect tone balance`,
      
      academic: `Transform the text to be academic and scholarly using GPT-5's advanced reasoning:
        - Use precise, technical language with sophisticated terminology
        - Ensure objective and analytical tone with superior logic
        - Structure arguments logically with enhanced coherence
        - Use formal academic conventions with perfect adherence
        - Maintain intellectual rigor with advanced insights`,
      
      creative: `Transform the text to be creative and engaging using GPT-5's enhanced creativity:
        - Use vivid, descriptive language with rich imagery
        - Add creative elements and metaphors with artistic flair
        - Make it more engaging and interesting with compelling narrative
        - Use varied sentence structures with rhythmic flow
        - Enhance emotional appeal with sophisticated techniques`
    };

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional writing style expert powered by GPT-5. ${toneInstructions[tone] || toneInstructions.professional}
            
            Important: Return ONLY the rewritten text without any explanations, comments, or formatting. Use GPT-5's advanced capabilities for perfect tone transformation.`
          },
          {
            role: "user",
            content: `Please rewrite this text in a ${tone} tone:\n\n${text}`
          }
        ],
        temperature: 0.5,
        max_tokens: Math.min(4000, text.length * 2),
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const result = completion.choices[0].message.content.trim();
      console.log(`GPT-5 tone adjustment (${tone}) completed successfully`);
      return result;
    } catch (error) {
      console.error('Tone adjustment failed:', error);
      return `Error: ${error.message}`;
    }
  });

  // NEW: AI Content Generation Handler with GPT-5
  ipcMain.handle('ai-generate-content', async (event, prompt, contentType = 'general') => {
    console.log('AI Content Generation requested:', contentType, 'with prompt:', prompt.substring(0, 50) + '...');
    
    const contentTypeInstructions = {
      email: 'Generate a professional email using GPT-5\'s advanced understanding. Include appropriate subject, greeting, body, and closing with perfect business etiquette.',
      blog: 'Generate a well-structured blog post using GPT-5\'s creative capabilities with engaging introduction, clear sections, and compelling conclusion.',
      outline: 'Create a detailed outline using GPT-5\'s organizational skills with main points, subpoints, and logical structure.',
      ideas: 'Generate creative ideas and suggestions using GPT-5\'s innovative thinking, presented in an organized format with actionable insights.',
      general: 'Generate helpful, relevant content using GPT-5\'s comprehensive knowledge with clear structure and valuable information.'
    };

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional content creator powered by GPT-5. ${contentTypeInstructions[contentType]}
            
            Create high-quality, original content using GPT-5's advanced capabilities that is:
            - Well-structured and easy to read with superior organization
            - Informative and valuable with deep insights
            - Appropriate for the specified content type with perfect matching
            - Professional yet engaging with optimal balance
            - Enhanced by GPT-5's advanced reasoning and creativity`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3500,
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const result = completion.choices[0].message.content.trim();
      console.log('GPT-5 content generation completed successfully');
      return result;
    } catch (error) {
      console.error('Content generation failed:', error);
      return `Error: ${error.message}`;
    }
  });

  // NEW: AI Translation Handler with GPT-5
  ipcMain.handle('ai-translate', async (event, text, targetLanguage) => {
    console.log('AI Translation requested to:', targetLanguage, 'for:', text.substring(0, 50) + '...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional translator powered by GPT-5. Translate the given text to ${targetLanguage} while:
            1. Maintaining the original meaning and context with perfect accuracy
            2. Using natural, fluent language in the target language with native-level proficiency
            3. Preserving the tone and style with sophisticated understanding
            4. Ensuring cultural appropriateness with advanced cultural knowledge
            5. Leveraging GPT-5's multilingual capabilities for superior translation quality
            6. Return ONLY the translated text without explanations`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.2,
        max_tokens: Math.min(4000, text.length * 2),
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const result = completion.choices[0].message.content.trim();
      console.log('GPT-5 translation completed successfully');
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      return `Error: ${error.message}`;
    }
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
