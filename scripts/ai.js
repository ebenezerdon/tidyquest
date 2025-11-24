window.AppLLM = {
  engine: null,
  ready: false,
  modelId: localStorage.getItem('app.llm.model') || 'Qwen3-4B-q4f16_1-MLC',

  async load(modelId, updateProgress) {
    const id = modelId || this.modelId;
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported.');
    }
    this.modelId = id;
    localStorage.setItem('app.llm.model', id);
    
    try {
        // Dynamic import to support loading as standard script
        const { CreateMLCEngine } = await import('https://esm.run/@mlc-ai/web-llm@0.2.79');
        
        this.engine = await CreateMLCEngine(id, {
          useIndexedDBCache: true,
          initProgressCallback: (p) => {
            let percent = 0;
            if (p && typeof p === 'object' && 'progress' in p) percent = Math.floor(p.progress * 100);
            else if (typeof p === 'number') percent = Math.floor(p * 100);
            if (typeof updateProgress === 'function') updateProgress(percent);
          },
        });
        this.ready = true;
        return this.engine;
    } catch (e) {
        console.error('Model load failed:', e);
        throw e;
    }
  },

  async generate(userText, { system = '', onToken } = {}) {
    if (!this.engine) throw new Error('Model not loaded');
    this._aborted = false;
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: userText });
    
    try {
        const stream = await this.engine.chat.completions.create({ messages, stream: true });
        for await (const chunk of stream) {
          if (this._aborted) break;
          const token = chunk?.choices?.[0]?.delta?.content || '';
          if (token && typeof onToken === 'function') onToken(token);
        }
    } catch(e) {
        console.error("Gen error", e);
        if (onToken) onToken(" [Error generating response]");
    }
  },

  stop() { this._aborted = true; }
};