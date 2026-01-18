const topicForm = document.getElementById('topicForm');
const topicInput = document.getElementById('topicInput');
const statusEl = document.getElementById('status');

const quizBox = document.getElementById('quizBox');
const questionText = document.getElementById('questionText');
const qBadge = document.getElementById('qBadge');
const answerInput = document.getElementById('answerInput');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const skipBtn = document.getElementById('skipBtn');

const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

const summaryBox = document.getElementById('summaryBox');
const answersList = document.getElementById('answersList');
const restartBtn = document.getElementById('restartBtn');

let questions = [];
let currentIndex = 0;
let answers = [];
let currentTopic = "";

/* ================= UI Helpers ================= */

function uiBusy(on) {
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.disabled = on;
  if (topicInput) topicInput.disabled = on;
  statusEl.textContent = on ? 'Generating 10 questions…' : '';
}

function updateProgress() {
  const total = questions.length || 10;
  const done = Math.min(currentIndex, total);
  const pct = Math.round((done / total) * 100);
  progressBar.style.width = `${pct}%`;
  progressText.textContent = `${done} / ${total}`;
}

function showQuestion(i) {
  const q = questions[i];
  qBadge.textContent = `Q${i + 1}`;
  questionText.textContent = q?.question || '…';
  answerInput.value = '';
  updateProgress();
}

function startQuiz(newQuestions) {
  questions = newQuestions;
  currentIndex = 0;
  answers = [];
  summaryBox.classList.add('hidden');
  quizBox.classList.remove('hidden');
  showQuestion(currentIndex);
}

/* ================= API Call ================= */

async function generateQuestions(topic) {
  try {
    uiBusy(true);

    const res = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();
    console.log("Generated Questions:", data);

    if (!data.success) {
      statusEl.textContent = data.error || "Failed to generate questions";
      return;
    }

    startQuiz(data.questions);
    statusEl.textContent = "";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something went wrong.";
  } finally {
    uiBusy(false);
  }
}

/* ================= Button Logic ================= */

submitAnswerBtn.addEventListener('click', () => {
  if (!questions[currentIndex]) return;

  answers.push({
    id: questions[currentIndex].id,
    question: questions[currentIndex].question,
    answer: answerInput.value.trim()
  });

  currentIndex++;

  if (currentIndex < questions.length) {
    showQuestion(currentIndex);
  } else {
    quizBox.classList.add('hidden');
    summaryBox.classList.remove('hidden');

    answersList.innerHTML = '';
    answers.forEach((a, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Q${i + 1}:</strong> ${a.question}<br>
        <em>Your answer:</em> ${a.answer || '<span style="color:#94a3b8">[skipped]</span>'}`;
      answersList.appendChild(li);
    });

    updateProgress();
  }
});

skipBtn.addEventListener('click', () => {
  answers.push({
    id: questions[currentIndex].id,
    question: questions[currentIndex].question,
    answer: ''
  });

  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion(currentIndex);
  } else {
    quizBox.classList.add('hidden');
    summaryBox.classList.remove('hidden');
  }
});

restartBtn?.addEventListener('click', () => {
  summaryBox.classList.add('hidden');
  questions = [];
  answers = [];
  currentIndex = 0;
  updateProgress();
});

document.getElementById("closeBtn")?.addEventListener("click", () => {
  window.location.href = '/';
});

/* ================= ENTRY POINT ================= */

// 1️⃣ If opened via role-tag
const savedTopic = localStorage.getItem('interroai_topic');

if (savedTopic) {
  currentTopic = savedTopic;
  localStorage.removeItem('interroai_topic');

  // 🔥 Hide topic input UI
  if (topicForm) topicForm.style.display = 'none';
  document.querySelector('.muted').innerHTML =
    "I’ll generate 10 questions. You’ll answer them one by one.";

  generateQuestions(currentTopic);
}

// 2️⃣ Manual topic entry (custom)
topicForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const topic = topicInput.value.trim();
  if (!topic) return;
  currentTopic = topic;
  generateQuestions(topic);
});
