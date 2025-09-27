var quiz = [
    { q: "What is the capital of France?", opts: ["Berlin", "Madrid", "Paris", "Lisbon"], ans: "Paris" },
    { q: "Which language is used for web development?", opts: ["Python", "HTML", "Java", "C++"], ans: "HTML" },
    { q: "Who wrote 'Hamlet'?", opts: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], ans: "William Shakespeare" }
];
var idx = 0, scr = 0, time = 30, timer;
var quizDiv = document.getElementById("quiz");
var timerDiv = document.getElementById("timer");
function loadQ() {
    if (idx >= quiz.length)
        return endQ();
    quizDiv.innerHTML = ""; // clear old
    var qData = quiz[idx];
    var qEl = document.createElement("h2");
    qEl.textContent = qData.q;
    quizDiv.appendChild(qEl);
    qData.opts.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = function () { return checkA(opt); };
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
    timer = window.setInterval(function () {
        time--;
        timerDiv.textContent = "Time: " + time;
        if (time <= 0)
            endQ();
    }, 1000);
}
function endQ() {
    clearInterval(timer);
    quizDiv.innerHTML = "<h2>Quiz Over!</h2><p>Your Score: ".concat(scr, "/").concat(quiz.length, "</p>");
}
document.getElementById("startBtn").onclick = function () {
    idx = 0;
    scr = 0;
    time = 30;
    startT();
    loadQ();
};
