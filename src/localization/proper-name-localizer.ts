import type { TranslationRecord } from '../core/translation-record';

type ChangeListener = (record: TranslationRecord, element: HTMLElement) => void;

const NAME_TRANSLATIONS: Readonly<Record<string, string>> = {
  'South Korea': '대한민국',
  'S Korea': '대한민국',
  Asia: '아시아',
  International: '해외',
  'Gamaksan (Dawn Wall), Paju-si, Gyeonggi-do (Seolma 12 Bridge)': '감악산(새벽벽), 파주시, 경기도(설마12교)',
  'Gangwon-do (Northeast Korea)': '강원도(한국 북동부)',
  'Jeju Island': '제주도',
  'North/South Chungcheong-do (Midwest/West Korea)': '충청북도/충청남도(한국 중서부/서부)',
  'North/South Gyeongsang-do (East/Southeast Korea)': '경상북도/경상남도(한국 동부/남동부)',
  'North/South Jeolla-do (Southwest Korea)': '전라북도/전라남도(한국 남서부)',
  'Seoul/Gyeonggi-do (Northwest Korea)': '서울/경기도(한국 북서부)',
  'Insu-bong (Bukhansan)': '인수봉(북한산)',
  'Seoraksan National Park (Sokcho)': '설악산 국립공원(속초)',
  'Seoraksan NP (Sokcho)': '설악산 국립공원(속초)',
  'Ulsan-bawi': '울산바위',
  'Seonin-bong (Dobongsan)': '선인봉(도봉산)',
};

function translatedName(source: string): string | undefined {
  const korean = NAME_TRANSLATIONS[source];
  return korean ? `${korean} (${source})` : undefined;
}

export class ProperNameLocalizer {
  private readonly restores: Array<() => void> = [];
  private readonly changed = new WeakSet<Node>();
  private readonly ids = new WeakMap<Node, string>();
  private nextId = 1;

  constructor(private readonly onChange?: ChangeListener) {}

  apply(root: ParentNode = document): void {
    const candidates = new Set<HTMLElement>();
    root.querySelectorAll<HTMLElement>('h1, a[href*="/area/"]')
      .forEach((element) => candidates.add(element));

    for (const element of candidates) {
      for (const node of Array.from(element.childNodes)) {
        if (node.nodeType !== Node.TEXT_NODE || this.changed.has(node)) {
          continue;
        }
        const source = node.nodeValue?.replace(/\s+/g, ' ').trim() ?? '';
        const translated = translatedName(source);
        if (!translated) {
          continue;
        }

        const original = node.nodeValue ?? '';
        const leading = original.match(/^\s*/)?.[0] ?? '';
        const trailing = original.match(/\s*$/)?.[0] ?? '';
        node.nodeValue = `${leading}${translated}${trailing}`;
        this.changed.add(node);
        const id = this.idFor(node);
        this.onChange?.({
          id,
          category: 'name',
          source,
          translated,
          status: 'translated',
          machine: false,
        }, element);
        this.restores.push(() => {
          node.nodeValue = original;
          this.changed.delete(node);
        });
      }
    }
  }

  restore(): void {
    while (this.restores.length > 0) {
      this.restores.pop()?.();
    }
  }

  private idFor(node: Node): string {
    const existing = this.ids.get(node);
    if (existing) {
      return existing;
    }
    const id = `name-${this.nextId++}`;
    this.ids.set(node, id);
    return id;
  }
}
