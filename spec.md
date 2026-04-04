# SiteForge

## Current State

The Visual Site Builder (`BuilderPage.tsx`) has an AI panel with two sub-modes:
- **Search mode**: Filters 10+ pre-built templates by keyword and applies them to the canvas.
- **Chat mode**: A simulated AI chat using a local `getAiResponse()` function (pure keyword-matching, ~600ms fake delay). No real AI API is called anywhere in the builder.

The `AiChatPanel` component (lines 4584–4971) uses `sendMessage` which calls `getAiResponse()` synchronously with a `setTimeout`, then applies hardcoded template blocks based on pattern matching.

## Requested Changes (Diff)

### Add
- Real AI integration in the Chat mode of `AiChatPanel` using Google Gemini (via the `@google/generative-ai` SDK available in the browser, or a direct `fetch` to the Gemini REST API)
- The AI receives the user's prompt and generates a full website layout by returning a JSON array of block configurations matching the existing block types (hero, features, text, image, button, etc.)
- A system prompt that instructs the AI about the available block types and their properties, so it can construct real website layouts
- Loading/streaming indicator while AI is generating
- Graceful fallback to the existing keyword-matching logic if the AI call fails
- A visible "Powered by Gemini AI" label in the chat panel to show it's a real AI

### Modify
- `sendMessage` in `AiChatPanel`: replace the `setTimeout + getAiResponse()` pattern with an async `fetch` to Gemini REST API, parse the JSON block array from the response, and call `onSetBlocks` with the generated blocks
- The AI chat greeting message to reflect that it's now powered by a real AI
- Quick chip suggestions to better match what the AI can handle

### Remove
- The fake 600ms `setTimeout` delay for AI responses (replaced by actual async API call)

## Implementation Plan

1. Add a `GEMINI_API_KEY` constant (using the free public Gemini API) and a `callGeminiAI` async function in `BuilderPage.tsx`
2. Build a system prompt that describes all available block types (hero, features, text-content, image-text, cta, testimonials, pricing, faq, footer, gallery, team, contact-form, video-embed, map-embed, countdown, accordion, icon-text, social-links, stats, banner, pull-quote, code-snippet, rich-text, spacer) and their key properties
3. The AI returns a JSON array of blocks; parse it and call `onSetBlocks` to apply the generated layout
4. Update `sendMessage` to be async, show a real typing indicator, call `callGeminiAI`, and handle errors with a fallback to `getAiResponse()`
5. Add a "Powered by Gemini AI ✨" badge in the chat panel header
6. Update the chat panel greeting text to reflect real AI capability
