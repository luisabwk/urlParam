<script>
(function(){
  // ============= CONFIGURAÇÃO =============
  var TARGET_URL = 'https://www.trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais';
  var DEBUG_MODE = true; // Mudar para false em produção
  
  // ============= FUNÇÕES DE COOKIE =============
  function setCookie(name, value, days) {
    days = days || 30;
    var expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
  }
  
  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  
  function safeEncode(str) {
    if (!str) return '';
    try {
      // Tenta decodificar primeiro para evitar dupla codificação
      try {
        str = decodeURIComponent(str);
      } catch(e) {}
      return encodeURIComponent(str);
    } catch(e) {
      console.error('Erro ao codificar:', e);
      return str;
    }
  }
  
  // ============= COLETA DE DADOS =============
  function initializeTracking() {
    if (DEBUG_MODE) console.log('[TRINKS] Inicializando rastreamento...');
    
    // Captura referrer original (de onde o usuário veio para o blog)
    if (!getCookie('trinks_referrer')) {
      var referrer = document.referrer || 'direct';
      setCookie('trinks_referrer', safeEncode(referrer));
      if (DEBUG_MODE) console.log('[TRINKS] Referrer salvo:', referrer);
    }
    
    // Captura URL de entrada no blog
    if (!getCookie('trinks_landing_url')) {
      var landingUrl = window.location.href;
      setCookie('trinks_landing_url', safeEncode(landingUrl));
      if (DEBUG_MODE) console.log('[TRINKS] Landing URL salva:', landingUrl);
    }
    
    // Detecta dispositivo
    if (!getCookie('trinks_device')) {
      var device = (window.innerWidth < 768) ? 'mobile' : 'desktop';
      setCookie('trinks_device', device);
      if (DEBUG_MODE) console.log('[TRINKS] Dispositivo detectado:', device);
    }
    
    // Primeira URL de entrada (histórico)
    if (!getCookie('trinks_first_landing_url')) {
      setCookie('trinks_first_landing_url', safeEncode(window.location.href));
      setCookie('trinks_first_landing_datetime', new Date().toISOString());
    }
  }
  
  // ============= CAPTURA DE CLIQUE =============
  function captureClickData() {
    // Salva dados do momento do clique
    if (!getCookie('trinks_first_click_url')) {
      setCookie('trinks_first_click_url', safeEncode(window.location.href));
      setCookie('trinks_first_click_datetime', new Date().toISOString());
    }
    
    // Envia evento para GA4
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'trinks_parametros_capturados',
        event_category: 'engagement',
        event_label: window.location.pathname,
        // Parâmetros detalhados para GTM
        referrer: getCookie('trinks_referrer'),
        landing_url: getCookie('trinks_landing_url'),
        device: getCookie('trinks_device'),
        first_click_url: getCookie('trinks_first_click_url'),
        first_click_datetime: getCookie('trinks_first_click_datetime'),
        first_landing_url: getCookie('trinks_first_landing_url'),
        first_landing_datetime: getCookie('trinks_first_landing_datetime'),
        current_url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      
      if (DEBUG_MODE) console.log('[TRINKS] Evento enviado para GTM');
    }
  }
  
  // ============= CONSTRUÇÃO DA URL COM PARÂMETROS =============
  function buildUrlWithParams() {
    var params = [];
    
    // Coletar todos os parâmetros dos cookies
    var paramMapping = {
      'referrer': getCookie('trinks_referrer'),
      'landingUrl': getCookie('trinks_landing_url'),
      'dispositivo': getCookie('trinks_device'),
      'firstClickUrl': getCookie('trinks_first_click_url'),
      'firstClickUrlDateTime': getCookie('trinks_first_click_datetime'),
      'firstLandingUrl': getCookie('trinks_first_landing_url'),
      'firstLandingUrlDateTime': getCookie('trinks_first_landing_datetime')
    };
    
    // Construir string de parâmetros
    for (var key in paramMapping) {
      if (paramMapping[key]) {
        // Decodificar o valor do cookie antes de adicionar à URL
        var value = paramMapping[key];
        try {
          value = decodeURIComponent(value);
        } catch(e) {}
        
        // Re-codificar para a URL
        params.push(key + '=' + encodeURIComponent(value));
      }
    }
    
    // Adicionar timestamp para evitar cache
    params.push('t=' + Date.now());
    
    var finalUrl = TARGET_URL + '?' + params.join('&');
    
    if (DEBUG_MODE) {
      console.log('[TRINKS] URL final construída:', finalUrl);
      console.log('[TRINKS] Parâmetros:', paramMapping);
    }
    
    return finalUrl;
  }
  
  // ============= INTERCEPTADOR DE LINKS =============
  function interceptLinks() {
    // Variações possíveis da URL alvo
    var urlPatterns = [
      'trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais',
      'trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento',
      '/cadastrar-meu-estabelecimento/dados-iniciais'
    ];
    
    document.addEventListener('click', function(e) {
      // Encontrar o elemento <a> mais próximo
      var link = e.target.closest('a');
      
      if (!link || !link.href) return;
      
      // Verificar se o link corresponde ao padrão
      var shouldIntercept = false;
      for (var i = 0; i < urlPatterns.length; i++) {
        if (link.href.indexOf(urlPatterns[i]) > -1) {
          shouldIntercept = true;
          break;
        }
      }
      
      if (shouldIntercept) {
        if (DEBUG_MODE) console.log('[TRINKS] Link interceptado!', link.href);
        
        // Prevenir navegação padrão
        e.preventDefault();
        e.stopPropagation();
        
        // Capturar dados do clique
        captureClickData();
        
        // Construir URL com parâmetros
        var urlComParametros = buildUrlWithParams();
        
        // Redirecionar
        if (DEBUG_MODE) {
          console.log('[TRINKS] Redirecionando para:', urlComParametros);
          // Em modo debug, mostrar confirmação
          if (confirm('MODO DEBUG\n\nRedirecionar para:\n' + urlComParametros + '\n\nConfirmar?')) {
            window.location.href = urlComParametros;
          }
        } else {
          // Em produção, redirecionar direto
          window.location.href = urlComParametros;
        }
        
        return false;
      }
    }, true); // true = captura na fase de bubbling
  }
  
  // ============= MONITOR DE CONTEÚDO DINÂMICO =============
  function monitorDynamicContent() {
    if (typeof MutationObserver === 'undefined') return;
    
    var observer = new MutationObserver(function(mutations) {
      // Verificar se novos links foram adicionados
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            var links = node.querySelectorAll ? node.querySelectorAll('a') : [];
            if (links.length > 0 && DEBUG_MODE) {
              console.log('[TRINKS] Novos links detectados:', links.length);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // ============= FUNÇÕES DE DEBUG =============
  function debugInfo() {
    console.log('========== TRINKS DEBUG ==========');
    console.log('Cookies salvos:');
    console.log('  referrer:', getCookie('trinks_referrer'));
    console.log('  landingUrl:', getCookie('trinks_landing_url'));
    console.log('  dispositivo:', getCookie('trinks_device'));
    console.log('  firstClickUrl:', getCookie('trinks_first_click_url'));
    console.log('  firstClickUrlDateTime:', getCookie('trinks_first_click_datetime'));
    console.log('  firstLandingUrl:', getCookie('trinks_first_landing_url'));
    console.log('  firstLandingUrlDateTime:', getCookie('trinks_first_landing_datetime'));
    console.log('URL que seria gerada:', buildUrlWithParams());
    console.log('===================================');
  }
  
  // ============= INICIALIZAÇÃO =============
  function init() {
    console.log('[TRINKS] Script carregado - Versão 2.0');
    
    // Inicializar rastreamento
    initializeTracking();
    
    // Configurar interceptadores
    interceptLinks();
    
    // Monitorar conteúdo dinâmico
    monitorDynamicContent();
    
    // Expor funções globais para debug
    window.trinksDebug = debugInfo;
    window.trinksTestRedirect = function() {
      captureClickData();
      var url = buildUrlWithParams();
      console.log('[TRINKS] URL de teste:', url);
      if (confirm('Testar redirecionamento para:\n' + url)) {
        window.location.href = url;
      }
    };
    
    // Expor funções para compatibilidade com página de teste
    window.initCookies = initializeTracking;
    window.captureFirstClick = captureClickData;
    window.urlBuilder = buildUrlWithParams;
    window.interceptAndRedirect = function() {
      captureClickData();
      var url = buildUrlWithParams();
      if (DEBUG_MODE) {
        if (confirm('Redirecionar para:\n' + url + '\n\nConfirmar?')) {
          window.location.href = url;
        }
      } else {
        window.location.href = url;
      }
    };
    
    if (DEBUG_MODE) {
      console.log('[TRINKS] Modo DEBUG ativado');
      console.log('[TRINKS] Digite "trinksDebug()" no console para ver os dados');
      console.log('[TRINKS] Digite "trinksTestRedirect()" para testar o redirecionamento');
      console.log('[TRINKS] Funções de teste disponíveis: initCookies(), captureFirstClick(), urlBuilder(), interceptAndRedirect()');
    }
  }
  
  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>