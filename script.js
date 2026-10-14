const STAGES = [
  {
    title: "Станція 1. Знайди SUS",
    icon: "🐞",
    inputs: [
      { label: "№ SUS", accepted: [4] },
      { label: "Відповідь", accepted: [8] },
    ],
    successHint: "SUS-вираз знешкоджено! Запишіть відповідь у маршрутний лист і рухайтесь до станції 2.",
    riddle: "Тут брязкають ложки й пахне гарячим борщем. Після уроку всі біжать сюди першими.",
    location: "Їдальня",
    placeIcon: "🍲",
    failHint: "Перевірте кожен рядок: спочатку дії в дужках. Шукайте приклад, де результат не сходиться.",
  },
  {
    title: "Станція 2. Не стань NPC",
    icon: "⚡",
    inputs: [
      { label: "01", accepted: [15] },
      { label: "02", accepted: [30] },
      { label: "03", accepted: [9] },
      { label: "04", accepted: [44] },
      { label: "05", accepted: [10] },
      { label: "06", accepted: [25] },
      { label: "07", accepted: [55] },
      { label: "08", accepted: [45] },
    ],
    successHint: "Бліц пройдено! Рухайтесь до станції 3 — рятувати базу.",
    riddle: "Найпросторіше місце школи: тут збираються всі класи на свята й лінійки.",
    location: "Загальна зала",
    placeIcon: "🎭",
    failHint: "Пам'ятайте порядок дій: спочатку дужки, потім × та :, і лише тоді + та −.",
  },
  {
    title: "Станція 3. Minecraft: врятуй базу",
    icon: "⛏️",
    inputs: [
      { label: "Периметр", accepted: [38] },
      { label: "Площа", accepted: [84] },
      { label: "Паркан", accepted: [36] },
      { label: "Кімната", accepted: [12] },
      { label: "Решта", accepted: [72] },
    ],
    successHint: "Базу врятовано! Обчисліть код скрині та запишіть його у маршрутний лист. Далі станція 4.",
    riddle: "Коли лунає сигнал тривоги, уся школа спускається саме сюди. Тут безпечно.",
    location: "Укриття",
    placeIcon: "🚨",
    failHint: "Периметр — сума всіх сторін, площа — довжина × ширина. Паркан = периметр мінус прохід завширшки 2 блоки.",
  },
  {
    title: "Станція 4. Мемний шифр",
    icon: "🐱",
    inputs: [
      { label: "1", accepted: [8] },
      { label: "2", accepted: [4] },
      { label: "3", accepted: [7] },
      { label: "4", accepted: [7] },
    ],
    successHint: "Код доступу прийнято! Залишився фінальний бій з MATH_BUG.exe.",
    riddle: "Двері, за якими сидить найголовніша людина школи. Повз них проходять тихенько.",
    location: "Біля кабінету директора",
    placeIcon: "🚪",
    failHint: "Спершу знайдіть значення символів: Кіт, Піца, Моаї, Прибулець. Потім візьміть останню цифру кожної відповіді.",
  },
  {
    title: "Фінальний рівень. Boss Fight",
    icon: "👾",
    inputs: [
      { label: "1", accepted: [0] },
      { label: "2", accepted: [0] },
      { label: "3", accepted: [0] },
    ],
    successHint: "🏆 Доступ дозволено! MATH_BUG.exe видалено. Математику врятовано!",
    riddle: "Там, де ваші парти й дошка. Місце, звідки все почалося — поверніться туди.",
    location: "Клас",
    placeIcon: "📚",
    failHint: "Символи змінили значення: Кіт + Кіт = 20, Кіт + Піца = 15, Піца + Прибулець = 5. Перерахуйте завдання 2 і 3.",
  },
];

const stageScreen = document.getElementById("stage-screen");
const noStageScreen = document.getElementById("no-stage-screen");
const successScreen = document.getElementById("success-screen");
const successHint = document.getElementById("success-hint");
const successLocation = document.getElementById("success-location");
const successRiddle = document.getElementById("success-riddle");
const successPlaceIcon = document.getElementById("success-place-icon");
const finalPlaceIcon = document.getElementById("final-place-icon");
const successReveal = document.getElementById("success-reveal");
const finalLocation = document.getElementById("final-location");
const finalRiddle = document.getElementById("final-riddle");
const finalReveal = document.getElementById("final-reveal");
const successDots = document.getElementById("success-dots");
const finalScreen = document.getElementById("final-screen");
const finalHint = document.getElementById("final-hint");
const stageIcon = document.getElementById("stage-icon");
const progressDots = document.getElementById("progress-dots");
const stageTitle = document.getElementById("stage-title");
const inputsArea = document.getElementById("inputs-area");
const feedback = document.getElementById("feedback");
const submitBtn = document.getElementById("submit-btn");

const FEEDBACK_ICONS = { success: "✅", fail: "💡", neutral: "✏️" };

let currentStage = null;
let inputElements = [];

function getStageFromURL() {
  const raw = new URLSearchParams(location.search).get("stage");
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1 || n > STAGES.length) return null;
  return n;
}

function showScreen(screen) {
  [stageScreen, successScreen, noStageScreen, finalScreen].forEach((el) => {
    el.hidden = el !== screen;
  });
}

function setFeedback(text, type) {
  feedback.innerHTML = "";
  feedback.className = "feedback" + (type ? " " + type : "");
  feedback.hidden = !text;
  if (!text) return;

  const icon = document.createElement("span");
  icon.className = "feedback-icon";
  icon.textContent = FEEDBACK_ICONS[type] || "";

  const label = document.createElement("span");
  label.className = "feedback-text";
  label.textContent = text;

  feedback.append(icon, label);
}

const PIXEL_SIZE = 6;

function buildPixelGrid(revealBtn) {
  const mask = revealBtn.querySelector(".reveal-mask");
  mask.querySelector(".pixel-grid")?.remove();

  const { width, height } = mask.getBoundingClientRect();
  if (!width || !height) return;

  const cols = Math.max(1, Math.round(width / PIXEL_SIZE));
  const rows = Math.max(1, Math.round(height / PIXEL_SIZE));

  const grid = document.createElement("span");
  grid.className = "pixel-grid";
  grid.style.setProperty("--cols", cols);
  grid.style.setProperty("--rows", rows);

  const fadeCols = Math.max(2, Math.round(cols * 0.16));
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const distX = Math.min(col, cols - 1 - col);
      const distY = Math.min(row, rows - 1 - row);
      const fadeX = Math.min(1, (distX + 1) / (fadeCols + 1));
      const fadeY = rows > 2 ? Math.min(1, (distY + 1) / 2) : 1;

      const px = document.createElement("span");
      px.className = "px";
      px.style.setProperty("--e", (fadeX * fadeY).toFixed(2));
      px.style.setProperty("--l", `${(58 + Math.random() * 28).toFixed(0)}%`);
      px.style.setProperty("--g", `${(3 + Math.random() * 5).toFixed(1)}px`);
      px.style.setProperty("--dur", `${(1.6 + Math.random() * 1.9).toFixed(2)}s`);
      px.style.setProperty("--d", `${(Math.random() * 2.6).toFixed(2)}s`);
      px.style.setProperty("--i", `${Math.round(col * 14 + row * 22 + Math.random() * 70)}ms`);
      fragment.appendChild(px);
    }
  }

  grid.appendChild(fragment);
  mask.appendChild(grid);
}

function renderProgressDots(target, stageNumber, { solved = false } = {}) {
  target.innerHTML = "";
  STAGES.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot";
    if (i + 1 === stageNumber) dot.classList.add(solved ? "done" : "current");
    else if (i + 1 < stageNumber) dot.classList.add("done");
    target.appendChild(dot);
  });
}

function renderStage(stageNumber) {
  currentStage = STAGES[stageNumber - 1];
  stageIcon.textContent = currentStage.icon;
  renderProgressDots(progressDots, stageNumber);
  stageTitle.textContent = currentStage.title;
  setFeedback("", null);

  inputsArea.innerHTML = "";
  inputsArea.classList.toggle("inputs-area--compact", currentStage.inputs.length > 3);
  inputElements = currentStage.inputs.map(() => {
    const wrapper = document.createElement("div");
    wrapper.className = "input-field";

    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.placeholder = "?";
    wrapper.appendChild(input);
    inputsArea.appendChild(wrapper);
    return input;
  });

  currentStage.inputs.forEach((cfg, i) => {
    if (cfg.label) {
      const label = document.createElement("label");
      label.textContent = cfg.label;
      inputElements[i].insertAdjacentElement("beforebegin", label);
    }
  });

  inputElements.forEach((input, i) => {
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (i < inputElements.length - 1) {
        inputElements[i + 1].focus();
      } else {
        checkAnswer(stageNumber);
      }
    });

    input.addEventListener("focus", () => {
      if (input.classList.contains("incorrect")) {
        input.classList.remove("incorrect");
        input.value = "";
      }
    });
  });

  showScreen(stageScreen);
  inputElements[0].focus();
}

function checkAnswer(stageNumber) {
  const values = inputElements.map((input) => input.value.trim());

  if (values.some((v) => v === "" || Number.isNaN(Number(v)))) {
    setFeedback("Заповніть усі поля числами!", "neutral");
    return;
  }

  let allCorrect = true;
  inputElements.forEach((input, i) => {
    const value = Number(input.value);
    const correct = currentStage.inputs[i].accepted.includes(value);
    input.classList.remove("correct", "incorrect");
    input.classList.add(correct ? "correct" : "incorrect");
    if (!correct) allCorrect = false;
  });

  if (allCorrect) {
    if (stageNumber === STAGES.length) {
      finalHint.textContent = currentStage.successHint;
      finalRiddle.textContent = currentStage.riddle;
      finalLocation.textContent = currentStage.location;
      finalPlaceIcon.textContent = currentStage.placeIcon;
      finalReveal.classList.remove("revealed");
      showScreen(finalScreen);
      requestAnimationFrame(() => buildPixelGrid(finalReveal));
    } else {
      successHint.textContent = currentStage.successHint;
      successRiddle.textContent = currentStage.riddle;
      successLocation.textContent = currentStage.location;
      successPlaceIcon.textContent = currentStage.placeIcon;
      successReveal.classList.remove("revealed");
      renderProgressDots(successDots, stageNumber, { solved: true });
      showScreen(successScreen);
      requestAnimationFrame(() => buildPixelGrid(successReveal));
    }
    return;
  }

  setFeedback(currentStage.failHint, "fail");
}

submitBtn.addEventListener("click", () => checkAnswer(getStageFromURL()));

const gate = document.getElementById("gate");
const gateTask = document.getElementById("gate-task");
const gateInput = document.getElementById("gate-input");
const gateError = document.getElementById("gate-error");
const gateSubmit = document.getElementById("gate-submit");
const gateClose = document.getElementById("gate-close");

let gateTarget = null;
let gateAnswer = null;

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function makeGateTask() {
  if (Math.random() < 0.5) {
    const a = randomInt(3, 9);
    const b = randomInt(3, 9);
    return { text: `${a} × ${b}`, answer: a * b };
  }
  const a = randomInt(21, 69);
  const b = randomInt(11, 29);
  return { text: `${a} + ${b}`, answer: a + b };
}

function openGate(revealBtn) {
  const task = makeGateTask();
  gateTarget = revealBtn;
  gateAnswer = task.answer;
  gateTask.textContent = `${task.text} = ?`;
  gateInput.value = "";
  gateInput.classList.remove("wrong");
  gateError.hidden = true;
  gate.hidden = false;
  gateInput.focus();
}

function closeGate() {
  gate.hidden = true;
  gateTarget = null;
}

function submitGate() {
  const value = gateInput.value.trim();
  if (value === "" || Number(value) !== gateAnswer) {
    gateInput.classList.remove("wrong");
    void gateInput.offsetWidth;
    gateInput.classList.add("wrong");
    gateError.hidden = false;
    gateInput.select();
    return;
  }

  gateTarget.classList.add("revealed");
  closeGate();
}

[successReveal, finalReveal].forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!btn.classList.contains("revealed")) openGate(btn);
  });
});

gateSubmit.addEventListener("click", submitGate);
gateClose.addEventListener("click", closeGate);

gateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitGate();
  }
});

gate.addEventListener("click", (e) => {
  if (e.target === gate) closeGate();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !gate.hidden) closeGate();
});

function init() {
  const stageNumber = getStageFromURL();
  if (stageNumber === null) {
    showScreen(noStageScreen);
    return;
  }
  renderStage(stageNumber);
}

init();
