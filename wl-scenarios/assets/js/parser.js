// Wing Leader 시나리오 md 파서 (무의존, ESM). 브라우저·Node 공용.

const stripQuotes = (s) =>
  s.replace(/^\s*["']?/, '').replace(/["']?\s*$/, '');

const castScalar = (s) => {
  const t = s.trim();
  if (t === 'true') return true;
  if (t === 'false') return false;
  return stripQuotes(t);
};

// "a: 1 | b: 2, 3" -> {a:'1', b:'2, 3'} (파이프로만 분리, 첫 콜론만 키 구분)
export function parsePipeFields(str) {
  const out = {};
  for (const part of str.split('|')) {
    const seg = part.trim();
    if (!seg) continue;
    const i = seg.indexOf(':');
    if (i === -1) continue;
    const key = seg.slice(0, i).trim();
    out[key] = seg.slice(i + 1).trim();
  }
  return out;
}

export function parseFrontmatter(md) {
  const text = md.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text.trim() };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;      // 주석·빈줄 무시
    const i = t.indexOf(':');
    if (i === -1) continue;
    meta[t.slice(0, i).trim()] = castScalar(t.slice(i + 1));
  }
  const body = text.slice(m[0].length).trim();
  return { meta, body };
}

// "## 배경 ...\n## 전투 서열 ..." -> { '배경': '...', '전투 서열': '...' }
export function splitSections(body) {
  const out = {};
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  let cur = null, buf = [];
  const flush = () => { if (cur !== null) out[cur] = buf.join('\n').trim(); };
  for (const line of lines) {
    const h = line.match(/^##\s+(.+?)\s*$/);   // ## (### 는 제외)
    if (h && !line.startsWith('###')) {
      flush();
      cur = h[1].trim();
      buf = [];
    } else if (cur !== null) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

export function parseBackground(text) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return { place: '', paragraphs: [] };
  return { place: blocks[0], paragraphs: blocks.slice(1) };
}

function parseStats(valueStr) {
  const out = {};
  for (const part of valueStr.split('|')) {
    const seg = part.trim();
    const i = seg.indexOf('=');
    if (i === -1) continue;
    out[seg.slice(0, i).trim()] = seg.slice(i + 1).trim();
  }
  return out;
}

function parseSideHeader(line) {
  // "### 침공측 — 미국 | k:v | ..."  ('—' 또는 '-' 구분 허용)
  const body = line.replace(/^###\s+/, '');
  const parts = body.split('|');
  const head = parts[0].trim();                 // "침공측 — 미국"
  const hm = head.split(/\s[—–-]\s/);
  const role = (hm[0] || '').trim();
  const nation = (hm[1] || '').trim();
  const f = parsePipeFields(parts.slice(1).join('|'));
  return {
    role, nation,
    code: f.code || '',
    marks: f.marks ? f.marks.split(',').map((s) => s.trim()).filter(Boolean) : [],
    first: f.first === 'true',
    note: f.note || '',
    color: f.color || '',
    group_odd: f.group_odd || '',
    group_even: f.group_even || '',
    blocks: [],
    stats: {},
  };
}

export function parseOOB(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const sides = [];
  let side = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('###')) {
      side = parseSideHeader(line);
      sides.push(side);
      continue;
    }
    if (!side) continue;
    if (!line.startsWith('-')) continue;
    const item = line.replace(/^-\s*/, '');
    if (item.startsWith('box:')) {                    // 투입 박스(초기배치/증원 웨이브) — 각자 자체 stats
      side.boxed = true;
      const parts = item.split('|');
      const bf = parsePipeFields(parts.slice(1).join('|'));
      side.blocks.push({ name: parts[0].slice(4).trim(), note: bf.note || null, units: [], stats: {}, color: bf.color || '' });
      continue;
    }
    if (item.startsWith('losses:')) { side.stats = parseStats(item.slice(7)); continue; }  // 진영 하단 공용
    if (item.startsWith('stats:')) {
      const st = parseStats(item.slice(6));
      const last = side.blocks[side.blocks.length - 1];
      if (side.boxed && last) last.stats = st;         // 박스별 stats
      else side.stats = st;                            // 진영 단위(기본)
      continue;
    }
    const f = parsePipeFields(item);
    if (f.unit === undefined) continue;
    const unit = {
      unit: f.unit || '', qty: f.qty || '', mission: f.mission || '',
      setup: f.setup || '', adc: f.adc || '', counter: f.counter || '',
      underline: f.underline === 'true',
    };
    const last = side.blocks[side.blocks.length - 1];
    if (side.boxed) {                                  // 박스 모드: 현재 박스에 추가
      if (last) last.units.push(unit);
      else side.blocks.push({ name: null, note: null, units: [unit], stats: {} });
      continue;
    }
    const gname = f.group || null;
    if (gname && last && last.name === gname) {
      last.units.push(unit);
    } else if (gname) {
      side.blocks.push({ name: gname, note: f.group_note || null, units: [unit], stats: {}, color: f.group_color || '' });
    } else if (last && last.name === null) {
      last.units.push(unit);
    } else {
      side.blocks.push({ name: null, note: null, units: [unit], stats: {} });
    }
  }
  return { sides };
}

export function parseFieldInfo(text) {
  const out = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('-')) continue;
    const item = line.replace(/^-\s*/, '');
    const i = item.indexOf(':');
    if (i === -1) continue;
    out.push({ key: item.slice(0, i).trim(), value: item.slice(i + 1).trim() });
  }
  return out;
}

function introAndList(text, listRe) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const intro = [];
  const items = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(listRe);
    if (m) items.push(m[1].trim());
    else if (line && items.length === 0) intro.push(line);
  }
  return { intro: intro.join(' ').trim(), items };
}

export function parseSpecialRules(text) {
  return introAndList(text, /^\d+\.\s+(.*)$/);
}

export function parseVictory(text) {
  const { intro, items } = introAndList(text, /^-\s+(.*)$/);
  const parsed = items.map((it) => {
    const i = it.indexOf(':');
    return i === -1
      ? { cond: '', result: it }
      : { cond: it.slice(0, i).trim(), result: it.slice(i + 1).trim() };
  });
  return { intro, items: parsed };
}

const KNOWN_SECTIONS = new Set(['배경', '전투 서열', '전장 정보', '특별 규칙', '승리 조건', '후일담', '플레이 조언']);

export function parseScenario(md) {
  const { meta, body } = parseFrontmatter(md);
  const sec = splitSections(body);
  // 알려진 섹션 외(예: 역사적 시나리오, 가상 시나리오)는 순서대로 extra_sections 로
  const extra_sections = Object.keys(sec)
    .filter((k) => !KNOWN_SECTIONS.has(k))
    .map((k) => ({ title: k, text: sec[k] }));
  return {
    meta,
    background: parseBackground(sec['배경'] || ''),
    oob: parseOOB(sec['전투 서열'] || ''),
    field_info: parseFieldInfo(sec['전장 정보'] || ''),
    special_rules: parseSpecialRules(sec['특별 규칙'] || ''),
    victory: parseVictory(sec['승리 조건'] || ''),
    aftermath: (sec['후일담'] || '').trim(),
    play_tip: (sec['플레이 조언'] || '').trim(),
    extra_sections,
  };
}
