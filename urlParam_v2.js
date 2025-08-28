<script>
(function(){
  // ===== Helpers =====
  function setCookie(name, value, days) {
    if (typeof days === 'undefined') days = 30;
    var expires = new Date();
    expires.setDate(expires.getDate() + days);
    // Mantém legível: não usa encodeURIComponent; só sanitiza ; e quebras de linha
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
  // Detecta e decodifica valores que vieram URL-encodados (%XX); mantém legível
  function maybeDecodeURIComponent(str) {
    if (!str) return '';
    try {
      var decoded = decodeURIComponent(str);
      // Se re-encodar volta igual, então estava encodado e podemos usar decodificado
      return encodeURIComponent(decoded) === str ? decoded : str;
    } catch (e) { return str; }
  }
  function readCookieDecoded(name) {
    return maybeDecodeURIComponent(getCookie(name) || '');
  }

  // ===== Cookie init (GRAVA SEM URL-ENCODE NOS COOKIES) =====
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
  function captureFirstClick() {
    if (!getCookie('firstClickUrl')) setCookie('firstClickUrl', window.location.href);
    if (!getCookie('firstClickUrlDateTime')) setCookie('firstClickUrlDateTime', new Date().toISOString());

    // Envia evento pro GA4 via dataLayer (com valores legíveis)
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

  // ===== URL builder (usa URLSearchParams -> UM ÚNICO encode na URL final) =====
  function urlBuilder() {
    var baseUrl = 'https://www.trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais';
    var params = new URLSearchParams({
      referrer:               readCookieDecoded('referrer'),
      landingUrl:             readCookieDecoded('landingUrl'),
      dispositivo:            readCookieDecoded('device'),
      firstClickUrl:          readCookieDecoded('firstClickUrl'),
      firstClickUrlDateTime:  getCookie('firstClickUrlDateTime') || '',
      firstLandingUrl:        readCookieDecoded('firstLandingUrl'),
      firstLandingUrlDateTime:getCookie('firstLandingUrlDateTime') || ''
    });
    return baseUrl + '?' + params.toString();
  }

  function interceptAndRedirect() {
    captureFirstClick();
    var finalUrl = urlBuilder();
    window.location.href = finalUrl;
  }

  // ===== Link Interceptor (debug) =====
  function setupLinkInterceptor() {
    var targetUrlPart = 'trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais';

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (link && link.href) {
        console.log('Trinks Debug: Um link foi clicado. A verificar destino:', link.href);
        if (link.href.includes(targetUrlPart)) {
          console.log('Trinks Debug: Link para o site principal FOI INTERCEPTADO!', link.href);
          e.preventDefault();
          interceptAndRedirect();
        } else {
          console.log('Trinks Debug: O link clicado não corresponde ao alvo.');
        }
      }
    }, true);
  }

  // ===== Boot =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Migração: se cookies antigos estiverem URL-encodados, regrava decodificados
      ['referrer','landingUrl','device','firstLandingUrl','firstClickUrl'].forEach(function(k){
        var v = readCookieDecoded(k);
        if (v && v !== getCookie(k)) setCookie(k, v);
      });
      initCookies();
      setupLinkInterceptor();
    });
  } else {
    ['referrer','landingUrl','device','firstLandingUrl','firstClickUrl'].forEach(function(k){
      var v = readCookieDecoded(k);
      if (v && v !== getCookie(k)) setCookie(k, v);
    });
    initCookies();
    setupLinkInterceptor();
  }

  // Expor util p/ testes
  window.interceptAndRedirect = interceptAndRedirect;
})();
</script>
