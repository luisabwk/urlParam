<script>
(function(){
  // Função para definir um cookie
  function setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  // Função para obter o valor de um cookie
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      c = c.trim();
      if (c.indexOf(name + '=') === 0) {
        return c.substring(name.length + 1);
      }
    }
    return null;
  }

  // Função para capturar e definir dados reais do navegador (se ainda não estiverem salvos)
  function initCookies() {
    if (!getCookie('referrer')) {
      setCookie('referrer', encodeURIComponent(document.referrer || ''));
    }
    if (!getCookie('landingUrl')) {
      setCookie('landingUrl', encodeURIComponent(window.location.href));
    }
    if (!getCookie('device')) {
      const device = window.innerWidth < 768 ? 'mobile' : 'desktop';
      setCookie('device', encodeURIComponent(device));
    }
    if (!getCookie('firstLandingUrl')) {
      setCookie('firstLandingUrl', encodeURIComponent(window.location.href));
    }
    if (!getCookie('firstLandingUrlDateTime')) {
      setCookie('firstLandingUrlDateTime', new Date().toISOString());
    }
  }

  // Função para capturar os dados do primeiro clique (executada na ação do usuário)
  function captureFirstClick() {
    if (!getCookie('firstClickUrl')) {
      setCookie('firstClickUrl', encodeURIComponent(window.location.href));
    }
    if (!getCookie('firstClickUrlDateTime')) {
      setCookie('firstClickUrlDateTime', new Date().toISOString());
    }
  }

  // Função para montar a URL de redirecionamento com os parâmetros obtidos dos cookies
  function urlBuilder() {
    const baseUrl = 'Sua URL aqui'; // Cole sua URL aqui
    const params = new URLSearchParams({
      referrer: getCookie('referrer') || '',
      landingUrl: getCookie('landingUrl') || '',
      dispositivo: getCookie('device') || '',
      firstClickUrl: getCookie('firstClickUrl') || '',
      firstClickUrlDateTime: getCookie('firstClickUrlDateTime') || '',
      firstLandingUrl: getCookie('firstLandingUrl') || '',
      firstLandingUrlDateTime: getCookie('firstLandingUrlDateTime') || ''
    });
    return `${baseUrl}?${params.toString()}`;
  }

  // Função que intercepta a URL, captura o primeiro clique e redireciona mediante confirmação
  function interceptAndRedirect() {
    captureFirstClick();
    const finalUrl = urlBuilder();
    if (confirm("Você será redirecionado para:\n\n" + finalUrl + "\n\nContinuar?")) {
      window.location.href = finalUrl;
    }
  }

  // Inicializa a captura dos cookies assim que o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', initCookies);

  // Exponha a função de redirecionamento ao escopo global para uso via GTM ou eventos na página
  window.interceptAndRedirect = interceptAndRedirect;
})();
</script>
