# LIT Coimbra

CMS e site público da discoteca LIT Coimbra, construído em Next.js 16 (App Router) + React 19 + Prisma 7 + PostgreSQL. Inclui um construtor visual de páginas inspirado no WordPress / Elementor, gestão de eventos, galerias, reservas VIP e formulário de contacto.

## Stack

- **Frontend / SSR**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Base de dados**: PostgreSQL via Prisma 7
- **Auth**: NextAuth (Credentials)
- **Editor rich-text**: TipTap
- **Drag-and-drop**: @dnd-kit
- **Email**: Resend
- **Deploy**: Docker (multi-stage) + Portainer

## Funcionalidades

### Site público (PT/EN)
- Homepage composta a partir de secções editáveis (hero, eventos, galeria, contacto, etc.)
- Páginas dinâmicas em `/p/[slug]` para conteúdos criados no admin
- Eventos com filtros por tipo/data, lineup, imagem destacada
- Galerias por evento ou data, lightbox de fotos
- Reservas VIP com formulário e gestão de estado
- Mapa, contactos, redes sociais e horários configuráveis
- Bilingue (PT/EN) com kill-switch global e cookie de locale
- SEO: metadata dinâmica, Open Graph, sitemap, schema.org `NightClub`
- PWA + service worker

### Painel de administração (`/admin`)
- **Editor Visual** (`/admin/editor`)
  - **Tema & Cores** (`/tema`) — cores, tipografia, efeitos
  - **Elementos Visuais** (`/elementos`) — tokens globais para botões (3 variantes), cartões e formulários, com pré-visualização ao vivo
  - **Páginas** (`/admin/paginas`) — CRUD de páginas com slug, navegação, publicação
  - **Secções** (`/seccoes`) — construtor drag-and-drop por página, com 30+ tipos de secção
  - **Branding** — favicon e logo
  - **Biblioteca de Media** — uploads centralizados
- **Gestão**: Eventos · Galerias · Reservas · Mensagens · Utilizadores · Logs · Definições

### Tipos de secção disponíveis
Hero, Page Header, Texto, Imagem (galeria), CTA, Divisor, Espaçador, Embed, Colunas, Testemunhos, Countdown, Hero Homepage, Próximo Evento, Pré-visualização/Grelha de Eventos, Pré-visualização/Grelha de Galerias, CTA/Info/Form/Mapa de Contacto, Formulário de Reservas, Cartões Informativos, Cabeçalho, Caixa de Ícones, Acordeão/FAQ, Estatísticas (contadores animados), **Separadores (tabs), Tabela de Preços, Grupo de Botões, Logos / Parceiros**.

Cada secção suporta:
- Bilingue (PT/EN)
- Painel "Avançado" (background image/vídeo/overlay, animação de entrada, delay, anchor `id`, classes CSS, visibilidade por breakpoint)
- Duplicação rápida e reordenação por drag-and-drop
- On-demand revalidation — alterações no admin propagam imediatamente para o site público

## Setup local

### Requisitos
- Node 20+
- PostgreSQL 16 (ou via `docker compose`)

### Instalação

```bash
npm install
cp .env.example .env   # configurar DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY...
npx prisma migrate deploy
npx prisma db seed     # cria utilizador admin e definições iniciais
npm run dev
```

Site em [http://localhost:3000](http://localhost:3000), painel em [/admin](http://localhost:3000/admin).

### Docker

```bash
docker compose up -d
```

Inclui PostgreSQL com volume persistente e volume `uploads` para imagens carregadas.

## Scripts

```bash
npm run dev              # dev server (Turbopack)
npm run build            # build de produção
npm run start            # serve build
npx tsc --noEmit         # typecheck
npm run db:studio        # GUI da DB
npm run db:seed          # seed inicial (idempotente — só cria secções em páginas vazias)
npm run db:reseed-pages  # RESET destrutivo das páginas de sistema para os layouts default
```

### Reseed das páginas de sistema

O `db:seed` só insere secções default em páginas que ainda estão vazias — instalações existentes mantêm o conteúdo editado. Para forçar as páginas de sistema (`homepage`, `eventos`, `galeria`, `reservas`, `sobre`, `contacto`) a voltar aos layouts default:

```bash
npm run db:reseed-pages                       # todas as páginas de sistema
npx tsx prisma/reseed-system-pages.ts --only=homepage,sobre
npx tsx prisma/reseed-system-pages.ts --dry-run
```

> ⚠️ Apaga todas as secções dessas páginas antes de recriar. Usar apenas após push de novos layouts.

## Estrutura

```
src/
├── app/
│   ├── (rotas públicas)         # /, /eventos, /galeria, /reservas, /sobre, /contacto, /p/[slug]
│   ├── admin/                   # painel completo
│   │   ├── editor/              # tema, elementos, secções, branding, media
│   │   ├── paginas/             # CRUD páginas
│   │   ├── eventos/, galeria/, reservas/, mensagens/, utilizadores/, logs/, definicoes/
│   └── api/                     # routes para sections, pages, theme, settings, events, ...
├── components/
│   ├── sections/                # SectionRenderer + 30+ secções (server + client)
│   ├── admin/                   # Sidebar, RichTextEditor, MediaPicker, ...
│   ├── home/, layout/, ui/, forms/
└── lib/                         # prisma, auth, settings, revalidate, i18n, ...
```

## Deploy

Construído para correr atrás de Portainer no servidor da LIT. Ver `Dockerfile` e `docker-compose.yml`. As variáveis `DATABASE_URL`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL` têm de ser definidas no ambiente.
