# French Offline Advent Calendar - Quick Reference

## Installation (5 min)

```bash
# 1. Clone & setup
git clone https://github.com/your-fork/whisplay-ai-chatbot.git
cd whisplay-ai-chatbot
bash install_dependencies.sh
source ~/.bashrc

# 2. Configure for offline
cp .env.advent-calendar .env

# 3. Install Piper TTS
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz
tar xzf piper_arm64.tar.gz && sudo mv piper /usr/local/bin/

# 4. Download French model
mkdir -p /home/pi/piper/voices
wget https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/fr/fr_FR/maeva/medium/fr_FR-maeva-medium.onnx \
  -O /home/pi/piper/voices/fr_FR-maeva-medium.onnx

# 5. Build & run
bash build.sh
bash run_chatbot.sh
```

## Architecture

| Component | Technology | Location |
|-----------|-----------|----------|
| **ASR** | Local French phrase matching | `src/cloud-api/offline-asr.ts` |
| **LLM** | Advent calendar logic | `src/cloud-api/offline-llm.ts` |
| **TTS** | Piper (French) | `src/cloud-api/piper-tts.ts` |
| **Gifts** | Database | `src/core/AdventCalendar.ts` |
| **Flow** | State machine | `src/core/ChatFlow.ts` |
| **Display** | Socket (localhost:12345) | `src/device/display.ts` + `python/chatbot-ui.py` |

## Key Files

- **Configuration**: `.env.advent-calendar`
- **Gifts Database**: `src/core/AdventCalendar.ts`
- **Trigger Phrases**: `src/cloud-api/offline-asr.ts`
- **AI Agent Guide**: `.github/copilot-instructions.md`
- **Setup Details**: `ADVENT_CALENDAR_SETUP.md`
- **Build**: `bash build.sh`
- **Run**: `bash run_chatbot.sh`

## Customization

### Add/Modify Gifts
Edit `src/core/AdventCalendar.ts`:
```typescript
1: { gift: "Un cadeau ☕", emoji: "☕", funny: "Déjà?" },
```

### Add Trigger Phrases
Edit `src/cloud-api/offline-asr.ts`:
```typescript
const TRIGGER_PHRASES = [
  "donnez-moi mon cadeau",
  "mon cadeau",
  // Add more...
];
```

## How It Works

1. **Press button** → Records audio
2. **Say "donnez-moi mon cadeau"** → Matches trigger phrase locally
3. **Get gift** → First request: gift + emoji, Repeats: funny response
4. **Display & speak** → Shows on LCD, plays via Piper TTS
5. **Back to sleep** → Waits for next button

## Network Requirements

✅ **ZERO NETWORK** - Completely offline  
✅ No internet needed  
✅ No API keys needed  
✅ All processing on device  

## Environment Variables

```bash
ASR_SERVER=offline                          # Use offline ASR
LLM_SERVER=offline                          # Use offline LLM
TTS_SERVER=piper                            # Use Piper for TTS
PIPER_BINARY_PATH=/usr/bin/piper            # Piper installation
PIPER_MODEL_PATH=/home/pi/piper/voices/fr_FR-maeva-medium.onnx
CHAT_HISTORY_RESET_TIME=60                  # Reset after 60s (not used in advent)
```

## Testing

```bash
# Verify setup
bash verify-advent-calendar.sh

# Check logs while running
tail -f chatbot.log

# Test Piper TTS directly
echo "Bonjour" | piper --model /home/pi/piper/voices/fr_FR-maeva-medium.onnx --output_file test.wav

# Test audio recording
arecord -f cd -r 44100 -t wav test.wav
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Piper not found | `export PATH="/usr/local/bin:$PATH"` |
| Model not loaded | Check `PIPER_MODEL_PATH` in `.env` |
| No audio capture | `arecord -l` to find device |
| Display not showing | Check socket at `localhost:12345` |

## Files Changed

| File | Change | Reason |
|------|--------|--------|
| `src/core/AdventCalendar.ts` | ✅ Created | Gift database & logic |
| `src/cloud-api/offline-asr.ts` | ✅ Created | French phrase detection |
| `src/cloud-api/offline-llm.ts` | ✅ Created | Response generation |
| `src/cloud-api/server.ts` | 📝 Updated | Route to offline modules |
| `src/type/index.ts` | 📝 Updated | Added offline enums |
| `package.json` | 📝 Updated | Removed cloud dependencies |
| `.github/copilot-instructions.md` | ✅ Created | AI agent documentation |
| `README.md` | 📝 Updated | Added advent calendar section |
| `.env.advent-calendar` | ✅ Created | Configuration template |
| `ADVENT_CALENDAR_SETUP.md` | ✅ Created | Detailed setup guide |

## Branch

Switch between versions:
```bash
git checkout master           # Original AI chatbot
git checkout advent-calendar  # Offline advent calendar (this)
```

## Support

📚 Full documentation in `ADVENT_CALENDAR_SETUP.md`  
🤖 AI agent guide in `.github/copilot-instructions.md`  
📖 README section: "Offline French Advent Calendar Edition"  

---

**Status**: ✅ Ready for deployment  
**Date**: November 2025  
**Edition**: v1.0
