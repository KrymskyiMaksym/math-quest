const STAGES = [
  {
    title: "Станція 1. Знайди SUS",
    icon: "🐞",
    inputs: [
      { label: "№ SUS", accepted: [4] },
      { label: "Відповідь", accepted: [8] },
    ],
    successHint: "SUS-вираз знешкоджено! Запишіть відповідь у маршрутний лист і рухайтесь до станції 2.",
    location: "Шкільна бібліотека — стелаж «Математика»",
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
    location: "Спортзал — лава під баскетбольним кільцем",
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
    location: "Кабінет 204 — парта біля вікна",
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
    location: "Актова зала — сцена, біля піаніно",
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
    location: "Кабінет 204 — отримайте відзнаки «Math Boss defeated»",
    failHint: "Символи змінили значення: Кіт + Кіт = 20, Кіт + Піца = 15, Піца + Прибулець = 5. Перерахуйте завдання 2 і 3.",
  },
];

const stageScreen = document.getElementById("stage-screen");
const noStageScreen = document.getElementById("no-stage-screen");
const successScreen = document.getElementById("success-screen");
const successHint = document.getElementById("success-hint");
const successLocation = document.getElementById("success-location");
const finalLocation = document.getElementById("final-location");
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
      finalLocation.textContent = currentStage.location;
      showScreen(finalScreen);
    } else {
      successHint.textContent = currentStage.successHint;
      successLocation.textContent = currentStage.location;
      renderProgressDots(successDots, stageNumber, { solved: true });
      showScreen(successScreen);
    }
    return;
  }

  setFeedback(currentStage.failHint, "fail");
}

submitBtn.addEventListener("click", () => checkAnswer(getStageFromURL()));

function init() {
  const stageNumber = getStageFromURL();
  if (stageNumber === null) {
    showScreen(noStageScreen);
    return;
  }
  renderStage(stageNumber);
}

init();
