# YouTube to Mindmap

Paste a YouTube link, get an interactive mindmap. Uses the video's transcript + an LLM to generate a structured markdown outline, then renders it as a pannable/zoomable mindmap using [markmap](https://github.com/markmap/markmap).

## How it works

1. You paste a YouTube URL
2. The server fetches the video's transcript (captions)
3. The transcript is sent to GPT-4o (via OpenRouter) which produces a structured markdown outline
4. The client renders the markdown as an interactive SVG mindmap using markmap

## Tech stack

- **Next.js 15** (App Router)
- **Bun** (runtime + package manager)
- **Vercel AI SDK** + **OpenRouter** (LLM access via single API key)
- **youtube-transcript-plus** (transcript fetching)
- **markmap-lib** + **markmap-view** (markdown to interactive mindmap)
- **shadcn/ui** + **Tailwind CSS v4** (UI components + styling)

## Setup

```bash
# install dependencies
bun install

# add your OpenRouter API key
cp .env.example .env
# edit .env and set OPENROUTER_API_KEY

# run dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your [OpenRouter](https://openrouter.ai/) API key |

## Project structure

```
app/
  layout.tsx              Root layout
  page.tsx                Main page (URL input + mindmap viewer)
  globals.css             Tailwind + markmap style overrides
  api/generate/route.ts   POST endpoint: YouTube URL -> markdown
components/
  url-input.tsx           YouTube URL input form
  mindmap-viewer.tsx      Markmap SVG rendering (client component)
  ui/                     shadcn components
lib/
  youtube.ts              Video ID extraction + transcript fetching
  ai.ts                   OpenRouter LLM call (generateText)
  utils.ts                cn() helper
```

## Limitations

- Only works with videos that have captions/subtitles (auto-generated or manual)
- Very long videos may hit LLM token limits
- Transcript quality depends on YouTube's auto-captions
