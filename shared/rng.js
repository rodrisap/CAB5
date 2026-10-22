/* Seeded RNG — same Park–Miller generator as the instructor's Excel files.
   seed0 = version * 26; next = (48271 * prev) mod (2^31 - 1). */
(function (root) {
  var M = 2147483647;
  function RNG(version) {
    var v = Math.abs(Math.floor(Number(version) || 1));
    this.state = (v * 26) % M || 26;
  }
  RNG.prototype.next = function () {
    // 48271 * state can exceed 2^53 only if state > ~1.8e11, which never happens (state < 2^31)
    this.state = (48271 * this.state) % M;
    return this.state;
  };
  RNG.prototype.uniform = function () { return this.next() / M; };
  RNG.prototype.int = function (min, max) { return min + Math.floor(this.uniform() * (max - min + 1)); };
  RNG.prototype.pick = function (arr) { return arr[Math.floor(this.uniform() * arr.length)]; };
  RNG.prototype.chance = function (p) { return this.uniform() < p; };
  RNG.prototype.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(this.uniform() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  RNG.prototype.sample = function (arr, n) { return this.shuffle(arr).slice(0, n); };
  /* step-rounded random number in [min,max] */
  RNG.prototype.range = function (min, max, step) {
    step = step || 1;
    var n = Math.floor((max - min) / step);
    return roundTo(min + this.int(0, n) * step, step);
  };
  function roundTo(x, step) {
    var d = (String(step).split('.')[1] || '').length;
    return Number((Math.round(x / step) * step).toFixed(d));
  }
  RNG.roundTo = roundTo;
  root.FSM = root.FSM || {};
  root.FSM.RNG = RNG;
  if (typeof module !== 'undefined' && module.exports) module.exports = RNG;
})(typeof window !== 'undefined' ? window : globalThis);
