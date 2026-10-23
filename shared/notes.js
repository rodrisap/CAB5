/* My notes — write things down in your own words while you study.
   Notes live in this browser (localStorage, shared by the guide, practice and case pages).
   Use "Download backup" on the My notes page to move them to another device. */
(function (root) {
  if (typeof document === 'undefined') return;
  var KEY = 'fsm.notes.v1';
  var page = { id: 'general', title: 'General' };
  var allLink = '#notes';
  var listeners = [];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  var ok = true;
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); ok = true; } catch (e) { ok = false; } listeners.forEach(function (f) { f(); }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  // light formatting: **bold**, line breaks, "- " bullets
  function fmt(t) {
    var lines = esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n'), out = '', inList = false;
    lines.forEach(function (l) {
      var m = /^\s*[-•*]\s+(.*)$/.exec(l);
      if (m) { if (!inList) { out += '<ul>'; inList = true; } out += '<li>' + m[1] + '</li>'; }
      else { if (inList) { out += '</ul>'; inList = false; } out += l ? '<div>' + l + '</div>' : '<div class="nt-gap"></div>'; }
    });
    return out + (inList ? '</ul>' : '');
  }
  function when(ts) { var d = new Date(ts); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }

  var N = root.FSMNotes = {
    all: load,
    forPage: function (id) { return load().filter(function (n) { return n.page === id; }); },
    add: function (o) { var a = load(); var n = { id: uid(), page: o.page || page.id, title: o.title || page.title, text: o.text || '', quote: o.quote || '', star: !!o.star, t: Date.now() }; a.push(n); save(a); return n; },
    update: function (id, ch) { var a = load(); a.forEach(function (n) { if (n.id === id) { Object.keys(ch).forEach(function (k) { n[k] = ch[k]; }); n.t = Date.now(); } }); save(a); },
    remove: function (id) { var a = load(), gone = null; a = a.filter(function (n) { if (n.id === id) { gone = n; return false; } return true; }); save(a); return gone; },
    restore: function (n) { var a = load(); a.push(n); save(a); },
    replaceAll: function (a) { save(a); },
    onChange: function (f) { listeners.push(f); },
    savedOk: function () { return ok; },
    fmt: fmt, when: when, esc: esc,
    setPage: function (id, title) { page = { id: id, title: title }; renderDrawer(); updateBadge(); },
    setAllLink: function (href) { allLink = href; },
    open: function (quote) { openDrawer(quote); },
    noteHTML: noteHTML, wireNotes: wireNotes
  };

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.nt-fab{position:fixed;right:18px;bottom:18px;z-index:92;border-radius:99px;min-height:48px;padding:10px 18px;box-shadow:0 4px 18px rgba(0,0,0,.18);font-weight:600;display:flex;gap:6px;align-items:center}' +
    '.nt-fab .nt-count{background:var(--accent-ink);color:var(--accent);border-radius:99px;padding:0 7px;font-size:.78rem;min-width:20px;text-align:center}' +
    '.nt-drawer{position:fixed;top:0;right:0;height:100%;width:min(420px,100vw);z-index:96;background:var(--surface);border-left:1px solid var(--line);box-shadow:-8px 0 30px rgba(0,0,0,.15);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .2s}' +
    '.nt-drawer.open{transform:none}' +
    '.nt-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line)}' +
    '.nt-head .nt-where{font-size:.8rem;color:var(--muted)}' +
    '.nt-form{padding:12px 14px;border-bottom:1px solid var(--line);display:grid;gap:8px}' +
    '.nt-form textarea{width:100%;box-sizing:border-box;min-height:110px;resize:vertical;font:inherit;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--text)}' +
    '.nt-form .nt-row{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.nt-hint{font-size:.78rem;color:var(--muted)}' +
    '.nt-list{flex:1;overflow:auto;padding:10px 14px 30px}' +
    '.nt-note{border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-bottom:10px;background:var(--bg)}' +
    '.nt-note.star{border-left:4px solid var(--warn)}' +
    '.nt-note .nt-q{border-left:3px solid var(--accent);padding:2px 8px;margin:0 0 6px;color:var(--muted);font-size:.9rem;font-style:italic}' +
    '.nt-note .nt-body{line-height:1.5}.nt-note ul{margin:2px 0;padding-left:20px}.nt-gap{height:.5em}' +
    '.nt-meta{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:6px;font-size:.78rem;color:var(--muted)}' +
    '.nt-meta button{min-height:30px;padding:3px 9px;font-size:.8rem}' +
    '.nt-quote-box{border-left:3px solid var(--accent);padding:4px 8px;font-size:.88rem;color:var(--muted);font-style:italic;display:flex;justify-content:space-between;gap:6px}' +
    '.nt-quote-box button{min-height:26px;padding:0 8px;font-size:.8rem;font-style:normal}' +
    '.nt-chip{position:absolute;z-index:97;border-radius:99px;min-height:34px;padding:5px 12px;font-size:.88rem;box-shadow:0 3px 12px rgba(0,0,0,.2)}' +
    '.nt-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:99;background:var(--text);color:var(--bg);padding:8px 14px;border-radius:99px;font-size:.9rem;display:flex;gap:10px;align-items:center}' +
    '.nt-toast button{min-height:28px;padding:2px 10px;background:transparent;color:inherit;border-color:currentColor}' +
    '.nt-star{background:transparent;border:0;color:var(--muted);font-size:1.1rem;padding:0 4px;min-height:0;cursor:pointer}.nt-star.on{color:var(--warn)}' +
    '@media(max-width:600px){.nt-drawer{top:auto;bottom:0;height:85%;width:100%;border-left:0;border-top:1px solid var(--line);border-radius:14px 14px 0 0;transform:translateY(105%)}.nt-fab{right:12px;bottom:12px}}' +
    '@media print{.nt-fab,.nt-drawer,.nt-chip{display:none!important}}';
  document.head.appendChild(css);

  /* ---------- one note card ---------- */
  function noteHTML(n, showPage) {
    return '<div class="nt-note' + (n.star ? ' star' : '') + '" data-nid="' + n.id + '">' +
      (n.quote ? '<div class="nt-q">“' + esc(n.quote) + '”</div>' : '') +
      '<div class="nt-body">' + fmt(n.text) + '</div>' +
      '<div class="nt-meta"><span><button type="button" class="nt-star' + (n.star ? ' on' : '') + '" title="Mark as important" aria-label="Mark as important">★</button>' + (showPage ? esc(n.title) + ' · ' : '') + when(n.t) + '</span>' +
      '<span><button type="button" class="ghost nt-edit">Edit</button> <button type="button" class="ghost nt-del">Delete</button></span></div></div>';
  }
  function toast(msg, undo) {
    var old = document.querySelector('.nt-toast'); if (old) old.remove();
    var t = document.createElement('div'); t.className = 'nt-toast'; t.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button">Undo</button>' : '');
    document.body.appendChild(t);
    if (undo) t.querySelector('button').onclick = function () { undo(); t.remove(); };
    setTimeout(function () { t.remove(); }, 5000);
  }
  function wireNotes(el) {
    el.querySelectorAll('.nt-note').forEach(function (card) {
      var id = card.getAttribute('data-nid');
      card.querySelector('.nt-star').onclick = function () { var n = load().filter(function (x) { return x.id === id; })[0]; if (n) N.update(id, { star: !n.star }); };
      card.querySelector('.nt-del').onclick = function () { var g = N.remove(id); if (g) toast('Note deleted', function () { N.restore(g); }); };
      card.querySelector('.nt-edit').onclick = function () {
        var n = load().filter(function (x) { return x.id === id; })[0]; if (!n) return;
        var body = card.querySelector('.nt-body');
        body.innerHTML = '<textarea class="nt-ed" style="width:100%;box-sizing:border-box;min-height:90px;font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text)"></textarea><div style="display:flex;gap:6px;margin-top:6px"><button type="button" class="nt-sv">Save</button><button type="button" class="ghost nt-cx">Cancel</button></div>';
        var ta = body.querySelector('textarea'); ta.value = n.text; ta.focus();
        body.querySelector('.nt-sv').onclick = function () { N.update(id, { text: ta.value.trim() }); };
        body.querySelector('.nt-cx').onclick = function () { listeners.forEach(function (f) { f(); }); };
        ta.onkeydown = function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); N.update(id, { text: ta.value.trim() }); } };
      };
    });
  }

  /* ---------- floating button + drawer ---------- */
  var fab, drawer, pendingQuote = '';
  function build() {
    fab = document.createElement('button'); fab.type = 'button'; fab.className = 'nt-fab'; fab.setAttribute('aria-label', 'Open my notes');
    fab.onclick = function () { drawer.classList.contains('open') ? closeDrawer() : openDrawer(); };
    document.body.appendChild(fab);
    drawer = document.createElement('aside'); drawer.className = 'nt-drawer'; drawer.setAttribute('aria-label', 'My notes');
    document.body.appendChild(drawer);
    renderDrawer(); updateBadge();
  }
  function updateBadge() { if (!fab) return; var c = N.forPage(page.id).length; fab.innerHTML = '✎ Notes' + (c ? ' <span class="nt-count">' + c + '</span>' : ''); }
  function renderDrawer() {
    if (!drawer) return;
    var list = N.forPage(page.id).sort(function (a, b) { return b.t - a.t; });
    var draft = drawer.querySelector('textarea') ? drawer.querySelector('textarea').value : '';
    var starWas = drawer.querySelector('#ntStar') ? drawer.querySelector('#ntStar').checked : false;
    drawer.innerHTML = '<div class="nt-head"><div><b>My notes</b><div class="nt-where">' + esc(page.title) + '</div></div><div style="display:flex;gap:6px"><a class="btn ghost" href="' + allLink + '" style="white-space:nowrap;min-height:36px;padding:6px 10px;font-size:.88rem">All notes</a><button type="button" class="ghost" id="ntClose" aria-label="Close notes" style="min-height:36px;padding:6px 12px">✕</button></div></div>' +
      '<div class="nt-form">' + (pendingQuote ? '<div class="nt-quote-box"><span>“' + esc(pendingQuote) + '”</span><button type="button" class="ghost" id="ntDropQ">remove</button></div>' : '') +
      '<textarea id="ntText" placeholder="Write it in your own words… (what it means, when to use it, the trap)"></textarea>' +
      '<div class="nt-row"><label class="check" style="font-size:.88rem"><input type="checkbox" id="ntStar"> ★ Important</label><button type="button" id="ntSave">Save note</button></div>' +
      '<div class="nt-hint">Ctrl/⌘ + Enter saves. Start a line with “- ” for a bullet, **bold** for bold. Tip: select text on the page to quote it.</div>' + (ok ? '' : '<div class="nt-hint" style="color:var(--bad)">This browser is blocking storage (private mode?), so notes can’t be saved here.</div>') + '</div>' +
      '<div class="nt-list">' + (list.length ? list.map(function (n) { return noteHTML(n, false); }).join('') : '<p class="muted small">No notes for this page yet. Writing a point down in your own words is one of the best ways to make it stick.</p>') + '</div>';
    var ta = drawer.querySelector('#ntText'); ta.value = draft; drawer.querySelector('#ntStar').checked = starWas;
    drawer.querySelector('#ntClose').onclick = closeDrawer;
    var dq = drawer.querySelector('#ntDropQ'); if (dq) dq.onclick = function () { pendingQuote = ''; renderDrawer(); };
    function doSave() {
      var t = ta.value.trim(); if (!t && !pendingQuote) { ta.focus(); return; }
      var star = drawer.querySelector('#ntStar').checked;
      ta.value = ''; drawer.querySelector('#ntStar').checked = false;
      var q = pendingQuote; pendingQuote = '';
      N.add({ text: t, quote: q, star: star });
      toast(ok ? 'Note saved' : 'Could not save — storage is blocked');
      setTimeout(function () { var x = drawer.querySelector('#ntText'); if (x) x.focus(); }, 0);
    }
    drawer.querySelector('#ntSave').onclick = doSave;
    ta.onkeydown = function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); doSave(); } };
    wireNotes(drawer);
  }
  function openDrawer(quote) {
    if (quote) pendingQuote = quote.slice(0, 600);
    renderDrawer(); drawer.classList.add('open');
    setTimeout(function () { var t = drawer.querySelector('#ntText'); if (t) t.focus(); }, 60);
  }
  function closeDrawer() { drawer.classList.remove('open'); }
  N.onChange(function () { renderDrawer(); updateBadge(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer(); });
  // other tabs (guide + practice open at once)
  window.addEventListener('storage', function (e) { if (e.key === KEY) listeners.forEach(function (f) { f(); }); });

  /* ---------- select text → "+ Note" ---------- */
  var chip;
  function hideChip() { if (chip) { chip.remove(); chip = null; } }
  function onSelect(ev) {
    if (ev && ev.target && ev.target.closest && (ev.target.closest('.nt-drawer') || ev.target.closest('.nt-fab') || ev.target.closest('.nt-chip'))) return;
    setTimeout(function () {
      var sel = window.getSelection(), txt = sel ? String(sel).replace(/\s+/g, ' ').trim() : '';
      if (!txt || txt.length < 3 || !sel.rangeCount) { hideChip(); return; }
      var node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode);
      if (!node || (node.closest && (node.closest('.nt-drawer') || node.closest('input,textarea')))) { hideChip(); return; }
      var r = sel.getRangeAt(0).getBoundingClientRect();
      hideChip();
      chip = document.createElement('button'); chip.type = 'button'; chip.className = 'nt-chip'; chip.textContent = '＋ Add to notes';
      chip.style.top = (window.scrollY + r.bottom + 8) + 'px';
      chip.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - 170)) + 'px';
      chip.onmousedown = function (e) { e.preventDefault(); };
      chip.onclick = function () { hideChip(); try { window.getSelection().removeAllRanges(); } catch (e) {} openDrawer(txt); };
      document.body.appendChild(chip);
    }, 10);
  }
  document.addEventListener('mouseup', onSelect);
  document.addEventListener('touchend', onSelect);
  document.addEventListener('scroll', function () { if (chip && !String(window.getSelection())) hideChip(); }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})(window);
