# LMU Setups Brasil

Frontend moderno em **React + Vite + TypeScript** com build estático para GitHub Pages.

## Recursos
- Organização por **Classe → Carro → Pista → (Qualifying/Race/Sprint)**.
- Seção de **Fixed Setup** com recomendações para sprint e endurance.
- Novo modelo de tração na UI: **TC Modo, TC Slip e TC Cut** (sem TC/TC2).
- Visual premium mobile-first: header fixo, cards, transições e expand/collapse.
- Download de `.svm` placeholder mantendo compatibilidade de estrutura.

## Scripts
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Estrutura `.svm`
Use o padrão:

`setups/[classe]/[carro]/[pista]/(qualifying|race|sprint).svm`

Os downloads da interface geram placeholders com esse caminho sugerido para facilitar a migração para arquivos reais.

## Deploy no GitHub Pages
Este repositório inclui workflow em `.github/workflows/deploy-pages.yml`.

Pré-requisitos:
1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push na branch principal (ou execute workflow manualmente).

O workflow faz:
1. `npm ci`
2. `npm run build`
3. upload de `dist/`
4. deploy automático no GitHub Pages
