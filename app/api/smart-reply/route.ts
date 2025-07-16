import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  const { lastMessage } = await req.json()

  const result = await generateText({
    model: openai("gpt-4o"),
    prompt: `Generate 3 short, natural reply suggestions (max 10 words each) for this message: "${lastMessage}"
    
    Return only the suggestions, one per line, without numbers or formatting.`,
  })

  const suggestions = result.text
    .split("\n")
    .filter((s) => s.trim())
    .slice(0, 3)

  return Response.json({ suggestions })
}
