# LMU Setups Brasil

Site estático em **HTML + CSS + JS** para organizar setups do **Le Mans Ultimate** por **Classe → Carro → Pista**.

## Conteúdo
- Setups abertos com abas:
  - **Qualifying**
  - **Race**
  - **Sprint (20min)**
- Seção de **Setup Fixo** com recomendações por pista para:
  - ABS
  - TC / TC2
  - Brake Bias
  - Engine Map
  - Estratégia de combustível
- Busca, filtros rápidos por classe/pista e cards visuais de carros.
- Tema escuro estilo racing e layout responsivo.

## Como usar
1. Abra `index.html` localmente ou publique no GitHub Pages.
2. Escolha a classe, carro e pista.
3. Alterne entre as abas de setup aberto.
4. Use a tabela de setup fixo para corridas sprint ou endurance.

## Arquivos .svm (placeholders)
Os botões de download geram arquivos `.svm` **placeholder** com instruções.

Como adicionar seus setups reais:
1. Exporte o setup no jogo.
2. Salve no repositório no padrão:
   - `setups/[classe]/[carro]/[pista]/qualifying.svm`
   - `setups/[classe]/[carro]/[pista]/race.svm`
   - `setups/[classe]/[carro]/[pista]/sprint.svm`
3. No arquivo `js/app.js`, atualize os links/fluxo de download para apontar para seus arquivos reais.

## Publicar no GitHub Pages
1. Vá em **Settings → Pages**.
2. Em **Build and deployment**, selecione:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (ou a branch desejada), pasta `/root`
3. Salve e aguarde o link do site ser gerado.
