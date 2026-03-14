async function testAI() {
  const apiKey = "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";
  const metadata = {
    title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    description: "The official video for Never Gonna Give You Up by Rick Astley.",
    uploader: "Rick Astley"
  };

  const systemPrompt = `You are a knowledge extraction assistant. Respond with valid JSON only.`;
  const userMessage = `Title: ${metadata.title}`;

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
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("AI Error:", err);
  }
}

testAI();
