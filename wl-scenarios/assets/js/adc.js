const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

(async function main() {
  let rows = [];
  try { rows = await fetch('data/adc.json').then((r) => r.json()); } catch { /* ignore */ }
  const tbl = document.getElementById('adc-table');
  const search = document.getElementById('adc-search');
  const count = document.getElementById('adc-count');
  const srcBar = document.getElementById('adc-src');

  const products = [...new Set(rows.map((r) => r.product).filter(Boolean))];
  const state = { q: '', src: '' };   // src '' = 전체

  function render() {
    const q = state.q.toLowerCase();
    const f = rows.filter((r) => (!state.src || r.product === state.src) && (!q || `${r.aircraft} ${r.adc}`.toLowerCase().includes(q)));
    tbl.innerHTML = '<thead><tr><th>기종</th><th>ADC</th><th>출처</th></tr></thead><tbody>'
      + f.map((r) => `<tr><td>${esc(r.aircraft)}</td><td>${esc(r.adc)}${r.derivative ? ' <span class="deriv">파생형</span>' : ''}</td><td><span class="src-badge">${esc(r.product)}</span></td></tr>`).join('')
      + '</tbody>';
    count.textContent = `${f.length} / ${rows.length}종`;
  }

  // 출처 세그먼트 (전체 / Supremacy / Victories)
  [['', '전체'], ...products.map((p) => [p, p])].forEach(([val, label]) => {
    const b = document.createElement('button');
    b.className = 'seg' + (state.src === val ? ' on' : '');
    b.textContent = label;
    b.onclick = () => { state.src = val; srcBar.querySelectorAll('.seg').forEach((x) => x.classList.toggle('on', x === b)); render(); };
    srcBar.appendChild(b);
  });

  search.oninput = () => { state.q = search.value.trim(); render(); };
  render();
})();
