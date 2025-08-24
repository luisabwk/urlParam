<script>
(function(){
  // Função para definir um cookie
  function setCookie(name, value, days) {
    if (typeof days === 'undefined') days = 30;
    var expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
  }
  
  // Função para obter o valor de um cookie
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
  
  // Função para codificar URLs de forma segura (sem dupla codificação)
  function safeEncodeURIComponent(str) {
    try { 
      if (!str) return '';
      // Verifica se já está codificado para evitar dupla codificação
      try {
        decodeURIComponent(str);
        return str; // Já está codificado
      } catch (e) {
        return encodeURIComponent(str); // Precisa codificar
      }
    } catch (e) { 
      return ''; 
    }
  }
  
  // Função para decodificar URLs de forma segura
  function safeDecodeURIComponent(str) {
    try { 
      if (!str) return '';
      return decodeURIComponent(str); 
    } catch (e) { 
      return str; 
    }
  }
  
  // Inicializa cookies com dados reais do navegador
  function initCookies() {
    // Referrer - URL de origem
    if (!getCookie('referrer')) {
      var referrer = document.referrer || '';
      setCookie('referrer', safeEncodeURIComponent(referrer));
    }
    
    // Landing URL - URL atual
    if (!getCookie('landingUrl')) {
      setCookie('landingUrl', safeEncodeURIComponent(window.location.href));
    }
    
    // Device - Detecta dispositivo
    if (!getCookie('device')) {
      var device = window.innerWidth < 768 ? 'mobile' : 'desktop';
      setCookie('device', device);
    }
    
    // Primeira landing URL e data/hora
    if (!getCookie('firstLandingUrl')) {
      setCookie('firstLandingUrl', safeEncodeURIComponent(window.location.href));
    }
    if (!getCookie('firstLandingUrlDateTime')) {
      setCookie('firstLandingUrlDateTime', new Date().toISOString());
    }
    
    // Log para debug
    console.log('Trinks Debug: Cookies inicializados:', {
      referrer: getCookie('referrer'),
      landingUrl: getCookie('landingUrl'),
      device: getCookie('device'),
      firstLandingUrl: getCookie('firstLandingUrl'),
      firstLandingUrlDateTime: getCookie('firstLandingUrlDateTime')
    });
  }
  
  // Captura dados do primeiro clique e envia para GTM
  function captureFirstClick() {
    if (!getCookie('firstClickUrl')) {
      setCookie('firstClickUrl', safeEncodeURIComponent(window.location.href));
    }
    if (!getCookie('firstClickUrlDateTime')) {
      setCookie('firstClickUrlDateTime', new Date().toISOString());
    }
    
    // Envia evento para GA4 via dataLayer com TODOS os parâmetros
    window.dataLayer = window.dataLayer || [];
    var eventData = {
      event: 'parametros_blog',
      event_category: 'engagement',
      event_label: window.location.pathname,
      // Parâmetros principais (decodificados para legibilidade)
      referrer: safeDecodeURIComponent(getCookie('referrer') || ''),
      landing_url: safeDecodeURIComponent(getCookie('landingUrl') || ''),
      device: getCookie('device') || '',
      first_click_url: safeDecodeURIComponent(getCookie('firstClickUrl') || ''),
      first_click_datetime: getCookie('firstClickUrlDateTime') || '',
      first_landing_url: safeDecodeURIComponent(getCookie('firstLandingUrl') || ''),
      first_landing_datetime: getCookie('firstLandingUrlDateTime') || '',
      // Parâmetros adicionais para debug
      current_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    window.dataLayer.push(eventData);
    
    // Log para debug
    console.log('Trinks Debug: Evento enviado para GTM:', eventData);
    
    // Aguarda um momento para garantir que o evento foi processado
    setTimeout(function() {
      console.log('Trinks Debug: Evento processado, redirecionando...');
    }, 100);
  }
  
  // Constrói a URL de redirecionamento com parâmetros
  function urlBuilder() {
    var baseUrl = 'https://www.trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais';
    var params = [];
    
    // Dados dos cookies (decodificados para evitar dupla codificação)
    var paramData = {
      'referrer': safeDecodeURIComponent(getCookie('referrer') || ''),
      'landingUrl': safeDecodeURIComponent(getCookie('landingUrl') || ''),
      'dispositivo': getCookie('device') || '',
      'firstClickUrl': safeDecodeURIComponent(getCookie('firstClickUrl') || ''),
      'firstClickUrlDateTime': getCookie('firstClickUrlDateTime') || '',
      'firstLandingUrl': safeDecodeURIComponent(getCookie('firstLandingUrl') || ''),
      'firstLandingUrlDateTime': getCookie('firstLandingUrlDateTime') || ''
    };
    
    // Adiciona apenas parâmetros que têm valor
    for (var key in paramData) {
      if (paramData.hasOwnProperty(key) && paramData[key]) {
        params.push(key + '=' + encodeURIComponent(paramData[key]));
      }
    }
    
    var finalUrl = baseUrl + '?' + params.join('&');
    
    // Log para debug
    console.log('Trinks Debug: URL final construída:', finalUrl);
    console.log('Trinks Debug: Parâmetros:', paramData);
    
    return finalUrl;
  }
  
  // Função principal de interceptação e redirecionamento
  function interceptAndRedirect() {
    console.log('Trinks Debug: Iniciando interceptação...');
    
    // Captura dados do primeiro clique
    captureFirstClick();
    
    // Aguarda um momento para garantir que o evento foi enviado
    setTimeout(function() {
      var finalUrl = urlBuilder();
      
      // Log final antes do redirecionamento
      console.log('Trinks Debug: Redirecionando para:', finalUrl);
      
      // Redireciona para a URL final
      window.location.href = finalUrl;
    }, 200);
  }
  
  // Configura interceptador de links com debug aprimorado
  function setupLinkInterceptor() {
    var targetUrlPart = 'trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais';
    
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      
      if (link && link.href) {
        console.log('Trinks Debug: Link clicado:', link.href);
        
        if (link.href.includes(targetUrlPart)) {
          console.log('Trinks Debug: Link interceptado! Executando redirecionamento...');
          
          e.preventDefault();
          interceptAndRedirect();
        } else {
          console.log('Trinks Debug: Link não é alvo, navegação normal.');
        }
      }
    }, true);
  }
  
  // Inicialização
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Trinks Debug: DOM carregado, inicializando...');
      initCookies();
      setupLinkInterceptor();
    });
  } else {
    console.log('Trinks Debug: DOM já carregado, inicializando...');
    initCookies();
    setupLinkInterceptor();
  }
  
  // Expõe função para uso externo
  window.interceptAndRedirect = interceptAndRedirect;
  
  // Log de inicialização
  console.log('Trinks Debug: Script carregado e funcionando');
})();
</script>