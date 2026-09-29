const MAP_SUN_CONTROL_TRANSLATIONS: Readonly<Record<string, string>> = {
  'Sun Angles': '태양 각도',
  'Sunrise:': '일출:',
  'Sunset:': '일몰:',
  '· Sunset:': '· 일몰:',
  'Time Zone': '시간대',
  Jan: '1월',
  Feb: '2월',
  Mar: '3월',
  Apr: '4월',
  May: '5월',
  Jun: '6월',
  Jul: '7월',
  Aug: '8월',
  Sep: '9월',
  Oct: '10월',
  Nov: '11월',
  Dec: '12월',
  'Show Sun Angles': '태양 각도 표시',
  'Hide Sun Angles': '태양 각도 숨기기',
  'Toggle Sun Angles': '태양 각도 표시 전환',
};

export function translateMapSunControlText(value: string): string | undefined {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const exact = MAP_SUN_CONTROL_TRANSLATIONS[normalized];
  if (exact) {
    return exact;
  }
  const date = normalized.match(/^on (.+)$/);
  return date ? `날짜: ${date[1]}` : undefined;
}
