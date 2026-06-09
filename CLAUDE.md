# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Chat Assistant** (聊天助手) - a Next.js 15 application that analyzes chat screenshots using AI. Users upload screenshots of WeChat or Telegram conversations, and the app extracts text via OCR (Google Vision API), then uses LLM to analyze sentiment, suggest replies, and identify potential risks.

## Tech Stack

- **Framework**: Next.js 16 with App Router + Turbopack
- **Language**: TypeScript (strict mode)
- **Database**: lowdb JSON file storage
- **Storage**: localStorage (client-side) + lowdb (server-side)
- **Styling**: Tailwind CSS 3 + shadcn/ui + Radix UI
- **AI**: Claude API (Anthropic) or OpenAI API
- **OCR**: Google Cloud Vision API
- **Testing**: Vitest + React Testing Library + MSW
- **Package Manager**: npm

## Key Commands

```bash
# Development
npm run dev              # Start dev server (requires ./start.sh setup first)
./start.sh               # Create .env.local template and start dev server

# Production
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage report

# Docker
docker compose up --build -d   # Build and start containers
docker compose down            # Stop containers
```

## Architecture

### Two Storage Layers

The app uses a **hybrid storage pattern**:

1. **Client-side (localStorage)**: Stores workspaces and messages in the browser via `lib/storage.ts`. Used for persistence across page refreshes.

2. **Server-side (lowdb)**: lowdb JSON database (`data/chat.json`) stores messages and config via `lib/db.ts`.

**Important**: These two storage systems are **not synchronized**. The client storage is the primary source of truth for the UI, while server lowdb storage is used for API operations (messages CRUD, data export).

### App Router Structure

```
app/
├── layout.tsx          # Root layout with font config (Geist)
├── page.tsx            # Main page - renders ChatAssistant component
└── api/
    ├── messages/route.ts           # GET/POST messages (lowdb)
    ├── workspaces/route.ts         # GET workspaces (lowdb)
    ├── analyze/route.ts            # POST full analysis (OpenAI)
    ├── analyze-stream/route.ts     # POST streaming analysis (SSE)
    ├── regenerate-replies/route.ts # POST regenerate replies only
    ├── extract-from-screenshot/route.ts  # POST OCR + text extraction
    └── data/route.ts               # GET export / DELETE reset data
```

### Component Architecture

```
components/
├── ChatAssistant.tsx       # Root component - manages state, orchestrates flow
├── ChatArea.tsx            # Chat message display and input
├── WorkspacePanel.tsx      # Left sidebar - workspace list + message input
├── WorkspaceSwitcher.tsx   # Workspace selector dropdown
├── ScreenshotUploader.tsx  # File upload + drag-and-drop
├── MessageBubble.tsx       # Individual message display
├── AnalysisCard.tsx        # AI analysis results display
├── ExtractedMessages.tsx   # OCR extracted messages preview
├── ReplySuggestions.tsx    # AI-generated reply suggestions
└── ReasoningDisplay.tsx    # AI reasoning/thinking display
```

### AI Pipeline

The analysis flow is:

1. **Screenshot Upload** → `POST /api/extract-from-screenshot`
   - Google Vision OCR → raw text
   - LLM parsing → structured messages (date, sender, content)
   - Saves to lowdb

2. **Chat Analysis** → `POST /api/analyze` or `POST /api/analyze-stream`
   - Input: messages array + context (platform, relationship)
   - LLM generates: sentiment analysis, risk assessment, reply suggestions
   - Prompt templates in `lib/prompt.ts`

3. **Reply Regeneration** → `POST /api/regenerate-replies`
   - Re-runs only the reply suggestion generation

### Environment Variables

Create `.env.local` (run `./start.sh` to auto-generate template):

```bash
# LLM Provider (choose one)
ANTHROPIC_API_KEY=your_claude_api_key    # For Claude
OPENAI_API_KEY=your_openai_api_key      # For OpenAI

# OCR
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Optional
OPENAI_MODEL=deepseek-chat              # Custom model name
OPENAI_BASE_URL=https://custom-api.com/v1  # Custom API endpoint
```

## Common Patterns

### Database Access (lowdb)

The lowdb connection is managed as a singleton promise in `lib/db.ts`:

```typescript
import { loadFullData } from '@/lib/db';

const data = await loadFullData();
```

### Client Storage

```typescript
import { storage } from '@/lib/storage';

const workspaces = storage.getWorkspaces();
const messages = storage.getMessages(chatId);
storage.addMessage(chatId, message);
```

### Prompt Templates

All LLM prompts are in `lib/prompt.ts` as template functions:

```typescript
import { buildAnalyzePrompt, buildExtractPrompt } from '@/lib/prompts';
```

### shadcn/ui Components

UI components are in `components/ui/` (auto-generated by shadcn). To add new components:

```bash
npx shadcn@latest add button  # Example: add button component
```

## Testing

Tests use **Vitest** with **jsdom** environment and **MSW** for API mocking.

### Test Structure

```
tests/
├── setup.ts                          # Global test setup (MSW, localStorage mock)
├── mocks/
│   └── handlers.ts                   # MSW request handlers
├── api/                              # API route tests
│   ├── analyze.test.ts
│   ├── analyze-stream.test.ts
│   ├── extract-from-screenshot.test.ts
│   └── regenerate-replies.test.ts
├── components/                       # Component tests
│   ├── workspace-panel.test.tsx
│   └── chat-flow.test.tsx
├── lib/                              # Library tests
│   ├── ai.test.ts
│   ├── prompt.test.ts
│   └── storage.test.ts
└── scaffold.test.ts                  # Project structure verification
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Tests auto-reset localStorage via setup.ts beforeEach hook
describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### Test Helpers

- `renderWithProviders()` - wraps component with necessary providers
- `createMockChat()` - creates test chat data
- `waitForAnalysis()` - waits for async analysis to complete
- `mockAnalysisResponse()` - creates mock API response

## Key Files

- `app/page.tsx` - Entry point, renders ChatAssistant
- `components/ChatAssistant.tsx` - Main state management and business logic
- `lib/db.ts` - lowdb connection and persistence helpers
- `lib/storage.ts` - Client-side localStorage operations
- `lib/ai.ts` - LLM API client (supports Claude and OpenAI)
- `lib/prompt.ts` - All prompt templates for AI analysis
- `lib/types.ts` - TypeScript type definitions
- `app/api/extract-from-screenshot/route.ts` - OCR pipeline
- `app/api/analyze/route.ts` - Main analysis endpoint
- `app/api/analyze-stream/route.ts` - Streaming analysis (SSE)
- `vitest.config.ts` - Test configuration

## Development Notes

- The lowdb database file is at `data/chat.json` (gitignored)
- The `.next/` directory contains build artifacts (gitignored)
- CSS uses Tailwind v3 with `@tailwind` directives in `app/globals.css`
- shadcn components are configured in `components.json`
- The app supports both Chinese and English UI text
- Turbopack is used for development (faster HMR), Webpack for production builds
- lowdb stores server-side data as JSON in the `data/` directory
