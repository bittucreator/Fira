const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded successfully');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Enhanced AI Service methods - implemented in main process
  aiFixGrammar: (text) => ipcRenderer.invoke('ai-fix-grammar', text),
  aiSummarize: (text) => ipcRenderer.invoke('ai-summarize', text),
  aiExpand: (text) => ipcRenderer.invoke('ai-expand', text),
  aiAdjustTone: (text, tone) => ipcRenderer.invoke('ai-adjust-tone', text, tone),
  
  // NEW: Advanced AI Features
  aiGenerateContent: (prompt, contentType) => ipcRenderer.invoke('ai-generate-content', prompt, contentType),
  aiTranslate: (text, targetLanguage) => ipcRenderer.invoke('ai-translate', text, targetLanguage),
});
