const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

(async function main() {
  let rows = [];
  try { rows = await fetch('data/scenarios-all.json').then((r) => r.json()); } catch { /* ignore */ }
  // 시나리오 코드 오름차순
  rows.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
  const tbl = document.getElementById('tbl');
  const count = document.getElementById('count');
  const q = document.getElementById('q');
  const pubSel = document.getElementById('pub');
  const doneBar = document.getElementById('done');
  const state = { q: '', pub: '', done: '' };

  const KEY = { Origins: 'Origins 1936–1942', Blitz: 'Blitz 1939–1942', Victories: 'Victories 1940–1942', V2e: 'Victories 제2판', Legends: 'Legends 1937–1945', Supremacy: 'Supremacy 1943–1945', S2e: 'Supremacy 제2판', Eagles: 'Eagles 1943–1945', DD: '디지털 다운로드', SS: '시나리오 보충판', C3i: 'C3i 매거진' };
  const present = new Set(rows.flatMap((r) => r.products || []));
  const cats = Object.keys(KEY).filter((k) => present.has(k));
  pubSel.innerHTML = '<option value="">출처 전체</option>' + cats.map((p) => `<option value="${esc(p)}">${esc(p)} — ${esc(KEY[p])}</option>`).join('');
  pubSel.onchange = () => { state.pub = pubSel.value; render(); };

  [['', '전체'], ['y', '완료'], ['n', '미완료']].forEach(([val, label]) => {
    const b = el('button', 'seg' + (state.done === val ? ' on' : ''));
    b.textContent = label;
    b.onclick = () => { state.done = val; doneBar.querySelectorAll('.seg').forEach((x) => x.classList.toggle('on', x === b)); render(); };
    doneBar.appendChild(b);
  });
  q.oninput = () => { state.q = q.value.trim(); render(); };

  function match(r) {
    if (state.pub && !(r.products || []).includes(state.pub)) return false;
    if (state.done === 'y' && !r.done) return false;
    if (state.done === 'n' && r.done) return false;
    if (state.q) {
      const h = `${r.code} ${r.name} ${r.title_ko || ''} ${r.forces} ${r.location} ${r.creator}`.toLowerCase();
      if (!h.includes(state.q.toLowerCase())) return false;
    }
    return true;
  }

  function render() {
    const f = rows.filter(match);
    tbl.innerHTML = '<thead><tr><th></th><th>코드</th><th>시나리오</th><th>진영</th><th>지명</th><th>날짜</th><th>출처</th></tr></thead><tbody>'
      + f.map((r) => {
        const name = r.done
          ? `<a href="scenario.html?id=${encodeURIComponent(r.code)}">${esc(r.name)}</a>${r.title_ko ? `<div class="ko-sub">${esc(r.title_ko)}</div>` : ''}`
          : esc(r.name);
        return `<tr class="${r.done ? 'row-done' : ''}"><td class="chk">${r.done ? '✓' : ''}</td><td>${esc(r.code)}</td><td>${name}</td><td>${esc(r.forces)}</td><td>${esc(r.location)}</td><td>${esc(r.date)}</td><td>${r.published ? `<span class="src-badge">${esc(r.published)}</span>` : ''}</td></tr>`;
      }).join('')
      + '</tbody>';
    count.textContent = `${f.length} / ${rows.length}편 · 작업완료 ${rows.filter((r) => r.done).length}편`;
  }

  render();
})();
