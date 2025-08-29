// urlParam_v2.js
(function(){
  var DEBUG=true;
  var BASE_URL='https://www.trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais';
  function L(t,d){if(!DEBUG)return;try{console.log('[urlParam]',t,d||'')}catch(e){}}
  function snap(){return{referrer:getCookie('referrer'),landingUrl:getCookie('landingUrl'),device:getCookie('device'),firstLandingUrl:getCookie('firstLandingUrl'),firstLandingUrlDateTime:getCookie('firstLandingUrlDateTime'),firstClickUrl:getCookie('firstClickUrl'),firstClickUrlDateTime:getCookie('firstClickUrlDateTime')}}
  function setCookie(name,value,days){if(typeof days==='undefined')days=30;var e=new Date();e.setDate(e.getDate()+days);document.cookie=name+'='+String(value||'')+';expires='+e.toUTCString()+';path=/;SameSite=Lax'}
  function getCookie(name){var cs=document.cookie.split(';');for(var i=0;i<cs.length;i++){var c=cs[i].trim();if(c.indexOf(name+'=')===0){return c.substring(name.length+1)}}return null}
  function maybeDecodeURIComponent(str){if(!str)return'';try{var d=decodeURIComponent(str);if(d!==str)return d;if(str.indexOf('+')!==-1&&str.indexOf('%20')===-1){try{return decodeURIComponent(str.replace(/\+/g,'%20'))}catch(e2){}}return str}catch(e){return str}}
  function readCookieDecoded(n){return maybeDecodeURIComponent(getCookie(n)||'')}
  function normalizeForMatch(u){try{var url=new URL(u,location.origin);var h=url.host.replace(/^www\./,'');var p=url.pathname.replace(/\/+$/,'');return h+p}catch(e){return''}}
  var BASE_MATCH=normalizeForMatch(BASE_URL);
  function initCookies(){
    L('init:before',snap());
    if(!getCookie('referrer')){setCookie('referrer',document.referrer||'');L('init:set referrer',document.referrer||'')}
    if(!getCookie('landingUrl')){setCookie('landingUrl',window.location.href);L('init:set landingUrl',window.location.href)}
    if(!getCookie('device')){var d=window.innerWidth<768?'mobile':'desktop';setCookie('device',d);L('init:set device',d)}
    if(!getCookie('firstLandingUrl')){setCookie('firstLandingUrl',window.location.href);L('init:set firstLandingUrl',window.location.href)}
    if(!getCookie('firstLandingUrlDateTime')){var ts=new Date().toISOString();setCookie('firstLandingUrlDateTime',ts);L('init:set firstLandingUrlDateTime',ts)}
    L('init:after',snap());
  }
  function captureFirstClick(linkHref){
    L('captureFirstClick:in',{linkHref:linkHref,hasCookie:!!getCookie('firstClickUrl')});
    if(!getCookie('firstClickUrl')){setCookie('firstClickUrl',linkHref||window.location.href);L('captureFirstClick:set firstClickUrl',getCookie('firstClickUrl'))}
    if(!getCookie('firstClickUrlDateTime')){var ts=new Date().toISOString();setCookie('firstClickUrlDateTime',ts);L('captureFirstClick:set firstClickUrlDateTime',ts)}
    window.dataLayer=window.dataLayer||[];
    var payload={event:'parametros_blog',event_category:'engagement',event_label:window.location.pathname,referrer:readCookieDecoded('referrer'),landing_url:readCookieDecoded('landingUrl'),device:readCookieDecoded('device'),first_click_url:readCookieDecoded('firstClickUrl'),first_click_datetime:getCookie('firstClickUrlDateTime')||'',first_landing_url:readCookieDecoded('firstLandingUrl'),first_landing_datetime:getCookie('firstLandingUrlDateTime')||''};
    window.dataLayer.push(payload);
    L('captureFirstClick:datalayer push',payload);
  }
  function urlBuilder(){
    var params=new URLSearchParams({referrer:readCookieDecoded('referrer'),landingUrl:readCookieDecoded('landingUrl'),dispositivo:readCookieDecoded('device'),firstClickUrl:readCookieDecoded('firstClickUrl'),firstClickUrlDateTime:getCookie('firstClickUrlDateTime')||'',firstLandingUrl:readCookieDecoded('firstLandingUrl'),firstLandingUrlDateTime:getCookie('firstLandingUrlDateTime')||''});
    var final=BASE_URL+'?'+params.toString();
    L('urlBuilder',{params:Object.fromEntries(params.entries()),final:final});
    return final;
  }
  function interceptAndRedirect(linkHref){
    L('interceptAndRedirect:start',{linkHref:linkHref});
    captureFirstClick(linkHref);
    var f=urlBuilder();
    renderDebugUrl(f);
    L('interceptAndRedirect:navigate',f);
    window.location.href=f;
  }
  function renderDebugUrl(u){
    var el=document.getElementById('parameters');if(!el){L('renderDebugUrl:no-parameters-element');return}
    var f=u||urlBuilder();
    el.innerHTML='';
    var p=document.createElement('p');p.textContent='URL de redirecionamento:';var a=document.createElement('a');a.href=f;a.textContent=f;a.rel='noopener noreferrer';a.target='_blank';el.appendChild(p);el.appendChild(a);
    var pre=document.createElement('pre');pre.style.marginTop='10px';pre.textContent=JSON.stringify({referrer:readCookieDecoded('referrer'),landingUrl:readCookieDecoded('landingUrl'),dispositivo:readCookieDecoded('device'),firstClickUrl:readCookieDecoded('firstClickUrl'),firstClickUrlDateTime:getCookie('firstClickUrlDateTime')||'',firstLandingUrl:readCookieDecoded('firstLandingUrl'),firstLandingUrlDateTime:getCookie('firstLandingUrlDateTime')||''},null,2);el.appendChild(pre);
    L('renderDebugUrl:done',{final:f,state:snap()});
  }
  function setupLinkInterceptor(){
    document.addEventListener('click',function(e){
      var link=e.target&&e.target.closest?e.target.closest('a'):null;
      if(!link||!link.href){return}
      var norm=normalizeForMatch(link.href);
      var matches=norm.startsWith(BASE_MATCH);
      L('click',{clicked:link.href,normalized:norm,base:BASE_MATCH,matches:matches});
      if(!matches){return}
      e.preventDefault();
      interceptAndRedirect(link.href);
    },true)
  }
  function migrateDecodingIfNeeded(){
    ['referrer','landingUrl','device','firstLandingUrl','firstClickUrl','firstClickUrlDateTime','firstLandingUrlDateTime'].forEach(function(k){
      var raw=getCookie(k);if(!raw)return;
      var looks=/%[0-9A-Fa-f]{2}/.test(raw)||raw.indexOf('+')!==-1;
      var dec=maybeDecodeURIComponent(raw);
      if(looks||dec!==raw){setCookie(k,dec);L('migrate:normalized',{key:k,from:raw,to:dec})}
    });
    L('migrate:after',snap());
  }
  function boot(){
    L('boot:start',{location:window.location.href,documentReferrer:document.referrer});
    migrateDecodingIfNeeded();
    initCookies();
    setupLinkInterceptor();
    renderDebugUrl();
    L('boot:ready',snap());
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot)}else{boot()}
  window.interceptAndRedirect=interceptAndRedirect;
  window.__urlParamDebug__={urlBuilder:urlBuilder,renderDebugUrl:renderDebugUrl,snap:snap};
})();
