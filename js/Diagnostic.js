import { PROGRAMS } from './config.js';
const QUESTIONS = [
  { title: 'Где тебе нужен английский?', note: 'Начнём с разговора, который ты хочешь вести.', answers: [['it', 'На работе в IT-команде'], ['life', 'В жизни и путешествиях'], ['business', 'На встречах и переговорах'], ['interview', 'На собеседовании']] },
  { title: 'Выбери естественную фразу.', note: 'Ты работаешь в компании уже три года и продолжаешь работать.', answers: [['a', 'I work here since three years.'], ['b', 'I have worked here for three years.'], ['c', 'I am working here during three years.'], ['skip', 'Пока не знаю']], correct: 'b' },
  { title: 'Что хочет узнать собеседник?', note: '“Could you walk me through your last project?”', answers: [['a', 'Как ты добираешься до работы'], ['b', 'Сколько стоит твой проект'], ['c', 'Как проходила работа над последним проектом'], ['skip', 'Пока не знаю']], correct: 'c' },
  { title: 'Что сейчас сложнее всего?', note: 'Это поможет выбрать практику для первого занятия.', answers: [['words', 'Знаю слова, но долго собираю фразу'], ['fear', 'Боюсь ошибиться и замолкаю'], ['listening', 'Не успеваю понимать собеседника'], ['start', 'Не знаю, с чего начать']] },
  { title: 'Сколько практики поместится в неделю?', note: 'Выбираем ритм, который получится поддерживать.', answers: [['one', 'Одно занятие и короткая практика'], ['two', 'Два занятия и практика между ними'], ['three', 'Три или больше занятий']] },
];
export class Diagnostic {
  constructor(dialog, onComplete) {
    this.dialog = dialog; this.content = dialog.querySelector('#diagnostic-content'); this.onComplete = onComplete; this.answers = []; this.step = 0;
    this.click = event => {
      const option = event.target.closest('[data-answer]');
      if (option) { this.answers[this.step] = option.dataset.answer; this.render(false); this.content.querySelector(`[data-answer="${option.dataset.answer}"]`).focus(); }
      if (event.target.closest('[data-quiz-next]') && this.answers[this.step]) { this.step++; this.render(); }
      if (event.target.closest('[data-quiz-back]')) { this.step--; this.render(); }
      if (event.target.closest('[data-quiz-restart]')) { this.answers = []; this.step = 0; this.render(); }
      if (event.target.closest('[data-quiz-book]')) { this.dialog.close(); this.onComplete(this.result()); }
    };
    this.content.addEventListener('click', this.click);
    this.backdrop = event => { if (event.target === this.dialog) { const rect = this.dialog.getBoundingClientRect(); if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dialog.close(); } };
    this.dialog.addEventListener('click', this.backdrop);
  }
  open() { this.render(false); this.dialog.showModal(); this.content.querySelector('h2').focus(); }
  result() {
    const program = this.answers[0] || 'it';
    const score = Number(this.answers[1] === 'b') + Number(this.answers[2] === 'c');
    const practice = { words: 'Короткие ответы без дословного перевода', fear: 'Безопасные диалоги и повторение удачных фраз', listening: 'Короткие фрагменты живой речи с разбором', start: 'Базовые фразы из твоих повседневных ситуаций' }[this.answers[3]];
    const rhythm = { one: 1, two: 2, three: 3 }[this.answers[4]] || 2;
    const label = score === 0 ? 'Собираем опору' : score === 1 ? 'Соединяем знания с речью' : 'Переносим знания в диалог';
    const summary = `Направление: ${PROGRAMS[program].tag}\nМаршрут: ${label}\nПервый фокус: ${practice}\nРитм: ${rhythm} занятий в неделю\nКороткие задания: ${score}/2. Это ориентир, не оценка CEFR.`;
    return { program, score, practice, rhythm, label, summary };
  }
  render(focus = true) {
    if (this.step >= QUESTIONS.length) {
      const r = this.result();
      this.content.innerHTML = `<span class="eyebrow">ТВОЙ СТАРТОВЫЙ МАРШРУТ</span><h2 id="diagnostic-title" tabindex="-1">${r.label}.</h2><span class="quiz-result-tag mono">${PROGRAMS[r.program].tag}</span><ul class="quiz-result-list"><li>${r.practice}</li><li>${r.rhythm} ${r.rhythm === 1 ? 'занятие' : 'занятия'} в неделю</li><li>Первая цель — разыграть одну твою реальную ситуацию</li></ul><p class="quiz-small">${r.score} из 2 коротких языковых заданий. Это ориентир для знакомства, а не определение уровня CEFR. Уровень и план уточним в разговоре.</p><div class="quiz-actions"><button class="quiz-back" data-quiz-restart>Пройти заново</button><button class="button" data-quiz-book>К первому созвону <span aria-hidden="true">+</span></button></div>`;
    } else {
      const q = QUESTIONS[this.step];
      this.content.innerHTML = `<span class="eyebrow">ЗНАКОМСТВО / ${String(this.step + 1).padStart(2, '0')} ИЗ 05</span><div class="quiz-progress" aria-hidden="true">${QUESTIONS.map((_, i) => `<span class="${i <= this.step ? 'done' : ''}"></span>`).join('')}</div><h2 id="diagnostic-title" tabindex="-1">${q.title}</h2><p>${q.note}</p><div class="quiz-options" role="group" aria-labelledby="diagnostic-title">${q.answers.map(([key, label]) => `<button data-answer="${key}" class="${this.answers[this.step] === key ? 'selected' : ''}" aria-pressed="${this.answers[this.step] === key}">${label}</button>`).join('')}</div><div class="quiz-actions">${this.step ? '<button class="quiz-back" data-quiz-back>Назад</button>' : '<span class="mono quiz-small">ОКОЛО 2 МИНУТ</span>'}<button class="button button-dark" data-quiz-next ${this.answers[this.step] ? '' : 'disabled'}>${this.step === QUESTIONS.length - 1 ? 'Мой маршрут' : 'Продолжить'} <span aria-hidden="true">+</span></button></div>`;
    }
    if (focus) this.content.querySelector('h2').focus();
  }
  destroy() { this.content.removeEventListener('click', this.click); this.dialog.removeEventListener('click', this.backdrop); }
}
