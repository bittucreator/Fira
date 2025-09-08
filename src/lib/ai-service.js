export class AIService {
  // Core AI Features
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

  // NEW: Advanced AI Features
  static async generateContent(prompt, contentType = 'general') {
    if (window.electronAPI) {
      return await window.electronAPI.aiGenerateContent(prompt, contentType);
    }
    return 'Failed to generate content';
  }

  static async translate(text, targetLanguage) {
    if (window.electronAPI) {
      return await window.electronAPI.aiTranslate(text, targetLanguage);
    }
    return text;
  }

  // Convenience methods for specific content types
  static async generateEmail(prompt) {
    return await this.generateContent(prompt, 'email');
  }

  static async generateBlogPost(prompt) {
    return await this.generateContent(prompt, 'blog');
  }

  static async generateOutline(prompt) {
    return await this.generateContent(prompt, 'outline');
  }

  static async generateIdeas(prompt) {
    return await this.generateContent(prompt, 'ideas');
  }

  // Quick tone adjustments
  static async makeAcademic(text) {
    return await this.adjustTone(text, 'academic');
  }

  static async makeCreative(text) {
    return await this.adjustTone(text, 'creative');
  }

  static async makeProfessional(text) {
    return await this.adjustTone(text, 'professional');
  }

  static async makeCasual(text) {
    return await this.adjustTone(text, 'casual');
  }
}
