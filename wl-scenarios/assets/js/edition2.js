const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

(async function main() {
  let md = '';
  try { md = await fetch('md/notes-edition2.md').then((r) => r.text()); } catch { /* ignore */ }
  const doc = document.getElementById('doc');
  doc.innerHTML = '';
  if (!md) { doc.innerHTML = '<p class="emptymsg">문서를 불러올 수 없습니다.</p>'; return; }

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let ul = null;
  const flush = () => { if (ul) { doc.appendChild(ul); ul = null; } };
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { flush(); continue; }
    let m;
    if ((m = t.match(/^# (.+)/))) { flush(); doc.appendChild(el('div', 'gate-title', esc(m[1]))); }
    else if ((m = t.match(/^## (.+)/))) { flush(); doc.appendChild(el('div', 'sec-h', esc(m[1]))); }
    else if ((m = t.match(/^!\[[^\]]*\]\(([^)]+)\)/))) {
      flush();
      const img = el('img');
      img.src = m[1]; img.alt = ''; img.style.marginTop = '10px'; img.style.borderRadius = '3px';
      doc.appendChild(img);
    } else if ((m = t.match(/^- (.+)/))) {
      if (!ul) ul = el('ul', 'plain-list');
      ul.appendChild(el('li', null, esc(m[1])));
    } else { flush(); doc.appendChild(el('p', null, esc(t))); }
  }
  flush();
})();
