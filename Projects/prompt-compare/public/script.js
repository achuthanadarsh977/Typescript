let chipTarget = 1;

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

function fill(text) {
    document.getElementById(`prompt${chipTarget}`).value = text;
    chipTarget = chipTarget === 1 ? 2 : 1;
}

function newChat() {
    document.getElementById('prompt1').value = '';
    document.getElementById('prompt2').value = '';
    setResult('result1', '');
    setResult('result2', '');
    chipTarget = 1;
}

function setStatus(id, msg) {
    const el = document.getElementById(id);
    el.classList.add('visible');
    el.innerHTML = `<div class="status-msg"><div class="spinner"></div>${msg}</div>`;
}

function setResult(id, text) {
    const el = document.getElementById(id);
    if (!text) {
        el.classList.remove('visible');
        el.textContent = '';
    } else {
        el.classList.add('visible');
        el.textContent = text;
    }
}

async function stream(endpoint, prompt, resultId) {
    const model = document.getElementById('modelSelect').value;

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6);
            if (raw === '[DONE]') return;

            try {
                const json = JSON.parse(raw);
                if (json.error) { setResult(resultId, 'Error: ' + json.error); return; }
                if (json.status) { setStatus(resultId, json.status); }
                if (json.clearStatus) { setResult(resultId, ''); text = ''; }
                if (json.text) {
                    text += json.text;
                    setResult(resultId, text);
                }
            } catch {}
        }
    }
}

async function compare() {
    const p1 = document.getElementById('prompt1').value.trim();
    const p2 = document.getElementById('prompt2').value.trim();

    if (!p1 && !p2) { alert('Please enter at least one prompt.'); return; }

    const btn = document.getElementById('compareBtn');
    btn.disabled = true;
    btn.textContent = 'Running...';

    const tasks = [];
    if (p1) tasks.push(stream('/api/websearch', p1, 'result1'));
    if (p2) tasks.push(stream('/api/deepresearch', p2, 'result2'));

    await Promise.all(tasks);

    btn.disabled = false;
    btn.textContent = '≿ Compare';
}

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') compare();
});

loadModels();
