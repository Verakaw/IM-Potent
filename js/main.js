import { Scene3D } from './Scene3D.js';
import { ScrollController } from './ScrollController.js';
import { Diagnostic } from './Diagnostic.js';
import { CONFIG, PROGRAMS } from './config.js';

// One lifetime for all UI listeners; destroy releases this and all Three.js resources.
const lifetime = new AbortController();
const listen = (target, event, handler, options = {}) => target.addEventListener(event, handler, { ...options, signal: lifetime.signal });
export const stage = new Scene3D(document.querySelector('#scene-viewport'));
const motionButton = document.querySelector('#motion-toggle');
function syncMotionButton() { motionButton.setAttribute('aria-pressed', String(stage.paused)); motionButton.setAttribute('aria-label', stage.paused ? 'Возобновить 3D-анимацию' : 'Приостановить 3D-анимацию'); motionButton.innerHTML = `<span aria-hidden="true">${stage.paused ? '▷' : 'Ⅱ'}</span>`; }
syncMotionButton();listen(motionButton, 'click', () => { stage.toggleMotion(); syncMotionButton(); });
listen(stage.motionPreference, 'change', syncMotionButton);
const parallaxNotes = [...document.querySelectorAll('.margin-note')];
const scroll = new ScrollController(document.querySelectorAll('.chapter[data-scene]'), (index, reading, chapter) => {
  stage.setScene(stage.motionPreference.matches ? Math.round(index) : index); const scene = stage.scenes[stage.index];
  stage.container.classList.toggle('is-dimmed', chapter === 'faq');
  if(!stage.motionPreference.matches) parallaxNotes.forEach(note=>note.style.transform=`rotate(-3deg) translateY(${(reading-.5)*-14}px)`);
  document.querySelector('.scene-index').textContent = `${String(stage.index + 1).padStart(2, '0')} / 08`;
  document.querySelector('#scene-title').textContent = scene.title;
  document.querySelector('.scene-kicker').textContent = scene.kicker;
  document.querySelector('.scene-meter span').style.transform = `scaleX(${.04 + index / 7 * .96})`;
  document.querySelector('.reading-progress').style.transform = `scaleX(${reading})`;
});

let selectedProgram = 'it', selectedFormat = 'individual', diagnosis = null, requestText = '';
const programTabs = [...document.querySelectorAll('[data-program]')];
function setProgram(key, focus = false) {
  selectedProgram = key; const p = PROGRAMS[key];
  programTabs.forEach(tab => { const active = tab.dataset.program === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  const panel = document.querySelector('#program-panel'); panel.setAttribute('aria-labelledby', `tab-${key}`);
  panel.querySelector('.program-tag').textContent = p.tag; panel.querySelector('h3').innerHTML = p.title;
  document.querySelector('#program-description').textContent = p.description;
  document.querySelector('#program-list').replaceChildren(...p.bullets.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  document.querySelector('#program-level').textContent = p.level;
  stage.setProgram(key);
  if (focus) document.querySelector(`#tab-${key}`).focus();
}
programTabs.forEach(tab => listen(tab, 'click', () => setProgram(tab.dataset.program)));
function arrowGroup(items, attribute, callback) { items.forEach((item, i) => listen(item, 'keydown', event => { let next; if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % items.length; if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i + items.length - 1) % items.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = items.length - 1; if (next !== undefined) { event.preventDefault(); callback(items[next].dataset[attribute]); items[next].focus(); } })); }
arrowGroup(programTabs, 'program', setProgram);

const formatButtons = [...document.querySelectorAll('[data-format]')];
const formatNumber = new Intl.NumberFormat('ru-RU');
function updatePrice() {
  const frequency = Number(document.querySelector('#frequency').value), price = CONFIG.pricing[selectedFormat], count = frequency * CONFIG.pricing.weeks;
  document.querySelector('#frequency-value').textContent = frequency;
  document.querySelector('#sessions-label').textContent = `${count} ЗАНЯТИЙ × ${CONFIG.pricing.minutes} МИНУТ`;
  document.querySelector('#price-total').textContent = formatNumber.format(price * count);
  document.querySelector('#price-currency').textContent = `${CONFIG.pricing.currency} / месяц`;
  document.querySelector('#price-session').textContent = `${formatNumber.format(price)} ${CONFIG.pricing.currency}`;
}
function setFormat(key) { selectedFormat = key; formatButtons.forEach(button => { const active = button.dataset.format === key; button.setAttribute('aria-checked', String(active)); button.tabIndex = active ? 0 : -1; }); stage.setFormat(key); updatePrice(); }
formatButtons.forEach(button => listen(button, 'click', () => setFormat(button.dataset.format)));
arrowGroup(formatButtons, 'format', setFormat);listen(document.querySelector('#frequency'), 'input', updatePrice);updatePrice();

const dialog = document.querySelector('#diagnostic-dialog');
const diagnostic = new Diagnostic(dialog, result => {
  diagnosis = result; setProgram(result.program); document.querySelector('#frequency').value = result.rhythm; updatePrice();
  const goal = document.querySelector('[name=goal]'); if (!goal.value) goal.value = `Хочу английский: ${PROGRAMS[result.program].tag.split(' / ')[1]}. ${result.practice}.`;
  document.querySelector('#contact').scrollIntoView({ behavior: stage.motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
  document.querySelector('[name=name]').focus({ preventScroll: true });
});
document.querySelectorAll('[data-diagnostic]').forEach(button => listen(button, 'click', () => diagnostic.open()));
listen(document.querySelector('.dialog-close'), 'click', () => dialog.close());

const menuButton = document.querySelector('.menu-toggle'), mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Открыть меню'); mobileNav.hidden = true; }
listen(menuButton, 'click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); mobileNav.hidden = !open; });
mobileNav.querySelectorAll('a').forEach(link => listen(link, 'click', closeMenu));
listen(document, 'keydown', e => { if (e.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
listen(window, 'resize', () => { if (innerWidth > 800) closeMenu(); });

// Draft creation is local. Opening an email composer never claims the message was sent.
const form = document.querySelector('#contact-form'), status = document.querySelector('#form-status');
listen(form, 'submit', event => {
  event.preventDefault(); const data = new FormData(form);
  if (!String(data.get('name')).trim()) { form.elements.name.setCustomValidity('Укажи своё имя'); form.elements.name.reportValidity(); return; }
  const frequency = Number(document.querySelector('#frequency').value);
  requestText = `Знакомство с IM Potent\n\nИмя: ${String(data.get('name')).trim()}\nEmail: ${data.get('email')}\nЗадача: ${String(data.get('goal')).trim() || 'Обсудить на знакомстве'}\nПрограмма: ${PROGRAMS[selectedProgram].tag}\nФормат: ${formatButtons.find(b=>b.dataset.format===selectedFormat).querySelector('strong').textContent}\nЗанятий в неделю: ${frequency}\n${diagnosis ? '\nДиагностика:\n' + diagnosis.summary : ''}`;
  document.querySelector('#request-actions').hidden = false;
  status.textContent = CONFIG.contact.email ? 'Заявка готова. Открой письмо и отправь его из своей почты.' : 'Заявка готова. Скачай или скопируй текст, чтобы передать его репетитору.';
  if (CONFIG.contact.email) { const send = document.querySelector('#send-request'); send.hidden = false; send.href = `mailto:${encodeURIComponent(CONFIG.contact.email)}?subject=${encodeURIComponent('Знакомство с IM Potent')}&body=${encodeURIComponent(requestText)}`; }
});
listen(form.elements.name, 'input', () => form.elements.name.setCustomValidity(''));
listen(document.querySelector('#download-request'), 'click', () => { const url = URL.createObjectURL(new Blob([requestText], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'im-potent-request.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
listen(document.querySelector('#copy-request'), 'click', async () => { try { await navigator.clipboard.writeText(requestText); status.textContent = 'Текст заявки скопирован.'; } catch { status.textContent = 'Браузер не разрешил копирование. Скачай текст заявки.'; } });

if (CONFIG.tutor.name) document.querySelector('#tutor-name').textContent = `${CONFIG.tutor.name} / ТВОЙ ТРЕНЕР ПО АНГЛИЙСКОМУ`;
if (CONFIG.tutor.photo) { const photo = document.querySelector('#tutor-photo'); photo.src = CONFIG.tutor.photo; photo.alt = CONFIG.tutor.name || 'Репетитор IM Potent'; photo.closest('.tutor-portrait').hidden = false; }
const contacts = document.querySelector('#contact-links');
for (const [kind, value] of Object.entries(CONFIG.contact)) { if (!value) continue; const link = document.createElement('a'); link.textContent = { email: 'Email', telegram: 'Telegram', instagram: 'Instagram' }[kind]; link.href = kind === 'email' ? `mailto:${value}` : value; if (kind !== 'email') { link.target = '_blank'; link.rel = 'noopener noreferrer'; } contacts.append(link); contacts.hidden = false; }
document.querySelector('#year').textContent = new Date().getFullYear();

const reduceMotion = stage.motionPreference;
// Preserve inline accents and line breaks while revealing heading words in order.
if(!reduceMotion.matches) document.querySelectorAll('h2.reveal').forEach(heading=>{
  const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT),nodes=[];let node;
  while(node=walker.nextNode())nodes.push(node);
  let order=0;
  for(const text of nodes){const fragment=document.createDocumentFragment();for(const part of text.textContent.split(/(\s+)/)){if(!part)continue;if(/^\s+$/.test(part))fragment.append(document.createTextNode(part));else{const span=document.createElement('span');span.className='reveal-word';span.textContent=part;span.style.setProperty('--word-delay',`${Math.min(order++*.035,.2)}s`);fragment.append(span);}}text.replaceWith(fragment);}
});
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); entry.target.classList.remove('is-pending'); revealObserver.unobserve(entry.target); } }), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => { if (!reduceMotion.matches) el.classList.add('is-pending'); revealObserver.observe(el); });
let counterFrame = 0;
if (!reduceMotion.matches) { const counter = document.querySelector('[data-counter]'), start = performance.now(), target = Number(counter.dataset.counter); const tick = now => { const t = Math.min(1, (now - start) / 900); counter.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))); if (t < 1) counterFrame = requestAnimationFrame(tick); }; counterFrame = requestAnimationFrame(tick); }
const cursor = document.querySelector('.pencil-cursor');
if (matchMedia('(pointer:fine)').matches && !reduceMotion.matches) { listen(window, 'pointermove', e => { cursor.style.transform = `translate(${e.clientX+13}px,${e.clientY+13}px)`; cursor.classList.add('active'); }, { passive: true }); listen(document, 'pointerleave', () => cursor.classList.remove('active')); }

export function destroy() { lifetime.abort(); scroll.destroy(); diagnostic.destroy(); revealObserver.disconnect(); cancelAnimationFrame(counterFrame); stage.destroy(); }
listen(window, 'pagehide', event => { if (!event.persisted) destroy(); });
