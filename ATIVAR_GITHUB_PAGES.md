# 🌐 ATIVAR GITHUB PAGES - BRANCH HML

## 🎯 **OBJETIVO**
Ativar o GitHub Pages para a branch `hml` para que os testes possam ser executados online sem gastar sua VPS.

## 📋 **PASSOS PARA ATIVAR**

### 1. **Acessar Configurações do Repositório**
1. Vá para: `https://github.com/luisabwk/urlParam`
2. Clique na aba **Settings** (Configurações)
3. No menu lateral esquerdo, clique em **Pages**

### 2. **Configurar GitHub Pages**
1. Em **Source** (Origem), selecione **Deploy from a branch**
2. Em **Branch**, selecione **hml**
3. Em **Folder**, deixe **/(root)**
4. Clique em **Save**

### 3. **Verificar Deploy**
- O GitHub Actions irá executar automaticamente
- Aguarde alguns minutos para o deploy
- A URL será: `https://luisabwk.github.io/urlParam/`

## 🧪 **COMO TESTAR APÓS ATIVAÇÃO**

### **Teste 1: Verificar Funcionamento Básico**
1. Acesse a URL do GitHub Pages
2. Abra o DevTools (F12)
3. Verifique se aparecem as mensagens:
   ```
   Trinks Debug: Script carregado e funcionando
   Trinks Debug: DOM carregado, inicializando...
   ```

### **Teste 2: Verificar Captura de Cookies**
1. Recarregue a página
2. No DevTools > Application > Cookies
3. Verifique se os cookies foram criados:
   - `referrer`
   - `landingUrl`
   - `device`
   - `firstLandingUrl`
   - `firstLandingUrlDateTime`

### **Teste 3: Verificar Envio para GTM**
1. Clique em um link que deveria ser interceptado
2. Verifique no console se aparecem as mensagens:
   ```
   Trinks Debug: Link interceptado! Executando redirecionamento...
   Trinks Debug: Evento enviado para GTM: {...}
   ```

## 🔧 **CONFIGURAÇÕES AUTOMÁTICAS**

### **GitHub Actions**
- ✅ Workflow de testes configurado
- ✅ Deploy automático no GitHub Pages
- ✅ Executa a cada push na branch `hml`

### **Scripts NPM**
- ✅ `npm test` - Executa testes de sintaxe
- ✅ `npm run build` - Prepara arquivos para deploy
- ✅ `npm run deploy:preview` - Preview local do deploy

## 📊 **MONITORAMENTO**

### **Status do Deploy**
- Verifique a aba **Actions** no GitHub
- Cada push na branch `hml` dispara o workflow
- Logs detalhados de cada etapa

### **URLs Importantes**
- **Repositório**: `https://github.com/luisabwk/urlParam`
- **GitHub Pages**: `https://luisabwk.github.io/urlParam/`
- **Actions**: `https://github.com/luisabwk/urlParam/actions`

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Se o GitHub Pages não funcionar:**
1. Verifique se a branch `hml` foi selecionada
2. Aguarde alguns minutos para o primeiro deploy
3. Verifique os logs na aba Actions

### **Se os testes falharem:**
1. Verifique os logs do workflow
2. Execute `npm test` localmente
3. Verifique se todos os arquivos estão corretos

## 🎉 **RESULTADO ESPERADO**

Após a ativação, você terá:
- ✅ **Testes automáticos** a cada push
- ✅ **Deploy automático** no GitHub Pages
- ✅ **URL pública** para testes sem gastar VPS
- ✅ **Monitoramento completo** via GitHub Actions

---

**Status**: ⏳ Aguardando ativação manual do GitHub Pages  
**Próximo passo**: Ativar GitHub Pages nas configurações do repositório
