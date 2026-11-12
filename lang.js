/* Единая логика языка сайта (RU / EN / SR).
   Подключается в <head> всех страниц: <script src="lang.js"></script>
   - хранит выбор языка в localStorage под ключом siteLang;
   - при несовпадении выбранного языка и языка страницы переносит на нужную версию
     (с сохранением ?query и #hash);
   - расставляет корректные ссылки в переключателе RU / EN / SR;
   - переписывает внутренние ссылки меню, кнопок и подвала на файлы текущего языка. */
(function () {
  'use strict';

  var KEY = 'siteLang';
  var SUPPORTED = ['ru', 'en', 'sr'];
  var PAGES = ['index', 'breeders', 'puppies', 'contacts'];

  function readPref() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function savePref(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* приватный режим и т.п. */ }
  }
  function suffix(lang) {
    return lang === 'ru' ? '' : '_' + lang;
  }

  var current = String(document.documentElement.lang || 'ru').toLowerCase().slice(0, 2);
  if (SUPPORTED.indexOf(current) === -1) current = 'ru';

  var file = location.pathname.split('/').pop() || 'index.html';
  var match = file.match(/^([a-z]+)(?:_(?:ru|en|sr))?\.html$/i);
  var base = match ? match[1].toLowerCase() : null;
  if (!base || PAGES.indexOf(base) === -1) return; // admin.html и прочие служебные страницы

  var pref = readPref();
  if (SUPPORTED.indexOf(pref) === -1) {
    pref = current;
    savePref(current);
  }

  if (pref !== current) {
    location.replace(base + suffix(pref) + '.html' + location.search + location.hash);
    return;
  }

  function init() {
    // 1. Переключатель языка
    document.querySelectorAll('.lang-switch a').forEach(function (a) {
      var lang = (a.getAttribute('data-lang') || a.getAttribute('lang') || a.textContent || '')
        .trim().toLowerCase();
      if (SUPPORTED.indexOf(lang) === -1) return;
      a.setAttribute('data-lang', lang);
      a.setAttribute('href', base + suffix(lang) + '.html');
      a.classList.toggle('active', lang === current);
      a.addEventListener('click', function () { savePref(lang); });
    });

    // 2. Остальные внутренние ссылки ведут на версию текущего языка
    document.querySelectorAll('a[href]').forEach(function (a) {
      if (a.closest('.lang-switch')) return;
      var href = a.getAttribute('href');
      var m = href && href.match(/^([a-z]+)(?:_(?:ru|en|sr))?\.html(.*)$/i);
      if (!m) return;
      var target = m[1].toLowerCase();
      if (PAGES.indexOf(target) === -1) return;
      a.setAttribute('href', target + suffix(current) + '.html' + m[2]);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();