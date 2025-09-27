interface QData {
  q: string;
  opts: string[];
  ans: string;
}

const quiz: QData[] = [
  { q: "What is the capital of France?", opts: ["Berlin", "Madrid", "Paris", "Lisbon"], ans: "Paris" },
  { q: "Which language is used for web development?", opts: ["Python", "HTML", "Java", "C++"], ans: "HTML" },
  { q: "Who wrote 'Hamlet'?", opts: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], ans: "William Shakespeare" }
];

let idx = 0, scr = 0, time = 30;
let timer: number | undefined;

const quizDiv = document.getElementById("quiz") as HTMLDivElement;
const timerDiv = document.getElementById("timer") as HTMLDivElement;

function loadQ(): void {
  if (idx >= quiz.length) return endQ();

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

function checkA(opt: string): void {
  if (opt === quiz[idx].ans) scr++;
  idx++;
  loadQ();
}

function startT(): void {
  timer = window.setInterval(() => {
    time--;
    timerDiv.textContent = "Time: " + time;
    if (time <= 0) endQ();
  }, 1000);
}

function endQ(): void {
  if (timer !== undefined) clearInterval(timer);
  quizDiv.innerHTML = `<h2>Quiz Over!</h2><p>Your Score: ${scr}/${quiz.length}</p>`;
}

document.getElementById("startBtn")!.onclick = () => {
  idx = 0;
  scr = 0;
  time = 30;
  startT();
  loadQ();
};
