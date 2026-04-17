# LMU Setups Brasil

Site estático em **Vanilla JS + Tailwind CSS (CDN)** com foco em setups do **Le Mans Ultimate** por **Classe → Carro → Pista**.

> Observação: o uso de Tailwind via CDN foi mantido para simplificar o deploy estático no GitHub Pages sem pipeline de build.

## Conteúdo
- Setups abertos com abas:
  - **Qualifying**
  - **Race**
  - **Sprint (20min)**
- Seção de **Setup Fixo** com recomendações por pista para:
  - ABS
  - **TC / TC Power Cut / TC Slip** (somente os controles disponíveis para o carro)
  - Brake Bias
  - Engine Map
  - Estratégia de combustível
- Busca, filtros rápidos por classe/pista e cards visuais de carros.
- Tema escuro premium, layout responsivo mobile-first e transições suaves.
- Todos os carros e as 18 pistas listadas no escopo do projeto.

## Rodar localmente
Como é um site estático, basta abrir `index.html`.

Opcional (servidor local):
```bash
python -m http.server 4173
```
Depois acesse `http://localhost:4173`.

## Arquivos .svm (placeholders)
Os botões de download geram arquivos `.svm` **placeholder** com instruções.

Como adicionar seus setups reais:
1. Exporte o setup no jogo.
2. Salve no repositório no padrão:
   - `setups/[classe]/[carro]/[pista]/qualifying.svm`
   - `setups/[classe]/[carro]/[pista]/race.svm`
   - `setups/[classe]/[carro]/[pista]/sprint.svm`
3. No arquivo `js/app.js`, atualize o fluxo de download para apontar para os arquivos reais.

## Build e deploy no GitHub Pages
Não há etapa de build obrigatória (arquivos estáticos na raiz).

1. Vá em **Settings → Pages**.
2. Em **Build and deployment**, selecione:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (ou a branch desejada), pasta `/ (root)`
3. Salve e aguarde o link do site ser gerado.

Se preferir publicar via `/docs`, mova `index.html`, `css/` e `js/` para a pasta `docs/` e selecione `/docs` no Pages.
