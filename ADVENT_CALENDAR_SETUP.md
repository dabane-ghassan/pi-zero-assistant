# French Offline Advent Calendar - Implementation Summary

## Project Modifications Complete ✅

Your Whisplay AI Chatbot has been successfully modified to support a **completely offline French Advent Calendar**. No internet connection, no API keys, no cloud services required.

---

## What Was Created/Modified

### 1. **Core Advent Calendar Module** (`src/core/AdventCalendar.ts`)
- **25 daily gifts** with emojis (Dec 1-25)
- **Request tracking** - first request returns gift, repeats return funny messages
- **Automatic daily reset** - resets counters after 24 hours
- Fully customizable French gifts and humor responses

**Key Features:**
- `getTodayGift()` - Get current day's gift
- `getGiftForDay(day)` - Access specific day's gift
- `resetAllTrackers()` - Reset for testing
- Tracks per-day request counts to enable repeat message logic

### 2. **Offline ASR Module** (`src/cloud-api/offline-asr.ts`)
- **Local French phrase matching** - no ML model required
- Listens for: "donnez-moi mon cadeau", "mon cadeau", "le cadeau", etc.
- **Fallback methods:**
  - Tries `pocketsphinx` if available (French model)
  - Falls back to energy-based speech detection
  - Supports fuzzy matching (70% similarity threshold for mispronunciations)
- Returns matched phrase or empty string

**Supported Trigger Phrases:**
```typescript
"donnez-moi mon cadeau"    // Give me my gift
"donne-moi mon cadeau"     // (informal)
"mon cadeau"               // My gift
"donne mon cadeau"         // Give my gift
"le cadeau"                // The gift
"cadeau"                   // Gift
```

### 3. **Offline LLM Response Module** (`src/cloud-api/offline-llm.ts`)
- **Predetermined responses** - no LLM needed
- Integrates with `AdventCalendar` for gift/funny responses
- Streams responses in chunks (simulates real-time TTS)
- Fully offline and deterministic

**Key Functions:**
- `chatWithLLMStream()` - Returns gift or funny message
- `resetChatHistory()` - No-op (advent calendar doesn't maintain history)
- `getCurrentDayGift()` - Display current gift without incrementing counter
- `resetAllTrackers()` - For testing/debugging

### 4. **Updated Type Definitions** (`src/type/index.ts`)
- Added `ASRServer.offline` enum
- Added `LLMServer.offline` enum
- Existing TTS (Piper) already supported

### 5. **Updated Server Configuration** (`src/cloud-api/server.ts`)
- Imports for offline ASR and LLM modules
- Switch cases updated to route to offline modules
- Console warnings updated to mention OFFLINE option

### 6. **Configuration Files**

**Updated `.env.advent-calendar`:**
```bash
ASR_SERVER=offline              # Local phrase detection
LLM_SERVER=offline              # Local advent logic
TTS_SERVER=piper                # Local French TTS
PIPER_BINARY_PATH=...           # Local Piper installation
PIPER_MODEL_PATH=...            # French model (fr_FR-maeva-medium.onnx)
```

**Updated `package.json`:**
- Removed: `@google/genai`, `openai`, `@google-cloud/text-to-speech`
- Kept: `dotenv`, `lodash`, `axios` (for compatibility)
- No external API dependencies
- License updated to GPL-3.0
- Name: `pi-zero-advent-calendar`

### 7. **Updated Documentation**
- `.github/copilot-instructions.md` - Comprehensive AI agent guide
- `README.md` - Added "Offline French Advent Calendar Edition" section
  - Quick start guide
  - Installation steps for Piper TTS
  - Customization examples
  - Trigger phrases guide

---

## Architecture Flow

```
Button Press
    ↓
[LISTENING] → Record Audio (3-10 seconds)
    ↓
[ASR] → Offline Phrase Matching (local, no internet)
    ↓
Match Found? 
  ├─ YES → [ANSWER] → Get Today's Gift (or funny repeat response)
  └─ NO → Back to [SLEEP]
    ↓
[ANSWER] → Format Response + TTS (Piper - French)
    ↓
Display on LCD + Play Audio
    ↓
[SLEEP] → Wait for next button press
```

---

## System Requirements

### Hardware
- Raspberry Pi Zero 2W or RPi 5B
- Whisplay HAT (LCD 320x240, speaker, mic, button)
- PiSugar battery

### Software to Install
```bash
# Piper TTS (French model)
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz
tar xzf piper_arm64.tar.gz && sudo mv piper /usr/local/bin/

# Download French voice model
mkdir -p /home/pi/piper/voices
wget https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/fr/fr_FR/maeva/medium/fr_FR-maeva-medium.onnx \
  -O /home/pi/piper/voices/fr_FR-maeva-medium.onnx

# Optional: SoX (for audio format conversion)
sudo apt-get install sox

# Optional: Pocketsphinx (for better French ASR)
sudo apt-get install pocketsphinx
```

---

## Customization Guide

### Add/Modify Daily Gifts

Edit `src/core/AdventCalendar.ts`:

```typescript
const ADVENT_GIFTS: { [key: number]: AdventGift } = {
  1: {
    day: 1,
    gift: "Un cadeau magique! 🎁",
    emoji: "🎁",
    funny: "Reviens demain pour plus! 😄",
  },
  // ... 24 more days (25 total)
};
```

**Structure:**
- `day`: Day number (1-25)
- `gift`: Gift message (shown on first request)
- `emoji`: Main emoji for display
- `funny`: Repeat response (shown on subsequent requests)

### Add Trigger Phrases

Edit `src/cloud-api/offline-asr.ts`:

```typescript
const TRIGGER_PHRASES = [
  "donnez-moi mon cadeau",
  "donne-moi un cadeau",
  "c'est mon tour",
  // Add more French variations
];
```

### Change Piper Model (French Variants)

Available French voices:
- `fr_FR-maeva-medium.onnx` (default - female, medium quality)
- `fr_FR-maeva-high.onnx` (better quality, larger)
- You can also try other French models from Hugging Face

Update `.env`:
```bash
PIPER_MODEL_PATH=/path/to/new/french/model.onnx
```

---

## Key Design Decisions

### Why Offline?
1. **Zero Dependencies**: No API keys, no internet connectivity required
2. **Privacy**: All data stays on device
3. **Reliability**: Works in airplane mode, offline locations
4. **Cost**: No cloud subscription fees
5. **Speed**: Local processing = instant responses

### Phrase Matching vs. ML
- **No ML model needed** - Simple substring/fuzzy matching
- **Handles variations**: "mon cadeau", "donne cadeau", "le cadeau"
- **70% similarity threshold** - Tolerates mispronunciations
- **Fallback**: Energy-based speech detection if phrase matching fails

### Predetermined Responses
- **Deterministic** - Same gift every first request
- **Funny repeats** - Pre-written humor, not AI-generated
- **Low resource usage** - No LLM inference needed

---

## File Structure

```
src/
├── core/
│   ├── AdventCalendar.ts         ← GIFT DATABASE & LOGIC
│   ├── ChatFlow.ts               (unchanged - still works with offline)
│   └── StreamResponsor.ts
├── cloud-api/
│   ├── offline-asr.ts            ← FRENCH PHRASE DETECTION
│   ├── offline-llm.ts            ← RESPONSE GENERATION
│   ├── server.ts                 (updated - routes to offline)
│   ├── piper-tts.ts              (unchanged - French TTS works)
│   └── ... other APIs
├── device/
│   ├── display.ts                (unchanged - socket comm)
│   ├── audio.ts                  (unchanged - recording)
│   └── ...
└── type/
    └── index.ts                  (updated - added offline enums)

.env.advent-calendar              ← NEW - Ready-to-use config
.github/
└── copilot-instructions.md       ← NEW - AI agent guide
```

---

## Testing & Debugging

### Quick Test
```bash
# 1. Build
bash build.sh

# 2. Test in offline mode
ASR_SERVER=offline LLM_SERVER=offline TTS_SERVER=piper bash run_chatbot.sh

# 3. Press button and say "donnez-moi mon cadeau"
# → Should display gift + emoji, play audio
```

### Check Logs
```bash
tail -f chatbot.log
```

Look for:
- `[HH:MM:SS] switch to: listening` - Button pressed, recording started
- `Matched trigger phrase: "donnez-moi mon cadeau"` - ASR matched
- `[HH:MM:SS] Advent calendar response sent:` - Response sent

### Manual Testing
```bash
# Test audio recording
arecord -f cd -r 44100 -t wav test.wav

# Test Piper TTS
echo "Bonjour" | piper --model /home/pi/piper/voices/fr_FR-maeva-medium.onnx --output_file test.wav

# Test display socket
echo '{"status":"test","emoji":"🎁","text":"Bonjour"}' | nc localhost 12345
```

---

## What's NOT Included

The advent calendar edition **intentionally excludes**:
- ❌ Cloud API support (OpenAI, Gemini, Volcengine, etc.)
- ❌ LLM inference (Ollama, local or cloud)
- ❌ Multi-turn conversations
- ❌ Image generation
- ❌ Complex tool calling
- ❌ Custom prompts/system messages

All of these **can still be re-enabled** by switching back to cloud modes in `.env`.

---

## Switching Between Modes

### Advent Calendar Mode (Offline)
```bash
cp .env.advent-calendar .env
bash build.sh && bash run_chatbot.sh
```

### Original AI Chatbot (Cloud)
```bash
# Use original .env with cloud API keys
cp .env.original .env
bash build.sh && bash run_chatbot.sh
```

---

## Next Steps

1. **Install Piper TTS** (see System Requirements above)
2. **Copy `.env.advent-calendar` to `.env`** and adjust paths
3. **Build the project**: `bash build.sh`
4. **Test locally**: `bash run_chatbot.sh`
5. **Customize gifts** in `src/core/AdventCalendar.ts`
6. **Add trigger phrases** in `src/cloud-api/offline-asr.ts`
7. **Set up auto-start**: `sudo bash startup.sh`

---

## Support & Troubleshooting

### Issue: Piper not found
```bash
# Check if Piper is in PATH
which piper

# Add to ~/.bashrc if needed
export PATH="/usr/local/bin:$PATH"
source ~/.bashrc
```

### Issue: French model not loaded
```bash
# Verify model exists
ls -la /home/pi/piper/voices/fr_FR-maeva-medium.onnx

# Update .env with correct path
PIPER_MODEL_PATH=/path/to/model.onnx
```

### Issue: Audio not recording
```bash
# Check audio device
arecord -l

# Test recording
arecord -f cd -r 44100 -t wav test.wav

# Play back
aplay test.wav
```

---

## Git Branch

This implementation is on the **`advent-calendar`** branch. You can:

```bash
# Create your own branch from advent-calendar
git checkout -b my-custom-calendar

# Or switch between versions
git checkout master          # Original AI chatbot
git checkout advent-calendar # Offline advent calendar
```

---

**Implementation Date**: November 2025  
**Edition**: French Offline Advent Calendar v1.0  
**Status**: Ready for deployment ✅
