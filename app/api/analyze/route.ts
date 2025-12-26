import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return Response.json(
        {
          error:
            "Missing Google Gemini API Key. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables in the Vars section of the sidebar.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] API key exists:", !!apiKey)
    console.log("[v0] API key length:", apiKey?.length || 0)

    const genAI = new GoogleGenerativeAI(apiKey)

    const { content } = await req.json()

    if (!content) {
      return Response.json({ error: "No content provided" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Generate simplified explanation
    const simplificationPrompt = `You are a legal literacy assistant. Your job is to translate complex legal documents into plain English that anyone can understand.

Analyze this legal document and provide:
1. A clear, simplified explanation in plain English (2-3 paragraphs)
2. 4-6 key points that highlight the most important information

Document:
${content}

Respond in the following JSON format:
{
  "simplifiedText": "Your plain English explanation here...",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"]
}`

    const simplificationResult = await model.generateContent(simplificationPrompt)
    const simplificationText = simplificationResult.response.text()

    // Parse the AI response
    let analysisData
    try {
      // Extract JSON from the response
      const jsonMatch = simplificationText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if JSON extraction fails
        analysisData = {
          simplifiedText: simplificationText,
          keyPoints: ["Analysis generated successfully"],
        }
      }
    } catch (parseError) {
      analysisData = {
        simplifiedText: simplificationText,
        keyPoints: ["Analysis generated successfully"],
      }
    }

    // Generate masked version
    const maskingPrompt = `Mask all personally identifiable information (PII) in this legal document. Replace names with [NAME], addresses with [ADDRESS], phone numbers with [PHONE], email addresses with [EMAIL], dates of birth with [DOB], social security numbers with [SSN], and account numbers with [ACCOUNT].

Document:
${content}

Return only the masked document text, no explanation.`

    const maskingResult = await model.generateContent(maskingPrompt)
    const maskedText = maskingResult.response.text()

    return Response.json({
      simplifiedText: analysisData.simplifiedText,
      keyPoints: analysisData.keyPoints,
      maskedText: maskedText,
    })
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze document. Please check that your GOOGLE_GENERATIVE_AI_API_KEY is valid and has the Generative Language API enabled.",
      },
      { status: 500 },
    )
  }
}
