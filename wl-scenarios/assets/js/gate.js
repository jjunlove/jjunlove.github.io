const $ = (s, root = document) => root.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const THEATER_LABEL = { pacific: '태평양', 'euro-west': '유럽 서부', 'euro-east': '유럽 동부', med: '지중해' };
const NAT_LABEL = { us: '미국', jp: '일본', al: '연합군', de: '독일', gb: '영국', ca: '캐나다', su: '소련', ro: '루마니아', it: '이탈리아', ax: '추축군', fi: '핀란드', cn: '중국' };
const NAT_COLOR = { us: '#1a3a8f', jp: '#c62828', al: '#37474f', de: '#37474f', gb: '#0d47a1', ca: '#c62828', su: '#b71c1c', ro: '#1b5e20', it: '#2e7d32', ax: '#5d4037', fi: '#0d47a1', cn: '#1b5e20' };

const state = { theater: new Set(), product: new Set(), nation: new Set(), year: new Set(), q: '', sort: 'id' };
const CMP = {
  date: (a, b) => ((a.date || '9') < (b.date || '9') ? -1 : (a.date || '9') > (b.date || '9') ? 1 : a.id < b.id ? -1 : 1),
  id: (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
};
let DATA = [];

function forcesHtml(sides) {
  return sides.map((s) => {
    const key = (s.marks && s.marks[0]) || s.code;
    return `<span class="dot" style="background:${NAT_COLOR[key] || '#999'}"></span>${esc(NAT_LABEL[s.code] || s.code)}`;
  }).join(' <span style="color:#aaa">vs</span> ');
}

function card(s) {
  const a = document.createElement('a');
  a.className = `scard ${s.theater}`;
  a.href = `scenario.html?id=${encodeURIComponent(s.id)}`;
  a.innerHTML = `<div class="sid">${esc(s.id)}</div>
    <div class="en">${esc(s.title_en)}</div>
    <div class="ko">${esc(s.title_ko)}</div>
    <div class="tags">${s.location ? `<span class="tag">${esc(s.location)}</span>` : ''}${s.date_display ? `<span class="tag">${esc(s.date_display)}</span>` : ''}${s.product ? `<span class="tag">${esc(s.product)}</span>` : ''}</div>
    <div class="forces">${forcesHtml(s.sides || [])}</div>`;
  if (s.translated === false) { a.style.opacity = '.5'; a.removeAttribute('href'); }
  return a;
}

const years = (list) => [...new Set(list.map((s) => (s.date || '').slice(0, 4)).filter(Boolean))].sort();

function matches(s) {
  if (state.theater.size && !state.theater.has(s.theater)) return false;
  if (state.product.size && !state.product.has(s.product)) return false;
  if (state.nation.size && !(s.sides || []).some((x) => state.nation.has(x.code))) return false;
  if (state.year.size && !state.year.has((s.date || '').slice(0, 4))) return false;
  if (state.q) {
    const hay = `${s.id} ${s.title_en} ${s.title_ko} ${s.location} ${s.forces_en} ${(s.sides || []).map((x) => x.code).join(' ')} ${(s.units || []).join(' ')}`.toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  return true;
}

function renderGrid() {
  const grid = $('#grid');
  grid.innerHTML = '';
  const shown = DATA.filter(matches).sort(CMP[state.sort] || CMP.id);
  shown.forEach((s) => grid.appendChild(card(s)));
  $('#empty').classList.toggle('hidden', shown.length > 0);
  $('#count').textContent = `${shown.length} / ${DATA.length}편`;
}

// 정렬 세그먼트 토글
function segmented() {
  const seg = document.createElement('div');
  seg.className = 'segmented';
  [['id', '번호순'], ['date', '연대순']].forEach(([val, label]) => {
    const b = document.createElement('button');
    b.className = 'seg' + (state.sort === val ? ' on' : '');
    b.textContent = label;
    b.onclick = () => {
      state.sort = val;
      seg.querySelectorAll('.seg').forEach((x) => x.classList.toggle('on', x === b));
      renderGrid();
    };
    seg.appendChild(b);
  });
  return seg;
}

// 필터 드롭다운 (체크박스 다중선택)
let openPanel = null;
function closePanels() { if (openPanel) { openPanel.classList.remove('open'); openPanel = null; } }
document.addEventListener('click', closePanels);

function dropdown(label, entries, set) {
  const wrap = document.createElement('div');
  wrap.className = 'dropdown';
  const btn = document.createElement('button');
  btn.className = 'dd-btn';
  const panel = document.createElement('div');
  panel.className = 'dd-panel';
  const refresh = () => {
    btn.innerHTML = `${esc(label)}${set.size ? ` <b>${set.size}</b>` : ''} <span class="caret">▾</span>`;
    btn.classList.toggle('active', set.size > 0);
  };
  if (entries.length) {
    const clr = document.createElement('button');
    clr.className = 'dd-clear';
    clr.textContent = '초기화';
    clr.onclick = (e) => { e.stopPropagation(); set.clear(); panel.querySelectorAll('input').forEach((i) => { i.checked = false; }); refresh(); renderGrid(); };
    panel.appendChild(clr);   // 항목 위(맨 상단)
  }
  entries.forEach(([key, text]) => {
    const row = document.createElement('label');
    row.className = 'dd-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = set.has(key);
    cb.onchange = () => { cb.checked ? set.add(key) : set.delete(key); refresh(); renderGrid(); };
    row.append(cb, document.createTextNode(' ' + text));
    panel.appendChild(row);
  });
  btn.onclick = (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    closePanels();
    if (!isOpen) { panel.classList.add('open'); openPanel = panel; }
  };
  panel.onclick = (e) => e.stopPropagation();
  refresh();
  wrap.append(btn, panel);
  return wrap;
}

function buildFilterbar() {
  const bar = $('#filterbar');
  bar.innerHTML = '';

  const top = document.createElement('div');
  top.className = 'fbar-top';
  const search = document.createElement('input');
  search.className = 'search';
  search.type = 'search';
  search.placeholder = '🔎 시나리오·지명·기체 검색…';
  search.oninput = () => { state.q = search.value.trim(); renderGrid(); };
  top.append(search, segmented());
  bar.appendChild(top);

  const filters = document.createElement('div');
  filters.className = 'fbar-filters';
  const products = [...new Set(DATA.map((s) => s.product).filter(Boolean))].sort();
  const nations = [...new Set(DATA.flatMap((s) => (s.sides || []).map((x) => x.code)))].filter(Boolean).sort();
  filters.appendChild(dropdown('전구', Object.entries(THEATER_LABEL).filter(([k]) => DATA.some((s) => s.theater === k)), state.theater));
  filters.appendChild(dropdown('출처', products.map((p) => [p, p]), state.product));
  filters.appendChild(dropdown('진영', nations.map((k) => [k, NAT_LABEL[k] || k]), state.nation));
  filters.appendChild(dropdown('연도', years(DATA).map((y) => [y, y]), state.year));
  bar.appendChild(filters);
}

(async function main() {
  try {
    DATA = await fetch('data/index.json').then((r) => r.json());
  } catch {
    $('#grid').innerHTML = '<p class="emptymsg">목록을 불러올 수 없습니다.</p>';
    return;
  }
  buildFilterbar();
  renderGrid();
})();
