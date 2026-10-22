/* Formatting + answer parsing helpers */
(function (root) {
  var FSM = root.FSM = root.FSM || {};
  var SYM = { EUR: '€', USD: '$', GBP: '£' };

  function group(n, dp) {
    var neg = n < 0;
    var s = Math.abs(n).toFixed(dp);
    var p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + p.join('.');
  }
  function num(n, dp) {
    if (dp === undefined) dp = Math.abs(n - Math.round(n)) < 1e-9 ? 0 : 2;
    return group(n, dp);
  }
  function money(n, cur, dp) {
    cur = cur || 'EUR';
    if (dp === undefined) dp = Math.abs(n - Math.round(n)) < 1e-9 ? 0 : 2;
    var sym = SYM[cur] || cur;
    var s = sym + group(Math.abs(n), dp);
    return n < 0 ? '−' + s : s;
  }
  /* money in thousands: 1,234 ('000) */
  function k(n, dp) { return group(n / 1000, dp || 0); }
  function pct(x, dp) { if (dp === undefined) dp = 2; return group(x * 100, dp) + '%'; }
  function days(x, dp) { return group(x, dp === undefined ? 1 : dp) + ' days'; }
  function times(x, dp) { return group(x, dp === undefined ? 2 : dp) + '×'; }

  function fmt(value, unit, opts) {
    opts = opts || {};
    var dp = opts.dp;
    switch (unit) {
      case 'cur': return money(value, opts.cur, dp);
      case 'pct': return pct(value, dp === undefined ? 2 : dp);
      case 'days': return days(value, dp);
      case 'x': return times(value, dp);
      case 'units': return num(value, dp || 0) + ' units';
      default: return num(value, dp);
    }
  }

  /* Parse user input. Accepts 1,234.5 / 1.234,5 / €1.2m / 6.38% / 0.0638 / (500) */
  function parse(str) {
    if (str === null || str === undefined) return NaN;
    var s = String(str).trim().toLowerCase();
    if (!s) return NaN;
    var neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    s = s.replace(/[€$£\s]|eur|usd|gbp|days?|units?|x|×/g, '');
    if (s[0] === '-' || s[0] === '−' || s[0] === '–') { neg = true; s = s.slice(1); }
    var isPct = s.indexOf('%') >= 0;
    s = s.replace('%', '');
    var mult = 1;
    var m = s.match(/(k|m|mn|mln|bn|b)$/);
    if (m) {
      mult = { k: 1e3, m: 1e6, mn: 1e6, mln: 1e6, b: 1e9, bn: 1e9 }[m[1]];
      s = s.slice(0, -m[1].length);
    }
    // decide decimal separator
    var hasComma = s.indexOf(',') >= 0, hasDot = s.indexOf('.') >= 0;
    if (hasComma && hasDot) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (hasComma) {
      var parts = s.split(',');
      // "1,234" or "1,234,567" => thousands; "6,38" => decimal
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) s = s.replace(/,/g, '');
      else s = s.replace(',', '.');
    } else if (hasDot) {
      var dparts = s.split('.');
      if (dparts.length > 2) s = s.replace(/\./g, ''); // 1.234.567
    }
    if (!/^\d*\.?\d+$|^\d+\.?$/.test(s)) return NaN;
    var v = parseFloat(s) * mult;
    if (neg) v = -v;
    return { value: v, isPct: isPct };
  }

  /* Grade a numeric answer. unit 'pct' expects a fraction (0.0638); accepts 6.38 or 0.0638 or "6.38%". */
  function grade(input, correct, unit, opts) {
    opts = opts || {};
    var p = parse(input);
    if (!p || isNaN(p.value)) return { ok: false, parsed: NaN, reason: 'unreadable' };
    var v = p.value;
    var candidates = [v];
    if (unit === 'pct') {
      if (p.isPct) candidates = [v / 100];
      else candidates = [v / 100, v];
    }
    var tolRel = opts.tolRel !== undefined ? opts.tolRel : 0.005;
    var tolAbs = opts.tolAbs !== undefined ? opts.tolAbs : implied(unit, opts.dp);
    var best = null;
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var diff = Math.abs(c - correct);
      var ok = diff <= Math.max(Math.abs(correct) * tolRel, tolAbs) + 1e-12;
      var exact = diff <= Math.abs(correct) * 1e-6 + 1e-9;
      if (ok && (!best || diff < best.diff)) best = { ok: true, exact: exact, parsed: c, diff: diff };
    }
    if (best) return best;
    return { ok: false, parsed: unit === 'pct' && !p.isPct && Math.abs(v) > 1.5 ? v / 100 : candidates[0] };
  }
  function implied(unit, dp) {
    if (dp === undefined) return unit === 'pct' ? 0.00005 : 0.5;
    var step = Math.pow(10, -dp) / 2;
    return unit === 'pct' ? step / 100 : step;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  FSM.fmt = { num: num, money: money, k: k, pct: pct, days: days, times: times, fmt: fmt, parse: parse, grade: grade, esc: esc, SYM: SYM };
  if (typeof module !== 'undefined' && module.exports) module.exports = FSM.fmt;
})(typeof window !== 'undefined' ? window : globalThis);
