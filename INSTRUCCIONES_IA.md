 GET /dashboard 200 in 4.3s (compile: 879ms, proxy.ts: 274ms, render: 3.1s)
Error en chatCompletion: Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [404 Not Found] models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
    at handleResponseNotOk (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_ad729a57._.js:1353:11)
    at async makeRequest (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_ad729a57._.js:1325:9)
    at async generateContent (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_ad729a57._.js:1767:22)
    at async ChatSession.sendMessage (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_ad729a57._.js:2137:9)
    at async chatCompletion (src\features\ai\services\groq.ts:136:20)
    at async generateSQLFromNaturalLanguage (src\features\ai\services\groq.ts:254:20)
    at async queryDashboardNaturalLanguage (src\features\ai\actions.ts:206:34)
  134 |
  135 |     const chat = model.startChat({ history })
> 136 |     const result = await chat.sendMessage(userMessage)
      |                    ^
  137 |     const response = result.response
  138 |
  139 |     return response.text() {
  status: 404,
  statusText: 'Not Found',
  errorDetails: undefined
}
Gemini error details: {
  "status": 404,
  "statusText": "Not Found"
}
Dashboard query error: Error [AIServiceError]: Se alcanzó el límite de uso de la IA. Por favor esperá unos minutos antes de intentar de nuevo.
    at parseGeminiError (src\features\ai\services\groq.ts:48:12)
    at chatCompletion (src\features\ai\services\groq.ts:142:11)
    at async generateSQLFromNaturalLanguage (src\features\ai\services\groq.ts:254:20)
    at async queryDashboardNaturalLanguage (src\features\ai\actions.ts:206:34)
  46 |   // Rate limit (429)
  47 |   if (err.status === 429 || errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate')) {
> 48 |     return new AIServiceError(
     |            ^
  49 |       'Se alcanzó el límite de uso de la IA. Por favor esperá unos minutos antes de intentar de nuevo.',
  50 |       'RATE_LIMIT',
  51 |       true, {
  code: 'RATE_LIMIT',
  isRateLimit: true,
  retryAfter: 60
}
uota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit.     
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
Please retry in 56.879509068s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_input_token_count","quotaId":"GenerateContentInputTokensPerModelPerMinute-FreeTier","quotaDimensions":{"location":"global","model":"gemini-2.0-flash"}},{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerMinutePerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-2.0-flash"}},{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-2.0-flash"}}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"56s"}]
    at handleResponseNotOk (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_11b68a13._.js:1530:11)
    at async makeRequest (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_11b68a13._.js:1502:9)
    at async generateContent (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_11b68a13._.js:1944:22)
    at async ChatSession.sendMessage (B:\Suplementos\erp-suplementos\.next\dev\server\chunks\ssr\_11b68a13._.js:2314:9)
    at async chatCompletion (src\features\ai\services\groq.ts:136:20)
    at async sendChatMessage (src\features\ai\actions.ts:56:22)
  134 |
  135 |     const chat = model.startChat({ history })
> 136 |     const result = await chat.sendMessage(userMessage)
      |                    ^
  137 |     const response = result.response
  138 |
  139 |     return response.text() {
  status: 429,
  statusText: 'Too Many Requests',
  errorDetails: [Array]
}
Gemini error details: {
  "status": 429,
  "statusText": "Too Many Requests",
  "errorDetails": [
    {
      "@type": "type.googleapis.com/google.rpc.Help",
      "links": [
        {
          "description": "Learn more about Gemini API quotas",
          "url": "https://ai.google.dev/gemini-api/docs/rate-limits"
        }
      ]
    },
    {
      "@type": "type.googleapis.com/google.rpc.QuotaFailure",
      "violations": [
        {
          "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_input_token_count",
          "quotaId": "GenerateContentInputTokensPerModelPerMinute-FreeTier",
          "quotaDimensions": {
            "location": "global",
            "model": "gemini-2.0-flash"
          }
        },
        {
          "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_requests",
          "quotaId": "GenerateRequestsPerMinutePerProjectPerModel-FreeTier",
          "quotaDimensions": {
            "location": "global",
            "model": "gemini-2.0-flash"
          }
        },
        {
          "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_requests",
          "quotaId": "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
          "quotaDimensions": {
            "location": "global",
            "model": "gemini-2.0-flash"
          }
        }
      ]
    },
    {
      "@type": "type.googleapis.com/google.rpc.RetryInfo",
      "retryDelay": "56s"
    }
  ]
}
Chat error: Error [AIServiceError]: Se alcanzó el límite de uso de la IA. Por favor esperá unos minutos antes de intentar de nuevo.
    at parseGeminiError (src\features\ai\services\groq.ts:56:12)
    at chatCompletion (src\features\ai\services\groq.ts:142:11)
    at async sendChatMessage (src\features\ai\actions.ts:56:22)
  54 |   // Rate limit (429)
  55 |   if (err.status === 429 || errorMessage.includes('429') || errorMessage.includes('quota')) {
> 56 |     return new AIServiceError(
     |            ^
  57 |       'Se alcanzó el límite de uso de la IA. Por favor esperá unos minutos antes de intentar de nuevo.',
  58 |       'RATE_LIMIT',
  59 |       true, {
  code: 'RATE_LIMIT',
  isRateLimit: true,
  retryAfter: 60
}
 POST /dashboard/products 200 in 2.5s (compile: 3ms, proxy.ts: 5ms, render: 2.5s)
