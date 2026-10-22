/* "My books" reader: stores YOUR OWN PDF copies locally (IndexedDB) and opens them at the pages you set.
   Nothing is uploaded anywhere — the files never leave this browser. */
(function (root) {
  var DB = 'fsm-books', STORE = 'files';
  var BOOKS = {
    zs: { title: 'Principles of Managerial Finance', sub: 'Zutter & Smart · 16th ed. · Pearson · ISBN 9781292400648' },
    langley: { title: 'Supply Chain Management: A Logistics Perspective', sub: 'Langley, Novack, Gibson & Coyle · 11th ed. · Cengage · ISBN 9780357442135' }
  };
  function open() {
    return new Promise(function (res, rej) {
      if (!root.indexedDB) return rej(new Error('IndexedDB not available'));
      var rq = indexedDB.open(DB, 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore(STORE); };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
  }
  function tx(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(STORE, mode), st = t.objectStore(STORE), out = fn(st);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : undefined); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  function ls(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return {}; }
  }
  var urls = {};
  var R = root.FSMReader = {
    BOOKS: BOOKS,
    save: function (book, file) { delete urls[book]; return tx('readwrite', function (s) { return s.put({ blob: file, name: file.name, size: file.size, added: Date.now() }, book); }); },
    get: function (book) { return tx('readonly', function (s) { return s.get(book); }); },
    remove: function (book) { delete urls[book]; return tx('readwrite', function (s) { return s.delete(book); }); },
    url: function (book) {
      if (urls[book]) return Promise.resolve(urls[book]);
      return R.get(book).then(function (rec) { if (!rec) return null; urls[book] = URL.createObjectURL(rec.blob); return urls[book]; });
    },
    pages: function (id, from, to) {
      var all = ls('fsm.guide.pages');
      if (from === undefined) return all[id] || null;
      if (from === null) delete all[id]; else all[id] = { from: from, to: to };
      ls('fsm.guide.pages', all);
    },
    link: function (book, url) {
      var all = ls('fsm.guide.links');
      if (url === undefined) return all[book] || '';
      if (!url) delete all[book]; else all[book] = url;
      ls('fsm.guide.links', all);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
