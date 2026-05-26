require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const OLLAMA_URL = 'http://localhost:11434';
const TAVILY_KEY = process.env.TAVILY_API_KEY;

async function tavilySearch(query, depth = 'basic', maxResults = 5) {
    const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: TAVILY_KEY,
            query,
            search_depth: depth,
            max_results: maxResults,
            include_answer: true,
            include_raw_content: false
        })
    });
    if (!res.ok) throw new Error(`Tavily error: ${res.statusText}`);
    return await res.json();
}

async function streamOllama(messages, model, res, maxTokens = 400) {
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            options: { num_predict: maxTokens, temperature: 0.1 }
        })
    });
    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    let started = false;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
            try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                    if (!started) {
                        res.write(`data: ${JSON.stringify({ clearStatus: true })}\n\n`);
                        started = true;
                    }
                    res.write(`data: ${JSON.stringify({ text: json.message.content })}\n\n`);
                }
                if (json.done) res.write('data: [DONE]\n\n');
            } catch {}
        }
    }
}

app.get('/api/models', async (req, res) => {
    try {
        const r = await fetch(`${OLLAMA_URL}/api/tags`);
        const data = await r.json();
        res.json({ models: data.models?.map(m => m.name) || [] });
    } catch { res.status(500).json({ error: 'Ollama not running.' }); }
});

// Web Search — Tavily answer returned directly, no Ollama (fast)
app.post('/api/websearch', async (req, res) => {
    const { prompt, model = 'llama3.2' } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!TAVILY_KEY || TAVILY_KEY === 'your_tavily_api_key_here') {
            res.write(`data: ${JSON.stringify({ error: 'Add your Tavily API key to .env' })}\n\n`);
            return res.end();
        }

        res.write(`data: ${JSON.stringify({ status: 'Searching the web...' })}\n\n`);

        const data = await tavilySearch(prompt, 'basic', 5);
        const answer = data.answer || '';
        const results = data.results || [];

        res.write(`data: ${JSON.stringify({ clearStatus: true })}\n\n`);

        if (!answer && results.length === 0) {
            res.write(`data: ${JSON.stringify({ text: 'No web results found. Try rephrasing your question.' })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
        }

        // Send Tavily's answer directly — no Ollama needed
        if (answer) {
            res.write(`data: ${JSON.stringify({ text: answer })}\n\n`);
        }

        // Append source links
        if (results.length > 0) {
            const sources = '\n\n**Sources:**\n' + results.slice(0, 5)
                .map((r, i) => `[${i + 1}] ${r.title} — ${r.url}`)
                .join('\n');
            res.write(`data: ${JSON.stringify({ text: sources })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

// Deep Research — Tavily basic + Ollama with trimmed context
app.post('/api/deepresearch', async (req, res) => {
    const { prompt, model = 'llama3.2' } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!TAVILY_KEY || TAVILY_KEY === 'your_tavily_api_key_here') {
            res.write(`data: ${JSON.stringify({ error: 'Add your Tavily API key to .env' })}\n\n`);
            return res.end();
        }

        res.write(`data: ${JSON.stringify({ status: 'Researching...' })}\n\n`);

        const data = await tavilySearch(prompt, 'basic', 6);
        const results = data.results || [];
        const answer = data.answer || '';

        if (results.length === 0 && !answer) {
            res.write(`data: ${JSON.stringify({ clearStatus: true })}\n\n`);
            res.write(`data: ${JSON.stringify({ text: 'No sources found. Try a more specific question.' })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
        }

        res.write(`data: ${JSON.stringify({ status: `Analyzing ${results.length} sources...` })}\n\n`);

        // Trim each source to 400 chars to keep Ollama context small
        const context = results.slice(0, 5)
            .map((r, i) => `[${i + 1}] ${r.title}\n${r.content.slice(0, 400)}`)
            .join('\n\n');

        const systemPrompt = `You are a research analyst. Answer using ONLY these sources. Cite [1],[2] etc. Use headings. Be thorough but concise.\n\n${answer ? 'Summary: ' + answer + '\n\n' : ''}Sources:\n${context}`;

        await streamOllama([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], model, res, 500);

        res.end();
    } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Prompt Compare → http://localhost:${PORT}`);
    console.log('Ensure Ollama is running: ollama serve');
});
