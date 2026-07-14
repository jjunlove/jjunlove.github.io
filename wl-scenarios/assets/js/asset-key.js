// 에셋 파일명 키 정규화 (브라우저·Node 공용).
// 기체명 → 파일시스템/URL 안전한 슬러그. 예: "Bf 110G-2/R3" → "Bf-110G-2-R3".
// 마크/사진 키(us, jp, S01 등)는 이미 안전하므로 그대로 통과.
export function assetSlug(s) {
  return String(s ?? '').trim()
    .replace(/×/g, 'x')          // 곱셈기호 → x
    .replace(/[/\\]/g, '-')      // 슬래시 → 하이픈
    .replace(/[^\w.\- ]/g, '')   // 그 외 구두점(쉼표·괄호 등) 제거
    .replace(/\s+/g, '-')        // 공백 → 하이픈
    .replace(/-+/g, '-');        // 중복 하이픈 축약
}
