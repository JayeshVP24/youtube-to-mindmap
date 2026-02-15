import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const SYSTEM_PROMPT = `You are an expert at analyzing video transcripts and creating structured hierarchical summaries as markdown outlines for mindmap visualization.

Given a YouTube video transcript, create a structured markdown outline that captures the key topics, subtopics, and important details.

Rules:
- Use markdown headings (# ## ### ####) to create hierarchy
- The top-level # heading should be the main topic/title of the video
- Use 2-4 levels of depth depending on content complexity
- Use bullet points (- ) for leaf-level details under headings
- Keep each bullet point concise (under 10 words)
- Capture 5-10 main topics from the video
- Include key facts, numbers, names, and takeaways
- Do NOT include filler, repetition, or conversational artifacts like "um", "uh", "you know"
- Do NOT add any introduction, explanation, or commentary
- Output ONLY the markdown outline, nothing else`;

export async function generateMindmapMarkdown(
  transcript: string
): Promise<string> {
  const { text } = await generateText({
    model: openrouter("openai/gpt-5.2"),
    system: SYSTEM_PROMPT,
    prompt: `Create a structured markdown mindmap outline from this video transcript:\n\n${transcript}`,
  });

  return text;
}
