const { extractKnowledgeFromMetadata } = require('./src/lib/openrouter');
// Note: We need to handle the fact that openrouter.ts might use ESM/TS.
// Actually, I'll just write a standalone script that does the fetch manually 
// to verify the prompt and API key.

async function testAI() {
  const apiKey = "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";
  const metadata = {
    title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    description: "The official video for Never Gonna Give You Up by Rick Astley. Taken from the album Whenever You Need Somebody.",
    uploader: "Rick Astley"
  };

  console.log("Testing AI Metadata Fallback...");
  
  const systemPrompt = `You are a knowledge extraction assistant. You only have the video title and description, not the full transcript. 
Extract as much structured knowledge as possible based ON THE METADATA PROVIDED.
If the description is generic, do your best to infer the main idea.

Respond with valid JSON only:
{
  "title": "the video title or a refined version",
  "mainIdea": "one sentence describing the core concept based on metadata",
  "keyPoints": ["best guess at key insight 1"],
  "actionableTips": ["general advice related to the topic"],
  "toolsConcepts": ["tools or concepts mentioned in title/desc"],
  "shortExplanation": "2-3 sentence explanation based on what is known",
  "tags": ["tag1", "tag2"]
}

Guidelines:
- Acknowledge that this is an AI-generated summary from metadata.
- Be honest about the depth of information available.`;

  const userMessage = `Title: ${metadata.title}\nDescription: ${metadata.description}\nUploader: ${metadata.uploader}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    console.log("AI Response:");
    console.log(JSON.stringify(data.choices?.[0]?.message?.content, null, 2));
  } catch (err) {
    console.error("AI Error:", err);
  }
}

testAI();
