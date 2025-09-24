const quiz = [
    { q: "What is the capital of France?", opts: ["Berlin", "Madrid", "Paris", "Lisbon"], ans: "Paris" },
    { q: "Which language is used for web development?", opts: ["Python", "HTML", "Java", "C++"], ans: "HTML" },
    { q: "Who wrote 'Hamlet'?", opts: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], ans: "William Shakespeare" }
];
let idx = 0, scr = 0, time = 30;
let timer;
const quizDiv = document.getElementById("quiz");
const timerDiv = document.getElementById("timer");
function loadQ() {
    if (idx >= quiz.length)
        return endQ();
    quizDiv.innerHTML = ""; // clear old
    const qData = quiz[idx];
    const qEl = document.createElement("h2");
    qEl.textContent = qData.q;
    quizDiv.appendChild(qEl);
    qData.opts.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => checkA(opt);
        quizDiv.appendChild(btn);
        quizDiv.appendChild(document.createElement("br"));
    });
}
function checkA(opt) {
    if (opt === quiz[idx].ans)
        scr++;
    idx++;
    loadQ();
}
function startT() {
    timer = window.setInterval(() => {
        time--;
        timerDiv.textContent = "Time: " + time;
        if (time <= 0)
            endQ();
    }, 1000);
}
function endQ() {
    if (timer !== undefined)
        clearInterval(timer);
    quizDiv.innerHTML = `<h2>Quiz Over!</h2><p>Your Score: ${scr}/${quiz.length}</p>`;
}
document.getElementById("startBtn").onclick = () => {
    idx = 0;
    scr = 0;
    time = 30;
    startT();
    loadQ();
};
