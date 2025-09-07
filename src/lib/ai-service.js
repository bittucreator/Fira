export class AIService {
  static async fixGrammar(text) {
    if (window.electronAPI) {
      return await window.electronAPI.aiFixGrammar(text);
    }
    return text;
  }

  static async summarize(text) {
    if (window.electronAPI) {
      return await window.electronAPI.aiSummarize(text);
    }
    return 'Failed to generate summary';
  }

  static async expand(text) {
    if (window.electronAPI) {
      return await window.electronAPI.aiExpand(text);
    }
    return text;
  }

  static async adjustTone(text, tone = 'professional') {
    if (window.electronAPI) {
      return await window.electronAPI.aiAdjustTone(text, tone);
    }
    return text;
  }
}
