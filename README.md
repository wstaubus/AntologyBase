# Antology Base 🖋️📖

**Antology Base** é um ambiente profissional completo de escrita criativa, organização de narrativas e gestão de romances desenvolvido para autores, roteiristas e contistas.

---

## 🌟 Principais Funcionalidades

### 1. 📊 Visão Geral (Dashboard)
- **Métricas de Escrita**: Contagem de palavras em tempo real, progresso da meta do livro, tempo estimado de leitura e contagem de capítulos.
- **Dica de Escrita do Dia (Google Search Grounded)**: Widget inteligente com curadoria de técnicas literárias (tensão, ritmo, diálogos, caracterização e worldbuilding) alimentado por pesquisa e citações web verificadas em tempo real.
- **Linha do Tempo e Atos**: Acompanhamento dos 3 atos narrativos (Apresentação, Confrontação e Resolução).
- **Atalhos Rápidos**: Acesso direto para adicionar capítulos, personagens e locais.

### 2. ✍️ Estúdio de Escrita (Writing Studio)
- **Editor Rico & Distraction-Free**: Suporte a formatação com atalhos de teclado (negrito, itálico, cabeçalhos, listas, citações, diálogos).
- **Modo Foco (Zen)**: Esconda barras laterais e menus para concentração total.
- **Storyboard / Quadro de Cenas**: Visualize todos os capítulos e cenas em formato de cards interativos.
- **Metas de Sessão & Pomodoro**: Cronômetro de escrita integrado com contador de palavras por sessão.
- **Dicionário & Sinônimos**: Consulta de definições e alternativas lexicais diretamente no estúdio.

### 3. 👥 Gestão de Personagens (Dramatis Personae)
- **Fichas Detalhadas**: Arquétipos, papéis dramáticos (protagonista, antagonista, coadjuvante), traços de personalidade, motivações e segredos.
- **Galeria Visual & Filtros**: Busca dinâmica e categorização rápida de personagens.

### 4. 🌍 Construção de Mundo (Worldbuilding)
- **Enciclopédia de Cenários e Conceitos**: Registro de locais, reinos, facções, regras mágicas e eventos históricos.
- **Galeria de Cenários**: Destaques visuais e notas detalhadas de ambientação.

### 5. 🛠️ Ferramentas Auxiliares
- **Gerador de Nomes**: Sugestões de nomes por gênero narrativo (Fantasia, Sci-Fi, Histórico, Contemporâneo).
- **Exportação Flexível**: Exporte o manuscrito completo em **PDF Diagramado** (com diagramação A4, recuo clássico de parágrafos, cabeçalhos e numeração de páginas), **Markdown (.md)**, **Texto Puro (.txt)** ou **JSON Estruturado**.
- **Histórico & Snapshots**: Pontos de restauração para recuperar versões anteriores do projeto.
- **Temas Diurno & Noturno**: Alternância de modo escuro/claro acessível pelo menu lateral.

---

## 🚀 Tecnologias Utilizadas

- **React 19** com **TypeScript**
- **jsPDF** para geração e diagramação de manuscritos em PDF
- **Tailwind CSS v4** para estilização moderna e responsiva
- **Motion (`motion/react`)** para transições e animações fluidas
- **Vite** para compilação rápida e ambiente de desenvolvimento ágil
- **Lucide Icons & Material Symbols** para iconografia

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Gerenciador de pacotes `npm` ou `bun`

### Instalação

```bash
# Instalar as dependências
npm install
```

### Modo de Desenvolvimento

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

O aplicativo estará acessível em `http://localhost:3000`.

### Build de Produção

```bash
# Compilar para produção
npm run build
```

---

## 📁 Estrutura do Projeto

```text
├── public/                # Recursos estáticos
├── src/
│   ├── components/        # Componentes visuais e módulos da interface
│   │   ├── CharactersView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ExportModal.tsx
│   │   ├── HistoryModal.tsx
│   │   ├── NameGeneratorModal.tsx
│   │   ├── NewChapterModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── ShareModal.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SyncModal.tsx
│   │   ├── TopHeader.tsx
│   │   ├── WorldView.tsx
│   │   └── WritingStudioView.tsx
│   ├── types/             # Definições de tipos TypeScript
│   ├── App.tsx            # Componente raiz e gerenciamento de estado global
│   ├── index.css          # Estilos globais e Tailwind CSS
│   └── main.tsx           # Ponto de entrada React
├── metadata.json          # Metadados do aplicativo
├── package.json           # Dependências e scripts
└── vite.config.ts         # Configuração do Vite
```
