/* Загрузка собак из Supabase на страницы breeders.html / breeders_en.html / breeders_sr.html.
   Все данные выводятся безопасно через createElement + textContent (без innerHTML). */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://zbazddnakicxxtbhjvzz.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_uAReKc7ntb_Ctbquh8tPTw_9o6v8ozF';
  var TABLE = 'dogs';

  var LABELS = {
    ru: { female: 'Производительница', male: 'Производитель' },
    en: { female: 'Female (Dam)', male: 'Male (Sire)' },
    sr: { female: 'Ženka za uzgoj', male: 'Mužjak za uzgoj' }
  };

  var lang = String(document.documentElement.lang || 'ru').toLowerCase().slice(0, 2);
  var labels = LABELS[lang] || LABELS.ru;

  function safeUrl(value) {
    try {
      var u = new URL(String(value || ''), location.href);
      return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '';
    } catch (e) {
      return '';
    }
  }

  function isFemale(category) {
    return String(category || '').trim().toLowerCase() === 'производительница';
  }

  function buildCard(dog) {
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-dynamic', '1');

    var badge = document.createElement('span');
    badge.className = 'badge';
    if (isFemale(dog.category)) {
      badge.style.background = 'var(--color-accent-dark)';
      badge.textContent = labels.female;
    } else {
      badge.textContent = labels.male;
    }
    card.appendChild(badge);

    var src = safeUrl(dog.image_url);
    if (src) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = dog.name || '';
      img.loading = 'lazy';
      card.appendChild(img);
    }

    var h3 = document.createElement('h3');
    h3.textContent = dog.name || '';
    card.appendChild(h3);

    if (dog.pedigree) {
      var meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = dog.pedigree;
      card.appendChild(meta);
    }

    if (dog.health) {
      var health = document.createElement('div');
      health.className = 'health';
      health.textContent = dog.health;
      card.appendChild(health);
    }

    if (dog.temperament) {
      var temp = document.createElement('div');
      temp.className = 'meta';
      temp.textContent = dog.temperament;
      card.appendChild(temp);
    }

    if (dog.title) {
      var items = String(dog.title)
        .split(/[\n,]+/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      if (items.length) {
        var ul = document.createElement('ul');
        ul.className = 'titles';
        items.forEach(function (t) {
          var li = document.createElement('li');
          li.textContent = t;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }
    }

    return card;
  }

  async function loadDogs() {
    var container = document.getElementById('breeders');
    if (!container) return;
    if (!window.supabase || !window.supabase.createClient) {
      console.error('supabase-js не загружен');
      return;
    }

    var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var result = await client.from(TABLE).select('*').order('id', { ascending: false });

    if (result.error) {
      console.error('Ошибка загрузки собак:', result.error);
      return;
    }

    container.querySelectorAll('[data-dynamic="1"]').forEach(function (n) { n.remove(); });

    var fragment = document.createDocumentFragment();
    (result.data || []).forEach(function (dog) { fragment.appendChild(buildCard(dog)); });
    container.prepend(fragment);
  }

  loadDogs();
})();