/* Загрузка щенков из Supabase на страницы puppies.html / puppies_en.html / puppies_sr.html.
   Все данные выводятся безопасно через createElement + textContent (без innerHTML). */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://zbazddnakicxxtbhjvzz.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_uAReKc7ntb_Ctbquh8tPTw_9o6v8ozF';
  var TABLE = 'puppies';

  var LABELS = {
    ru: { badge: 'Щенок на продажу', birth: 'Дата рождения: ', videoAria: 'Видео щенка ' },
    en: { badge: 'Puppy for Sale', birth: 'Date of birth: ', videoAria: 'Video of puppy ' },
    sr: { badge: 'Štene na prodaju', birth: 'Datum rođenja: ', videoAria: 'Video šteneta ' }
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

  function buildCard(puppy) {
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-dynamic', '1');

    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = labels.badge;
    card.appendChild(badge);

    var src = safeUrl(puppy.media_url);
    if (src) {
      if (puppy.media_type === 'video') {
        var video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.preload = 'metadata';
        video.setAttribute('aria-label', labels.videoAria + (puppy.name || ''));
        card.appendChild(video);
      } else {
        var img = document.createElement('img');
        img.src = src;
        img.alt = puppy.name || '';
        img.loading = 'lazy';
        card.appendChild(img);
      }
    }

    var h3 = document.createElement('h3');
    h3.textContent = puppy.name || '';
    card.appendChild(h3);

    if (puppy.parents) {
      var meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = puppy.parents;
      card.appendChild(meta);
    }

    var listItems = [];
    if (puppy.birth_date) {
      listItems.push(labels.birth + puppy.birth_date);
    }
    if (puppy.details) {
      String(puppy.details)
        .split(/[\n,]+/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean)
        .forEach(function (item) { listItems.push(item); });
    }

    if (listItems.length) {
      var ul = document.createElement('ul');
      ul.className = 'titles';
      listItems.forEach(function (text) {
        var li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }
а
    return card;
  }

  async function loadPuppies() {
    var container = document.getElementById('puppies') || document.querySelector('.cards-grid');
    if (!container) return;
    if (!window.supabase || !window.supabase.createClient) {
      console.error('supabase-js не загружен');
      return;
    }

    var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var result = await client.from(TABLE).select('*').order('id', { ascending: false });

    if (result.error) {
      console.error('Ошибка загрузки щенков:', result.error);
      return;
    }

    container.querySelectorAll('[data-dynamic="1"]').forEach(function (n) { n.remove(); });

    var fragment = document.createDocumentFragment();
    (result.data || []).forEach(function (puppy) { fragment.appendChild(buildCard(puppy)); });
    container.prepend(fragment);
  }

  loadPuppies();
})();