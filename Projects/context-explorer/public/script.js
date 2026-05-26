const TIPS = [
    'Upload a file to give the AI specific context — it will use that information to give you better answers.',
    'The more relevant context you provide, the more personalized and accurate the response.',
    'Start a New Chat when switching topics — it clears distracting context from previous conversations.',
    'Think: what would a trusted advisor need to know to answer your question well? Give that to the AI.',
    'AI can hold the equivalent of 4–5 Harry Potter books in its context at once.',
    'Your chat history is part of the context — the AI remembers everything said in this conversation.',
    'Too much irrelevant context can make answers worse. Keep context focused on your topic.',
    'A short prompt gives a generic answer. A rich context gives a personalized, accurate answer.'
];

let tipIndex = 0;

function rotateTip() {
    document.getElementById('tipText').textContent = TIPS[tipIndex % TIPS.length];
    tipIndex++;
}

async function loadModels() {
    try {
        const res = await fetch('/api/models');
        const data = await res.json();
        if (data.models?.length) {
            const sel = document.getElementById('modelSelect');
            sel.innerHTML = data.models.map(m => `<option value="${m}">${m}</option>`).join('');
        }
    } catch {}
}

async function loadContext() {
    const res = await fetch('/api/context');
    const data = await res.json();
    updateContextPanel(data);
    document.getElementById('systemPromptText').textContent = data.systemPrompt;
}

function updateContextPanel(data) {
    const stats = data.stats;
    const max = stats.maxWords;

    document.getElementById('meterPercent').textContent = stats.percent + '%';
    document.getElementById('meterWords').textContent = `${stats.totalWords.toLocaleString()} / ${max.toLocaleString()} words`;

    document.getElementById('meterSystem').style.width = ((stats.systemWords / max) * 100) + '%';
    document.getElementById('meterFiles').style.width = ((stats.fileWords / max) * 100) + '%';
    document.getElementById('meterHistory').style.width = ((stats.historyWords / max) * 100) + '%';

    document.getElementById('systemWordCount').textContent = stats.systemWords + ' words';
    document.getElementById('fileWordCount').textContent = stats.fileWords + ' words';
    document.getElementById('historyWordCount').textContent = stats.historyWords + ' words';

    // Files
    const fileList = document.getElementById('fileList');
    const files = data.uploadedFiles || [];
    if (files.length === 0) {
        fileList.innerHTML = '<p class="empty-msg">No files uploaded yet.<br/>Upload a .txt or .csv to give the AI more context.</p>';
    } else {
        fileList.innerHTML = files.map(f => `
            <div class="file-item">
                <span class="file-item-name">&#128196; ${f.name}</span>
                <span class="file-item-words">${f.wordCount} words</span>
                <button class="file-item-del" onclick="removeFile('${encodeURIComponent(f.name)}')" title="Remove">&#10005;</button>
            </div>
        `).join('');
    }

    // Update upload bar in chat
    const uploadBar = document.getElementById('uploadedBar');
    uploadBar.innerHTML = files.map(f => `
        <div class="upload-chip">
            &#128196; ${f.name}
            <button onclick="removeFile('${encodeURIComponent(f.name)}')" title="Remove">&#10005;</button>
        </div>
    `).join('');

    // History stats
    const msgCount = data.messageCount || 0;
    document.getElementById('historyStats').textContent = msgCount === 0
        ? 'No messages yet.'
        : `${msgCount} message${msgCount !== 1 ? 's' : ''} in history (${stats.historyWords} words)`;
}

function addMessage(role, text) {
    const container = document.getElementById('chatMessages');
    const welcome = container.querySelector('.welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = `
        <div class="msg-role">${role === 'user' ? 'You' : 'AI'}</div>
        <div class="msg-bubble"></div>
    `;
    div.querySelector('.msg-bubble').textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div.querySelector('.msg-bubble');
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    const btn = document.querySelector('.send-btn');
    btn.disabled = true;
    input.value = '';
    input.style.height = 'auto';

    addMessage('user', message);

    const aiBubble = addMessage('assistant', '');
    aiBubble.innerHTML = '<span class="thinking">Thinking...</span>';

    const model = document.getElementById('modelSelect').value;
    let fullText = '';

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model })
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value).split('\n')) {
                if (!line.startsWith('data: ')) continue;
                try {
                    const json = JSON.parse(line.slice(6));
                    if (json.status) {
                        aiBubble.innerHTML = `<span class="thinking">${json.status}</span>`;
                    }
                    if (json.clearStatus) {
                        aiBubble.textContent = '';
                        fullText = '';
                    }
                    if (json.text) {
                        fullText += json.text;
                        aiBubble.textContent = fullText;
                        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
                    }
                    if (json.done) updateContextPanel({ uploadedFiles: [], messageCount: 0, stats: json.stats, systemPrompt: '' });
                    if (json.error) aiBubble.textContent = 'Error: ' + json.error;
                } catch {}
            }
        }
    } catch (err) {
        aiBubble.textContent = 'Error: ' + err.message;
    }

    btn.disabled = false;
    await loadContext();
    rotateTip();
}

async function uploadFile(input) {
    const file = input.files[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    try {
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const data = await res.json();
        if (data.error) return alert(data.error);
        await loadContext();
        rotateTip();
    } catch (err) {
        alert('Upload failed: ' + err.message);
    }
    input.value = '';
}

async function removeFile(encodedName) {
    await fetch(`/api/upload/${encodedName}`, { method: 'DELETE' });
    await loadContext();
}

async function clearContext() {
    if (!confirm('Start a new chat? This clears all messages and uploaded files.')) return;
    await fetch('/api/context', { method: 'DELETE' });
    document.getElementById('chatMessages').innerHTML = `
        <div class="welcome">
            <div class="welcome-icon">&#129504;</div>
            <h2>Start a conversation</h2>
            <p>Ask me anything. Upload files to give me more context and watch how it improves my answers.</p>
        </div>`;
    await loadContext();
}

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    const ta = document.getElementById('messageInput');
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

function toggleCard(id) {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// Init
loadModels();
loadContext();
rotateTip();
setInterval(rotateTip, 8000);
