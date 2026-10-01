const SIDES = ['top', 'right', 'bottom', 'left'] as const;

export class FirstRunOnboarding {
  private overlay?: HTMLDivElement;
  private target?: HTMLLabelElement;
  private frame?: number;

  show(target: HTMLLabelElement): void {
    if (this.target !== target) {
      this.target?.classList.remove('mpkr-first-run-target');
      this.target = target;
      target.classList.add('mpkr-first-run-target');
    }
    if (!this.overlay) {
      const overlay = document.createElement('div');
      overlay.className = 'mpkr-first-run-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      for (const side of SIDES) {
        const shade = document.createElement('div');
        shade.className = 'mpkr-first-run-shade';
        shade.dataset.side = side;
        overlay.append(shade);
      }
      const prompt = document.createElement('div');
      prompt.className = 'mpkr-first-run-prompt';
      prompt.textContent = '스위치를 켜서 한국어 기능을 시작하세요';
      overlay.append(prompt);
      document.body.append(overlay);
      this.overlay = overlay;
      window.addEventListener('resize', this.scheduleLayout);
      window.addEventListener('scroll', this.scheduleLayout, true);
    }
    this.layout();
  }

  hide(): void {
    this.target?.classList.remove('mpkr-first-run-target');
    this.target = undefined;
    this.overlay?.remove();
    this.overlay = undefined;
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    window.removeEventListener('resize', this.scheduleLayout);
    window.removeEventListener('scroll', this.scheduleLayout, true);
  }

  destroy(): void { this.hide(); }

  private readonly scheduleLayout = () => {
    if (this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      this.layout();
    });
  };

  private layout(): void {
    const overlay = this.overlay;
    const target = this.target;
    if (!overlay || !target?.isConnected) return;
    const rect = target.getBoundingClientRect();
    const padding = 7;
    const left = Math.max(0, rect.left - padding);
    const top = Math.max(0, rect.top - padding);
    const right = Math.min(window.innerWidth, rect.right + padding);
    const bottom = Math.min(window.innerHeight, rect.bottom + padding);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);
    const shades = overlay.querySelectorAll<HTMLElement>('.mpkr-first-run-shade');
    const boxes = [
      [0, 0, window.innerWidth, top],
      [right, top, Math.max(0, window.innerWidth - right), height],
      [0, bottom, window.innerWidth, Math.max(0, window.innerHeight - bottom)],
      [0, top, left, height],
    ];
    shades.forEach((shade, index) => {
      const [x, y, boxWidth, boxHeight] = boxes[index]!;
      Object.assign(shade.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${boxWidth}px`,
        height: `${boxHeight}px`,
      });
    });
    const prompt = overlay.querySelector<HTMLElement>('.mpkr-first-run-prompt');
    if (prompt) {
      const halfPromptWidth = prompt.getBoundingClientRect().width / 2;
      const minimumCenter = 12 + halfPromptWidth;
      const maximumCenter = Math.max(
        minimumCenter,
        window.innerWidth - 12 - halfPromptWidth,
      );
      const targetCenter = rect.left + rect.width / 2;
      prompt.style.left = `${Math.min(maximumCenter, Math.max(minimumCenter, targetCenter))}px`;
      const placeAbove = bottom + 58 > window.innerHeight;
      prompt.dataset.placement = placeAbove ? 'above' : 'below';
      prompt.style.top = `${placeAbove ? Math.max(12, top - 10) : bottom + 10}px`;
    }
  }
}
