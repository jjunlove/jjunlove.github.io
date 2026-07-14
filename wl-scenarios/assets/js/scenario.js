import { parseScenario } from './parser.js';
import { assetSlug } from './asset-key.js';

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 추가 섹션(역사적/가상 시나리오 등) 본문 렌더: 빈 줄로 블록 분리.
// 블록 전체가 '- ' → 목록, '>' → 들여쓴 예시, 그 외 → 문단.
function renderProse(text) {
  const wrap = el('div', 'prose');
  const blocks = String(text).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  for (const blk of blocks) {
    const lines = blk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length && lines.every((l) => l.startsWith('- '))) {
      const ul = el('ul', 'plain-list');
      lines.forEach((l) => ul.appendChild(el('li', null, esc(l.slice(2)))));
      wrap.appendChild(ul);
    } else if (lines.length && lines.every((l) => l.startsWith('>'))) {
      wrap.appendChild(el('div', 'example', esc(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))));
    } else {
      wrap.appendChild(el('p', null, esc(lines.join(' '))));
    }
  }
  return wrap;
}

const params = new URLSearchParams(location.search);
const id = params.get('id') || 'S01';

// 후보 경로를 순서대로 시도해 처음 로드되는 것으로 콜백 (다 없으면 폴백 유지)
function resolveImage(candidates, onOk) {
  (function next(i) {
    if (i >= candidates.length) return;
    const img = new Image();
    img.onload = () => onOk(candidates[i]);
    img.onerror = () => next(i + 1);
    img.src = candidates[i];
  })(0);
}

function counterEl(u) {
  const c = el('div', 'counter');
  const base = u.counter || u.unit;
  c.innerHTML = `<div class="ty">${esc(u.unit)}</div>`;
  // 파일명 = 기체명 그대로(공백 포함, 예 "Kittyhawk Mk.IV.jpg") 우선,
  // 슬래시 등 파일명 불가 문자는 slug("Bf-110G-2-R3") 폴백. png/jpg 모두.
  const keys = [...new Set([base, assetSlug(base)])].map(encodeURIComponent).filter(Boolean);
  const cands = keys.flatMap((k) => [`img/counters/${k}.png`, `img/counters/${k}.jpg`]);
  if (cands.length) resolveImage(cands, (src) => {
    c.innerHTML = `<img alt="${esc(u.unit)}" src="${src}">`;
  });
  return c;
}

function markEl(key) {
  const m = el('div', 'mark', esc(String(key).toUpperCase()));
  const k = encodeURIComponent(key);
  // md 의 마크키 = 파일명. 예 marks: de1 → de1.png. de2 로 바꾸면 de2.png 로드.
  resolveImage([`img/marks/${k}.png`, `img/marks/${k}.jpg`], (src) => {
    m.textContent = '';
    m.style.background = `url(${src}) center/contain no-repeat`;
    m.style.border = 'none';
    m.style.boxShadow = 'none';
  });
  return m;
}

function sideEl(side) {
  const box = el('div', 'side');
  box.style.background = side.color || `var(--nat-${side.code || 'us'})`;
  if (side.marks && side.marks.length) {
    const mk = el('div', 'marks');
    side.marks.forEach((k) => mk.appendChild(markEl(k)));
    box.appendChild(mk);
  }
  box.appendChild(el('div', 'sh', `${esc(side.role)} — ${esc(side.nation)}${side.first ? ' <span class="first-tag">(먼저 배치)</span>' : ''}`));
  if (side.note) box.appendChild(el('div', 'ssub', esc(side.note)));
  let namedIdx = 0;
  side.blocks.forEach((blk) => {
    const named = !!blk.name;
    const b = el('div', named ? 'block' : 'block plain');
    if (named) {
      const shade = namedIdx % 2 === 0 ? side.group_odd : side.group_even;
      namedIdx += 1;
      b.style.background = blk.color || shade || 'rgba(255,255,255,.5)';   // 블록별 색 우선
      b.appendChild(el('div', 'bname', `${esc(blk.name)}${blk.note ? ` <i>(${esc(blk.note)})</i>` : ''}`));
    }
    blk.units.forEach((u) => {
      const row = el('div', 'unit');
      if (u.qty) row.appendChild(el('div', 'qty', `×${esc(u.qty)}`));
      row.appendChild(counterEl(u));
      const nameHtml = u.underline ? `<b class="ul">${esc(u.unit)}</b>` : `<b>${esc(u.unit)}</b>`;
      row.appendChild(el('div', 'info', `${nameHtml}${u.mission ? ` — ${esc(u.mission)}` : ''}${u.setup ? `<br>${esc(u.setup)}` : ''}`));
      b.appendChild(row);
    });
    const bk = Object.keys(blk.stats || {});
    if (bk.length) {
      const st = el('div', 'stats');
      bk.forEach((k) => st.appendChild(el('div', 'stat-row', `<span class="sk">${esc(k)}</span><span>${esc(blk.stats[k])}</span>`)));
      b.appendChild(st);
    }
    box.appendChild(b);
  });
  const statKeys = Object.keys(side.stats);
  if (statKeys.length) {
    const st = el('div', 'stats');
    statKeys.forEach((k) => st.appendChild(el('div', 'stat-row', `<span class="sk">${esc(k)}</span><span>${esc(side.stats[k])}</span>`)));
    box.appendChild(st);
  }
  return box;
}

function render(s) {
  const root = el('div', 'sheet');
  const hd = el('div', 'hd');
  if (s.meta.header_bg) hd.style.background = s.meta.header_bg;
  hd.innerHTML = `<span class="sid">Scenario ${esc(s.meta.id)}</span>
    <span class="title">${esc(s.meta.title_en)}<small>${esc(s.meta.title_ko)}</small></span>
    <span class="logo">WL</span>`;
  root.appendChild(hd);
  const logoSpan = hd.querySelector('.logo');
  resolveImage(['img/logo.png', 'img/logo.jpg'], (src) => { logoSpan.innerHTML = `<img src="${src}" alt="Wing Leader">`; });
  const bd = el('div', 'bd');

  const credit = [s.meta.version, s.meta.designer ? `제작: ${s.meta.designer}` : ''].filter(Boolean).join(' · ');

  // 배경 (버전·제작 크레딧은 사진 하단에만 표시)
  bd.appendChild(el('div', 'sec-h', '배경'));
  const bg = el('div', 'bg');
  const txt = el('div', 'txt');
  if (s.background.place) txt.appendChild(el('div', 'place', esc(s.background.place)));
  s.background.paragraphs.forEach((p) => txt.appendChild(el('p', null, esc(p))));
  bg.appendChild(txt);
  const photo = el('div', 'photo');
  photo.innerHTML = `<div class="ph">사진 (원서 이미지)</div>${credit ? `<div class="cred">${esc(credit)}</div>` : ''}`;
  const pid = encodeURIComponent(s.meta.id);
  resolveImage([`img/photos/${pid}.jpg`, `img/photos/${pid}.png`], (src) => {
    photo.innerHTML = `<img alt="${esc(s.meta.id)}" src="${src}">${credit ? `<div class="cred">${esc(credit)}</div>` : ''}`;
  });
  bg.appendChild(photo);
  bd.appendChild(bg);

  // 전투 서열
  bd.appendChild(el('div', 'sec-h', '전투 서열'));
  const oob = el('div', 'oob');
  s.oob.sides.forEach((sd) => oob.appendChild(sideEl(sd)));
  bd.appendChild(oob);

  // 하단 2단
  const cols = el('div', 'cols');
  const left = el('div');
  if (s.field_info.length) {
    left.appendChild(el('div', 'sec-h', '전장 정보'));
    s.field_info.forEach((f) => {
      let val = esc(f.value);
      // 무선망은 ' / ' 또는 ' · ' 로 나뉜 항목을 줄바꿈(원서 레이아웃). "III./JG 2" 같은 붙은 슬래시는 보존.
      if (/무선|무전|표적/.test(f.key)) val = val.replace(/\s+[/·]\s+/g, '<br>');
      left.appendChild(el('div', 'meta-row', `<span class="k">${esc(f.key)}</span><span>${val}</span>`));
    });
  }
  if (s.special_rules.items.length || s.special_rules.intro) {
    left.appendChild(el('div', 'sec-h', '특별 규칙'));
    if (s.special_rules.intro) left.appendChild(el('p', 'sec-intro', esc(s.special_rules.intro)));
    if (s.special_rules.items.length) {
      const ol = el('ol', 'rules');
      s.special_rules.items.forEach((r) => ol.appendChild(el('li', null, esc(r))));
      left.appendChild(ol);
    }
  }
  (s.extra_sections || []).forEach((sec) => {
    left.appendChild(el('div', 'sec-h', esc(sec.title)));
    left.appendChild(renderProse(sec.text));
  });
  const right = el('div');
  if (s.victory.items.length || s.victory.intro) {
    right.appendChild(el('div', 'sec-h', '승리 조건'));
    const vp = el('div', 'vp');
    if (s.victory.intro) vp.appendChild(el('p', 'sec-intro', esc(s.victory.intro)));
    const tbl = el('table');
    s.victory.items.forEach((v) => tbl.appendChild(el('tr', null, `<td>${esc(v.cond)}</td><td>${esc(v.result)}</td>`)));
    vp.appendChild(tbl);
    right.appendChild(vp);
  }
  if (s.aftermath) {
    right.appendChild(el('div', 'sec-h', '후일담'));
    right.appendChild(el('div', 'aftermath', esc(s.aftermath).replace(/\n\n/g, '<br><br>')));
  }
  if (s.play_tip) {
    right.appendChild(el('div', 'sec-h', '플레이 조언'));
    right.appendChild(el('div', 'aftermath', esc(s.play_tip)));
  }
  cols.append(left, right);
  bd.appendChild(cols);
  root.appendChild(bd);
  return root;
}

async function navLinks() {
  let list = [];
  try { list = await fetch('data/index.json').then((r) => r.json()); } catch { /* ignore */ }
  const ids = list.map((x) => x.id).sort();   // 시나리오 번호순 이전/다음
  const i = ids.indexOf(id);
  const prev = i > 0 ? ids[i - 1] : null;
  const next = i >= 0 && i < ids.length - 1 ? ids[i + 1] : null;
  const html = `<a class="${prev ? '' : 'disabled'}" href="${prev ? `scenario.html?id=${prev}` : '#'}">← 이전</a>
    <a href="index.html">목차</a>
    <a class="${next ? '' : 'disabled'}" href="${next ? `scenario.html?id=${next}` : '#'}">다음 →</a>`;
  $('#nav-top').innerHTML = html;
  $('#nav-bottom').innerHTML = html;
}

(async function main() {
  await navLinks();
  try {
    const md = await fetch(`md/${id}.md`).then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.text(); });
    const s = parseScenario(md);
    document.title = `${s.meta.id} ${s.meta.title_ko} — Wing Leader`;
    const app = $('#app');
    app.innerHTML = '';
    app.appendChild(render(s));
  } catch (e) {
    $('#app').innerHTML = `<p class="emptymsg">시나리오 ${esc(id)} 를 불러올 수 없습니다. (${esc(e.message)})</p>`;
  }
})();
