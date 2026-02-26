export interface StepObserverOptions {
  activateThreshold?: number;
  hysteresis?: number;
  onChange: (payload: {
    index: number;
    progress: number;
    ratio: number;
    direction: -1 | 0 | 1;
    entered_at: number;
  }) => void;
}

export class StepObserver {
  private readonly elements: HTMLElement[];
  private readonly onChange: StepObserverOptions['onChange'];

  private activeIndex = -1;
  private enteredAt = 0;
  private rafId = 0;
  private lastScrollY = 0;

  constructor(elements: HTMLElement[], options: StepObserverOptions) {
    this.elements = elements;
    this.onChange = options.onChange;

    this.onScrollBound = this.onScroll.bind(this);
    this.onResizeBound = this.onResize.bind(this);
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;

    window.addEventListener('scroll', this.onScrollBound, { passive: true });
    window.addEventListener('resize', this.onResizeBound, { passive: true });

    this.scheduleFrame();
  }

  private onScrollBound: () => void;
  private onResizeBound: () => void;

  private onScroll() {
    this.scheduleFrame();
  }

  private onResize() {
    this.scheduleFrame();
  }

  private scheduleFrame() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.evaluate();
    });
  }

  private getStepTopsAbs(): number[] {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    return this.elements.map((el) => el.getBoundingClientRect().top + scrollY);
  }

  private getActiveFromTrigger(triggerAbs: number, tops: number[]): { index: number; progress: number } {
    const n = tops.length;
    if (n === 0) return { index: 0, progress: 0 };
    if (n === 1) return { index: 0, progress: 1 };

    if (triggerAbs <= tops[0]) return { index: 0, progress: 0 };
    if (triggerAbs >= tops[n - 1]) return { index: n - 1, progress: 1 };

    let index = 0;
    for (let i = 0; i < n - 1; i += 1) {
      if (triggerAbs >= tops[i] && triggerAbs < tops[i + 1]) {
        index = i;
        break;
      }
    }

    const start = tops[index];
    const end = tops[index + 1];
    const span = Math.max(1, end - start);
    const progress = Math.max(0, Math.min(1, (triggerAbs - start) / span));
    return { index, progress };
  }

  private evaluate() {
    if (this.elements.length === 0) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const directionNow: -1 | 0 | 1 =
      scrollY > this.lastScrollY ? 1 : scrollY < this.lastScrollY ? -1 : 0;
    this.lastScrollY = scrollY;

    const vh = window.innerHeight || 1;
    const triggerAbs = scrollY + vh * 0.62;
    const tops = this.getStepTopsAbs();
    const { index, progress } = this.getActiveFromTrigger(triggerAbs, tops);

    if (index !== this.activeIndex) {
      const deltaDir: -1 | 0 | 1 = this.activeIndex === -1 ? 0 : index > this.activeIndex ? 1 : -1;
      const resolvedDir = directionNow === 0 ? deltaDir : directionNow;
      this.setActiveIndex(index, 1, progress, resolvedDir);
      return;
    }

    this.onChange({
      index: this.activeIndex,
      progress,
      ratio: 1 - progress,
      direction: directionNow,
      entered_at: this.enteredAt
    });
  }

  setActiveIndex(index: number, ratio = 1, progressOverride?: number, directionOverride?: -1 | 0 | 1) {
    if (index < 0 || index >= this.elements.length) return;
    const direction: -1 | 0 | 1 =
      directionOverride ?? (this.activeIndex === -1 ? 0 : index > this.activeIndex ? 1 : -1);
    this.activeIndex = index;
    this.enteredAt = performance.now();
    const progress = progressOverride ?? 0;
    this.onChange({ index, progress, ratio, direction, entered_at: this.enteredAt });
  }

  destroy() {
    window.removeEventListener('scroll', this.onScrollBound);
    window.removeEventListener('resize', this.onResizeBound);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
