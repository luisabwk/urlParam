// urlParam_v2.js
(function(){
  // ===== Config =====
  var BASE_URL = 'https://www.trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais';

  // ===== Helpers =====
  function setCookie(name, value, days) {
    if (typeof days === 'undefined') days = 30;
    var expires = new Date();
    expires.setDate(expires.getDate() + days);
    var sanitized = String(value || '').replace(/[\r\n;]/g, ' ').trim();
    document.cookie = name + '=' + sanitized + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf(name + '=') === 0) {
        return c.substring(name.length + 1);
      }
    }
    return null;
  }

  // Detecta e decodifica valores URL-encodados (%XX) e também caso de '+'
  function maybeDecodeURIComponent(str) {
    if (!str) return '';
    try {
      var dec = decodeURIComponent(str);
      if (dec !== str) return dec;
      if (str.indexOf('+') !== -1 && str.indexOf('%20') === -1) {
        try { return decodeURIComponent(str.replace(/\+/g, '%20')); } catch (e2) {}
      }
      return str;
    } catch (e) {
      return str;
    }
  }

  function readCookieDecoded(name) {
    return maybeDecodeURIComponent(getCookie(name) || '');
  }

  function normalizeForMatch(u) {
    try {
      var url = new URL(u, location.origin);
      var host = url.host.replace(/^www\./, '');
      var path = url.pathname.replace(/\/+$/,''); // sem barra final
      return host + path;
    } catch(e) { return ''; }
  }

  var BASE_MATCH = normalizeForMatch(BASE_URL);

  // ===== Cookie init (GRAVA SEM URL-ENCODE) =====
  function initCookies() {
    if (!getCookie('referrer')) setCookie('referrer', document.referrer || '');
    if (!getCookie('landingUrl')) setCookie('landingUrl', window.location.href);
    if (!getCookie('device')) {
      var device = window.innerWidth < 768 ? 'mobile' : 'desktop';
      setCookie('device', device);
    }
    if (!getCookie('firstLandingUrl')) setCookie('firstLandingUrl', window.location.href);
    if (!getCookie('firstLandingUrlDateTime')) setCookie('firstLandingUrlDateTime', new Date().toISOString());
  }

  // ===== First Click capture =====
  // Agora guarda o DESTINO clicado (linkHref), e só quando o link bate com a BASE_URL
  function captureFirstClick(linkHref) {
    if (!getCookie('firstClickUrl')) setCookie('firstClickUrl', linkHref || window.location.href);
    if (!getCookie('firstClickUrlDateTime')) setCookie('firstClickUrlDateTime', new Date().toISOString());

    // Evento GA4 (valores legíveis)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'parametros_blog',
      event_category: 'engagement',
      event_label: window.location.pathname,
      referrer:               readCookieDecoded('referrer'),
      landing_url:            readCookieDecoded('landingUrl'),
      device:                 readCookieDecoded('device'),
      first_click_url:        readCookieDecoded('firstClickUrl'),
      first_click_datetime:   getCookie('firstClickUrlDateTime') || '',
      first_landing_url:      readCookieDecoded('firstLandingUrl'),
      first_landing_datetime: getCookie('firstLandingUrlDateTime') || ''
    });
  }

  // ===== URL builder (URLSearchParams faz o ÚNICO encode na URL final) =====
  function urlBuilder() {
    var params = new URLSearchParams({
      referrer:               readCookieDecoded('referrer'),
      landingUrl:             readCookieDecoded('landingUrl'),
      dispositivo:            readCookieDecoded('device'),
      firstClickUrl:          readCookieDecoded('firstClickUrl'),
      firstClickUrlDateTime:  getCookie('firstClickUrlDateTime') || '',
      firstLandingUrl:        readCookieDecoded('firstLandingUrl'),
      firstLandingUrlDateTime:getCookie('firstLandingUrlDateTime') || ''
    });
    return BASE_URL + '?' + params.toString();
  }

  function interceptAndRedirect(linkHref) {
    captureFirstClick(linkHref);
    var finalUrl = urlBuilder();
    renderDebugUrl(finalUrl); // mostra antes de redirecionar (debug)
    window.location.href = finalUrl;
  }

  // ===== Debug visual =====
  function renderDebugUrl(urlStr) {
    var el = document.getElementById('parameters');
    if (!el) return;
    var final = urlStr || urlBuilder();

    el.innerHTML = '';
    var p = document.createElement('p');
    p.textContent = 'URL de redirecionamento:';
    var a = document.createElement('a');
    a.href = final;
    a.textContent = final;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    el.appendChild(p);
    el.appendChild(a);

    var pre = document.createElement('pre');
    pre.style.marginTop = '10px';
    pre.textContent = JSON.stringify({
      referrer: readCookieDecoded('referrer'),
      landingUrl: readCookieDecoded('landingUrl'),
      dispositivo: readCookieDecoded('device'),
      firstClickUrl: readCookieDecoded('firstClickUrl'),
      firstClickUrlDateTime: getCookie('firstClickUrlDateTime') || '',
      firstLandingUrl: readCookieDecoded('firstLandingUrl'),
      firstLandingUrlDateTime: getCookie('firstLandingUrlDateTime') || ''
    }, null, 2);
    el.appendChild(pre);
  }

  // ===== Link Interceptor =====
  // Aciona SEMPRE que a âncora clicada tiver href que "bate" com a BASE_URL (ignorando http/https, www e barra final)
  function setupLinkInterceptor() {
    document.addEventListener('click', function(e) {
      var link = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!link || !link.href) return;

      // normaliza e compara (host+path)
      var matches = normalizeForMatch(link.href).startsWith(BASE_MATCH);
      if (!matches) return;

      // Intercepta e redireciona com parâmetros
      e.preventDefault();
      interceptAndRedirect(link.href);
    }, true);
  }

  // ===== Migração (NORMALIZA E REGRAVA também as DATAS) =====
  function migrateDecodingIfNeeded() {
    ['referrer','landingUrl','device','firstLandingUrl','firstClickUrl','firstClickUrlDateTime','firstLandingUrlDateTime']
      .forEach(function(k){
        var raw = getCookie(k);
        if (!raw) return;
        var looksEncoded = /%[0-9A-Fa-f]{2}/.test(raw) || raw.indexOf('+') !== -1;
        var dec = maybeDecodeURIComponent(raw);
        if (looksEncoded || dec !== raw) {
          setCookie(k, dec);
          console.log('[cookies] normalizado:', k, '->', dec);
        }
      });
  }

  // ===== Boot =====
  function boot() {
    migrateDecodingIfNeeded();
    initCookies();
    setupLinkInterceptor();
    renderDebugUrl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expor utils p/ testes
  window.interceptAndRedirect = interceptAndRedirect;
  window.__urlParamDebug__ = { urlBuilder, renderDebugUrl };
})();
