/* Small helpers shared by generator files */
(function (root) {
  var FSM = root.FSM = root.FSM || {};
  var F = FSM.fmt;
  FSM.h = {
    /* fact for the stem: label (table), v, unit, s (sentence) */
    fact: function (label, v, unit, s, extra) {
      var o = { label: label, v: v, unit: unit, s: s };
      if (extra) for (var k in extra) o[k] = extra[k];
      return o;
    },
    /* solution step: t = text, v = value shown after "=", unit, src = where it comes from */
    step: function (t, v, unit, src, dp) { return { t: t, v: v, unit: unit, src: src, dp: dp }; },
    /* round helpers */
    r0: function (x) { return Math.round(x); },
    r2: function (x) { return Math.round(x * 100) / 100; },
    r4: function (x) { return Math.round(x * 10000) / 10000; },
    /* formatting shortcuts */
    n: function (x, dp) { return F.num(x, dp); },
    p: function (x, dp) { return F.pct(x, dp === undefined ? 2 : dp); },
    /* pick one of several phrasings */
    any: function (r, arr) { return r.pick(arr); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
