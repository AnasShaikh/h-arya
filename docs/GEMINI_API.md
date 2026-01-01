# Gemini API Reference

## Environment Variable

```
GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Available Models (as of Dec 2024)

Our API key has access to these Gemini models:

| Model | Use Case |
|-------|----------|
| `gemini-2.0-flash` | **Currently used** - Fast, capable, general purpose |
| `gemini-2.0-flash-lite` | Lighter/faster version |
| `gemini-2.5-flash` | Latest flash model |
| `gemini-2.5-pro` | Most capable model |
| `gemini-3-pro-preview` | Preview of next gen |
| `gemini-3-flash-preview` | Preview of next gen flash |

### Text-to-Speech Models

| Model | Use Case |
|-------|----------|
| `gemini-2.5-flash-preview-tts` | Fast TTS |
| `gemini-2.5-pro-preview-tts` | Higher quality TTS |

### Video Generation (Veo)

| Model | Use Case |
|-------|----------|
| `veo-2.0-generate-001` | Veo 2 (requires billing enabled) |
| `veo-3.0-generate-001` | Veo 3 |
| `veo-3.0-fast-generate-001` | Veo 3 Fast |
| `veo-3.1-generate-preview` | Veo 3.1 (latest) |

### Image Generation (Imagen)

| Model | Use Case |
|-------|----------|
| `imagen-4.0-generate-001` | Imagen 4 - Standard |
| `imagen-4.0-ultra-generate-001` | Imagen 4 Ultra - Highest quality |
| `imagen-4.0-fast-generate-001` | Imagen 4 Fast - Quick generation |

### Video/Image Understanding

The multimodal Gemini models (`gemini-2.0-flash`, `gemini-2.5-pro`, etc.) can analyze video and image input natively - just pass media as part of the content.

**Note:** `gemini-pro` and `gemini-1.5-flash` are deprecated and no longer available.

## How to Check Available Models

To see which models your API key has access to:

```bash
# List all models
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"

# Filter for specific types
curl "..." | grep '"name": "models/gemini'   # Gemini models only
curl "..." | grep -i "tts\|speech\|voice"    # TTS models only
```

Or in Node.js:
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
);
const data = await response.json();
data.models.forEach(m => console.log(m.name));
```

## SDK Usage

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Generate content
const result = await model.generateContent({
  contents: [{
    role: 'user',
    parts: [{ text: 'Your prompt here' }]
  }]
});

const response = result.response.text();
```

## Direct API Usage (curl)

```bash
# List available models
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"

# Generate content
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## Troubleshooting

### 404 Model Not Found
If you see `models/xxx is not found for API version v1beta`:
1. The model name is deprecated or invalid
2. Run the list models curl command to see available models
3. Update to a supported model like `gemini-2.0-flash`

### API Key Invalid
1. Verify key is set in `.env` file with correct format: `GEMINI_API_KEY=AIza...`
2. Restart the Next.js dev server after changing `.env`
3. Get a fresh key from [Google AI Studio](https://aistudio.google.com/apikey)
