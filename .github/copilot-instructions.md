# Whisplay AI Chatbot - French Offline Advent Calendar Edition

## Project Overview
This is an offline French advent calendar running on Raspberry Pi Zero 2W with a Whisplay HAT (LCD screen, speaker, mic, button). The application detects a French phrase ("donnez-moi mon cadeau" / "give me my gift"), then responds with the day's gift, funny repeat responses, and displays emojis/animations.

## Architecture

### Core Flow: `src/core/ChatFlow.ts`
State machine managing device interactions:
- **sleep**: Idle state, waiting for button press
- **listening**: Recording audio after button pressed
- **asr**: Recognizing spoken phrase (local phrase matching, no cloud)
- **answer**: Processing gift response and displaying result
- **image**: Displaying generated images (optional)

### Data Flow
```
Button Press → Audio Record → Phrase Detection → Gift Response → 
TTS (offline Piper) → Display & Play → Waiting for next button
```

### Key Components

#### 1. **Advent Calendar Logic** (`src/core/AdventCalendar.ts`)
- Stores 25 daily gifts (Dec 1-25)
- Tracks per-day request count
- Returns gift on first request, funny response on repeat requests
- Example gifts structure: `{ day: 1, gift: "Un chocolat chaud ☕", emoji: "☕", funny: "Tu as déjà eu ton cadeau, gourmand! 😄" }`

#### 2. **Offline ASR** (`src/cloud-api/offline-asr.ts`)
- Simple French phrase matching (no ML required)
- Matches "donnez-moi mon cadeau", "mon cadeau", "le cadeau"
- Returns exact phrase match or empty string (no speech detected)
- Runs locally without network/GPU

#### 3. **Offline LLM Response** (`src/cloud-api/offline-llm.ts`)
- Returns day's gift + emoji on first request
- Returns funny pre-written response on subsequent requests
- Formats response for TTS (Piper) + Display
- Supports system prompts for tone control

#### 4. **Display Integration** (`src/device/display.ts` + `python/chatbot-ui.py`)
- Socket communication (localhost:12345) between Node.js and Python
- Display shows: status emoji, scrolling text, current day indicator
- Python renders 320x240 LCD with battery indicator, emoji, text animation

#### 5. **TTS Output** (`src/cloud-api/piper-tts.ts`)
- Uses offline Piper TTS (no network required)
- French model: `fr_FR-maeva-medium.onnx`
- Returns audio buffer + duration for playback timing

### Configuration Files

#### `.env` Setup (Offline Only)
```bash
# Offline advent calendar configuration
ASR_SERVER=offline                 # No vosk/whisper/API
LLM_SERVER=offline                 # No ollama/openai/gemini
TTS_SERVER=piper                   # Local TTS only
SYSTEM_PROMPT="Tu es une assistant joyeuse..."
PIPER_BINARY_PATH=/home/pi/piper/piper
PIPER_MODEL_PATH=/home/pi/piper/voices/fr_FR-maeva-medium.onnx
CHAT_HISTORY_RESET_TIME=60         # 1 minute between resets
```

#### `package.json`
- Remove: `@google/genai`, `openai` (unused in offline mode)
- Keep: `dotenv`, `lodash`, `axios` (for local services)
- No external API dependencies

### Development Workflow

#### 1. **Add/Update Gifts**
Edit `src/core/AdventCalendar.ts`:
```typescript
const ADVENT_GIFTS = {
  1: { gift: "Un chocolat chaud ☕", emoji: "☕", funny: "Déjà?" },
  // ... 24 more days
};
```

#### 2. **Modify Phrase Matching**
Edit `src/cloud-api/offline-asr.ts` to add French variations:
```typescript
const TRIGGER_PHRASES = [
  "donnez-moi mon cadeau",
  "mon cadeau",
  "donne cadeau",
];
```

#### 3. **Build & Test**
```bash
bash build.sh                      # Builds TypeScript
bash run_chatbot.sh               # Starts application
```

#### 4. **Debugging**
- Logs show current flow state: `[HH:MM:SS] switch to: listening`
- Check audio capture: `arecord -f cd -r 44100 -t wav test.wav`
- Test display socket: `nc localhost 12345`

## Project-Specific Patterns

### Message Flow Pattern
All text responses flow through `StreamResponsor` which:
1. Accumulates text chunks
2. Splits into sentences
3. Queues TTS processing
4. Updates display in real-time

### State Transitions
Only button press or internal state completion triggers flow changes. No external event listener pattern - all async operations resolve to next state.

### Display Protocol
Display updates are JSON objects sent over socket (1 per line):
```json
{"status": "answering", "emoji": "🎁", "text": "Joyeux Noël!", "RGB": "#ff6800"}
```

## Key Files Summary
- **Logic**: `src/core/ChatFlow.ts`, `src/core/AdventCalendar.ts`
- **Offline backends**: `src/cloud-api/offline-asr.ts`, `src/cloud-api/offline-llm.ts`
- **Config**: `src/config/llm-config.ts` (gift database via env vars or hardcoded)
- **Device I/O**: `src/device/display.ts` (socket), `src/device/audio.ts` (recording)
- **TTS**: `src/cloud-api/piper-tts.ts` (local Piper binary)

## Offline-First Design
- **Zero network calls**: No API keys, no internet required
- **Minimal dependencies**: Only system packages (Piper, Vosk tools)
- **Language files**: Piper model + phrase list entirely local
- **Scalable gifts**: 365-day calendar via JSON, not hardcoded

---

**Last Updated**: November 2025  
**Edition**: French Offline Advent Calendar v1.0
