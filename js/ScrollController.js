import { clamp } from './utils/easing.js';
// Read layout on resize, never on every animation frame.
export class ScrollController {
  constructor(sections, onChange) {
    this.sections = [...sections]; this.onChange = onChange; this.raf = 0;
    this.read = () => { const offset = innerWidth <= 800 ? 260 : innerHeight * .27; this.stops = this.sections.map(el => ({ id: el.id, y: Math.max(0, el.getBoundingClientRect().top + scrollY - offset), index: Number(el.dataset.scene) })); this.emit(); };
    this.emit = () => { const y = scrollY; let value = this.stops.at(-1).index, active = this.stops.at(-1).id; for (let i = 0; i < this.stops.length - 1; i++) { const a = this.stops[i], b = this.stops[i + 1]; if (y < b.y) { value = a.index + (b.index - a.index) * clamp((y - a.y) / Math.max(1, b.y - a.y)); active = a.id; break; } } this.onChange(clamp(value, 0, 7), clamp(y / Math.max(1, document.documentElement.scrollHeight - innerHeight)), active); };
    this.scroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.emit(); }); };
    addEventListener('scroll', this.scroll, { passive: true }); addEventListener('resize', this.read); this.resizeObserver = new ResizeObserver(this.read); this.resizeObserver.observe(document.querySelector('.journal-layout')); document.fonts.ready.then(() => { if (!this.destroyed) this.read(); }); this.read();
  }
  destroy() { this.destroyed = true; cancelAnimationFrame(this.raf); removeEventListener('scroll', this.scroll); removeEventListener('resize', this.read); this.resizeObserver.disconnect(); }
}
