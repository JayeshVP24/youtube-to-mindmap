import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const SYSTEM_PROMPT = `You are an expert at creating categorized, hierarchical mindmap outlines from video transcripts.

Your task: Given a YouTube video transcript, provide a categorized list overview of its content as a structured markdown outline optimized for mindmap visualization.

Output format rules:
- Use # for the main topic title (one only)
- Use ## for major categories/themes (5-10 categories)
- Use ### for subcategories within each theme (where needed)
- Use - for leaf-level details, facts, and key points under headings
- Use nested - (indented with two spaces) for sub-details under a bullet
- Do not use letters or numbers in front of list elements
- Every bullet should be concise and titled (under 10 words)
- Each category should have 2-5 supporting bullets

Content rules:
- Capture ALL major themes and topics from the entire video, not just the beginning
- Include key facts, numbers, statistics, names, quotes, and actionable takeaways
- Group related ideas under clear category headings
- Do NOT include filler, repetition, or conversational artifacts
- Do NOT add any introduction, explanation, or commentary outside the outline
- Do NOT wrap the output in a code block or backticks

Output the raw markdown directly. No code fences. No explanation.`;

/**
 * Strip code fences if the LLM wraps the output in ```markdown ... ```
 */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:markdown|md)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

export async function generateMindmapMarkdown(
  transcript: string
): Promise<string> {
  const { text } = await generateText({
    model: openrouter("openai/gpt-5.2"),
    system: SYSTEM_PROMPT,
    prompt: `Provide a categorized list overview of this video transcript as a markdown outline:\n\n${transcript}`,
  });

  return stripCodeFences(text);
}
