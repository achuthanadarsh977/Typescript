const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const OLLAMA_URL = 'http://localhost:11434';
const MAX_WORDS = 96000; // ~128K tokens

// --- In-memory state ---
let chatHistory = [];
let uploadedFiles = [];

const SYSTEM_PROMPT = `You are a direct, honest, and critical AI assistant. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

HONESTY RULES — follow these at all times:
- Never agree with the user just because they want you to. Truth comes first.
- If the user is factually wrong, say so clearly and explain why.
- Do NOT use filler phrases like "great question", "excellent point", "absolutely", "certainly", or "you're right" unless they have genuinely earned it.
- If you gave a correct answer and the user pushes back without new evidence, hold your position and explain your reasoning.
- Give honest critical feedback when reviewing ideas, plans, or work — point out flaws, not just positives.
- Prioritize being accurate and useful over being agreeable or making the user feel good.
- When documents are provided, use them to give specific and grounded answers.`;

const FLATTERY_PATTERN = /^(great question!?|excellent point!?|absolutely!?|of course!?|certainly!?|you(?:'re| are) (?:absolutely )?right!?|that(?:'s| is) (?:a )?(?:great|excellent|wonderful|fantastic|good|interesting)|what an? (?:interesting|great|excellent|insightful)|i (?:completely )?agree)[,!.\s]*/i;

function removeFlattery(text) {
    return text.replace(FLATTERY_PATTERN, '').trim();
}

function isPushback(message) {
    return /\b(wrong|disagree|no that|not right|incorrect|that's not|i don't think|are you sure|that can't be|i think you|you're mistaken)\b/i.test(message);
}

async function ollamaChat(messages, model, options = {}) {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false, options: { num_predict: 400, temperature: 0.1, ...options } })
    });
    const data = await res.json();
    return data.message?.content || '';
}

function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function buildContextStats() {
    const systemWords = wordCount(SYSTEM_PROMPT);
    const fileWords = uploadedFiles.reduce((sum, f) => sum + f.wordCount, 0);
    const historyWords = chatHistory.reduce((sum, m) => sum + wordCount(m.content), 0);
    const totalWords = systemWords + fileWords + historyWords;
    return { systemWords, fileWords, historyWords, totalWords, maxWords: MAX_WORDS, percent: Math.min(100, Math.round((totalWords / MAX_WORDS) * 100)) };
}

function buildMessages(userMessage) {
    let systemContent = SYSTEM_PROMPT;

    // Fix #4: Detect pushback and remind model to hold its ground
    if (isPushback(userMessage) && chatHistory.length > 0) {
        systemContent += '\n\nNOTE: The user appears to be disagreeing with your previous answer. Only revise your answer if they provide new facts or evidence. Do NOT cave to social pressure or just because they sound confident.';
    }

    if (uploadedFiles.length > 0) {
        systemContent += '\n\n--- Uploaded Documents ---\n';
        uploadedFiles.forEach(f => {
            systemContent += `\n[File: ${f.name}]\n${f.content}\n`;
        });
        systemContent += '\n--- End of Documents ---';
    }

    return [{ role: 'system', content: systemContent }, ...chatHistory, { role: 'user', content: userMessage }];
}

// --- Routes ---

app.get('/api/models', async (req, res) => {
    try {
        const r = await fetch(`${OLLAMA_URL}/api/tags`);
        const data = await r.json();
        res.json({ models: data.models?.map(m => m.name) || [] });
    } catch {
        res.status(500).json({ error: 'Ollama not running. Run: ollama serve' });
    }
});

app.get('/api/context', (req, res) => {
    res.json({
        systemPrompt: SYSTEM_PROMPT,
        uploadedFiles: uploadedFiles.map(f => ({ name: f.name, wordCount: f.wordCount })),
        messageCount: chatHistory.length,
        stats: buildContextStats()
    });
});

app.post('/api/chat', async (req, res) => {
    const { message, model = 'llama3.2' } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Fix #3: Critic step — get draft answer, critique it, then produce final
        res.write(`data: ${JSON.stringify({ status: 'Thinking...' })}\n\n`);
        const messages = buildMessages(message);

        // Step 1: Draft answer
        const draft = await ollamaChat(messages, model, { num_predict: 500 });

        // Step 2: Self-critique (silent — not shown to user)
        const critique = await ollamaChat([
            { role: 'system', content: 'You are a strict fact-checker. Identify what is factually wrong, incomplete, or sycophantic in the following answer. Be harsh and specific. If nothing is wrong, say "No issues."' },
            { role: 'user', content: `Question: ${message}\n\nAnswer to review: ${draft}` }
        ], model, { num_predict: 200 });

        // Step 3: Final corrected answer (streamed)
        res.write(`data: ${JSON.stringify({ clearStatus: true })}\n\n`);

        const finalMessages = [
            ...messages,
            { role: 'assistant', content: draft },
            { role: 'user', content: `A critic reviewed your answer and said: "${critique}". Now give the corrected, honest final answer. Remove any sycophantic phrases. Be direct.` }
        ];

        const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Fix #2: temperature 0.1 for factual, non-agreeable responses
            body: JSON.stringify({ model, messages: finalMessages, stream: true, options: { num_predict: 600, temperature: 0.1 } })
        });

        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let firstChunk = true;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        fullResponse += json.message.content;

                        // Fix #5: Strip flattery from the very first chunk
                        let toSend = json.message.content;
                        if (firstChunk) {
                            fullResponse = removeFlattery(fullResponse);
                            toSend = fullResponse;
                            firstChunk = false;
                        }
                        if (toSend) res.write(`data: ${JSON.stringify({ text: toSend })}\n\n`);
                    }
                    if (json.done) {
                        chatHistory.push({ role: 'user', content: message });
                        chatHistory.push({ role: 'assistant', content: fullResponse });
                        res.write(`data: ${JSON.stringify({ done: true, stats: buildContextStats() })}\n\n`);
                    }
                } catch {}
            }
        }
        res.end();
    } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const content = req.file.buffer.toString('utf-8');
    const name = req.file.originalname;
    const wc = wordCount(content);

    const existing = uploadedFiles.findIndex(f => f.name === name);
    if (existing >= 0) uploadedFiles[existing] = { name, content, wordCount: wc };
    else uploadedFiles.push({ name, content, wordCount: wc });

    res.json({ name, wordCount: wc, stats: buildContextStats() });
});

app.delete('/api/upload/:name', (req, res) => {
    uploadedFiles = uploadedFiles.filter(f => f.name !== decodeURIComponent(req.params.name));
    res.json({ stats: buildContextStats() });
});

app.delete('/api/context', (req, res) => {
    chatHistory = [];
    uploadedFiles = [];
    res.json({ stats: buildContextStats() });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Context Explorer → http://localhost:${PORT}`);
    console.log('Ensure Ollama is running: ollama serve');
});
