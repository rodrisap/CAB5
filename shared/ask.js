/* "Ask Claude" — explain any part of a solution.
   Builds a prompt with the question, your answer and the model answer, and opens it in Claude
   (claude.ai, in your own account). If the context is too long for a link, it is copied to the clipboard instead. */
(function (root) {
  if (typeof document === 'undefined' || !document.createElement || !document.head) return;
  var MAX = 3600; // characters that safely fit in a link
  var CHIPS = ['Where does each number come from?', 'Why is this the right formula here?', 'Explain it more simply, step by step', 'What is the most common mistake here?', 'Give me a similar example to practise'];
  function clean(t) { return String(t || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim(); }
  function build(ctx, q) {
    var head = 'I am studying for my exam in Financial & Supply Chain Management (FSM, Hanze University, International Business). Please explain like a tutor: simple words, step by step, show every calculation and say where each number comes from. Use the same method as the model answer below (it is the course method), do not switch to a different textbook method.';
    var parts = [head, '', 'QUESTION:', clean(ctx.question)];
    if (ctx.mine) parts.push('', 'MY ANSWER:', clean(ctx.mine));
    if (ctx.model) parts.push('', 'MODEL ANSWER:', clean(ctx.model));
    parts.push('', 'MY QUESTION:', clean(q) || 'Explain this solution step by step.');
    return parts.join('\n');
  }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'ask-toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 6000);
  }
  function send(ctx, q) {
    var full = build(ctx, q), url;
    if (full.length <= MAX) { url = 'https://claude.ai/new?q=' + encodeURIComponent(full); window.open(url, '_blank', 'noopener'); return; }
    // too long for a link: shorten the model answer for the link, and copy the full version
    var short = build({ question: ctx.question.slice(0, 1200), mine: (ctx.mine || '').slice(0, 300), model: (ctx.model || '').slice(0, 1500) + ' …' }, q);
    var done = function () { toast('The full question + solution is copied. In Claude, select all and paste (Ctrl/⌘ + V) to give it everything.'); };
    try { navigator.clipboard.writeText(full).then(done, function () {}); } catch (e) {}
    window.open('https://claude.ai/new?q=' + encodeURIComponent(short.slice(0, MAX)), '_blank', 'noopener');
  }
  // Renders an "Ask Claude" box. getCtx() returns {question, mine, model} as plain text.
  function box(getCtx) {
    var el = document.createElement('div'); el.className = 'askbox';
    el.innerHTML = '<button type="button" class="ghost ask-open">💬 Ask Claude about this solution</button><div class="ask-panel" hidden><div class="ask-chips">' + CHIPS.map(function (c) { return '<button type="button" class="ghost ask-chip">' + c + '</button>'; }).join('') + '</div><textarea class="ask-q" placeholder="What don\'t you understand? e.g. why do we divide the preferred dividend by (1 − T)?"></textarea><div class="ask-row"><span class="small muted">Opens Claude in a new tab with this question and solution already filled in.</span><button type="button" class="ask-send">Ask Claude →</button></div></div>';
    var panel = el.querySelector('.ask-panel'), ta = el.querySelector('.ask-q');
    el.querySelector('.ask-open').onclick = function () { panel.hidden = !panel.hidden; if (!panel.hidden) ta.focus(); };
    el.querySelectorAll('.ask-chip').forEach(function (b) { b.onclick = function () { ta.value = b.textContent; ta.focus(); }; });
    el.querySelector('.ask-send').onclick = function () { send(getCtx(), ta.value); };
    ta.onkeydown = function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(getCtx(), ta.value); } };
    return el;
  }
  root.FSMAsk = { box: box, build: build, send: send };

  var css = document.createElement('style');
  css.textContent = '.askbox{margin:8px 0 4px}.ask-open{min-height:36px;padding:6px 12px;font-size:.9rem}.ask-panel{margin-top:8px;padding:10px 12px;border:1px solid var(--accent);border-radius:10px;background:var(--surface)}.ask-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.ask-chip{min-height:30px;padding:3px 10px;font-size:.82rem;border-radius:99px}.ask-q{width:100%;box-sizing:border-box;min-height:70px;font:inherit;font-size:.93rem;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--text);resize:vertical}.ask-row{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px}.ask-send{min-height:38px}.ask-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:99;background:var(--text);color:var(--bg);padding:10px 16px;border-radius:12px;font-size:.9rem;max-width:90vw}';
  document.head.appendChild(css);
})(typeof window !== 'undefined' ? window : globalThis);
