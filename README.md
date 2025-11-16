# Whisplay-AI-Chatbot & French Offline Advent Calendar Edition

<img src="https://docs.pisugar.com/img/whisplay_logo@4x-8.png" alt="Whisplay AI Chatbot" width="200" />

This is a pocket-sized AI chatbot device built using a Raspberry Pi Zero 2w. Just press the button, speak, and it talks back—like a futuristic walkie-talkie with a mind of its own.

**NEW**: This repository now includes a **French Offline Advent Calendar Edition** - a completely offline application that listens for a French phrase ("donnez-moi mon cadeau"), responds with daily gifts, shows emojis, and plays audio - no internet connection required!

## Editions

- **Original**: Full-featured AI chatbot with cloud API support
- **Offline Advent Calendar**: Limited to French phrase detection for advent calendar gifts (no internet, no API keys)

Test Video Playlist:
[https://www.youtube.com/watch?v=lOVA0Gui-4Q](https://www.youtube.com/playlist?list=PLpTS9YM-tG_mW5H7Xs2EO0qvlAI-Jm1e_)

Tutorial:
[https://www.youtube.com/watch?v=Nwu2DruSuyI](https://www.youtube.com/watch?v=Nwu2DruSuyI)

Tutorial 2 (offline version build on RPi 5B):
[https://www.youtube.com/watch?v=kFmhSTh167U](https://www.youtube.com/watch?v=kFmhSTh167U)

## Hardware

- Raspberry Pi zero 2w (or 5B for offline version)
- PiSugar Whisplay HAT (including LCD screen, on-board speaker and microphone)
- PiSugar 3 1200mAh

## Drivers

You need to firstly install the audio drivers for the Whisplay HAT. Follow the instructions in the [Whisplay HAT repository](https://github.com/PiSugar/whisplay).

## Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/PiSugar/whisplay-ai-chatbot.git
   cd whisplay-ai-chatbot
   ```
2. Install dependencies:
   ```bash
   bash install_dependencies.sh
   source ~/.bashrc
   ```
   Running `source ~/.bashrc` is necessary to load the new environment variables.
3. Create a `.env` file based on the `.env.template` file and fill in the necessary environment variables.
4. Build the project:
   ```bash
   bash build.sh
   ```
5. Start the chatbot service:
   ```bash
   bash run_chatbot.sh
   ```
6. Optionally, set up the chatbot service to start on boot:
   ```bash
   sudo bash startup.sh
   ```
   Please note that this will disable the graphical interface and set the system to multi-user mode, which is suitable for headless operation.
   You can find the output logs at `chatbot.log`. Running `tail -f chatbot.log` will also display the logs in real-time.

## Offline French Advent Calendar Edition

For a completely offline advent calendar experience (no internet, no API keys required), follow these steps:

### Quick Start - Advent Calendar Mode

1. **Setup**:
   ```bash
   git clone https://github.com/your-fork/whisplay-ai-chatbot.git
   cd whisplay-ai-chatbot
   bash install_dependencies.sh
   source ~/.bashrc
   ```

2. **Configure for Offline Mode**:
   ```bash
   cp .env.advent-calendar .env
   # Edit .env if needed (Piper paths, Vosk model paths, etc.)
   ```

3. **Install Piper TTS** (for French audio):
   ```bash
   # Install Piper TTS
   wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz
   tar xzf piper_arm64.tar.gz
   sudo mv piper /usr/local/bin/
   
   # Download French model
   mkdir -p /home/pi/piper/voices
   wget https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/fr/fr_FR/maeva/medium/fr_FR-maeva-medium.onnx -O /home/pi/piper/voices/fr_FR-maeva-medium.onnx
   ```

4. **Build & Run**:
   ```bash
   bash build.sh
   bash run_chatbot.sh
   ```

### How It Works

1. **Press the button** - Device listens for audio
2. **Say "donnez-moi mon cadeau"** - French phrase detection (local, no internet)
3. **Get your gift** - Device responds with today's advent gift and displays it:
   - First request: Full gift message + emoji
   - Repeat requests: Funny predetermined responses
4. **Audio & Display** - Gift is spoken via offline Piper TTS and shown on screen

### Customizing Gifts

Edit `src/core/AdventCalendar.ts` to modify daily gifts:

```typescript
const ADVENT_GIFTS: { [key: number]: AdventGift } = {
  1: {
    day: 1,
    gift: "Un chocolat chaud ☕",
    emoji: "☕",
    funny: "Tu as déjà eu ton cadeau, gourmand! 😄",
  },
  // ... more days
};
```

### Customizing Trigger Phrases

Edit `src/cloud-api/offline-asr.ts` to add French variations:

```typescript
const TRIGGER_PHRASES = [
  "donnez-moi mon cadeau",
  "mon cadeau",
  "donne cadeau",
  // ... add more phrases
];
```

## Build After Code Changes

If you make changes to the node code or just pull the new code from this repository, you need to rebuild the project. You can do this by running:

```bash
bash build.sh
```

If there's new third-party libraries to the python code, make sure to install them in global environment with `--break-system-packages`.

```bash
cd python
pip install -r requirements.txt --break-system-packages
```

## Update Environment Variables

If you need to update the environment variables, you can edit the `.env` file directly. After making changes, please restart the chatbot service with:

```bash
systemctl restart whisplay-ai-chatbot.service
```

## Image Generation

Enable image generation by setting the `IMAGE_GENERATION_SERVER` variable in the `.env` file. Options include: OPENAI, GEMINI, VOLCENGINE.

Then you can use prompts like "A children's book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter." to generate images.

The generated images will be displayed on the screen and saved in the `data/images` folder.

## Display Battery Level

The battery level display depends on the pisugar-power-manager. If you are using PiSugar2 or PiSugar3, you need to install the pisugar-power-manager first. You can find the installation instructions in the [PiSugar Power Manager repository](https://github.com/PiSugar/pisugar-power-manager-rs).

Or use the following command to install it:

```bash
wget https://cdn.pisugar.com/release/pisugar-power-manager.sh
bash pisugar-power-manager.sh -c release
```

## Data Folder

The chatbot saves conversation history and generated images in the `data` folder. It's a temporal folder and can be deleted if you want to clear the history.

## Enclosure

[Whisplay Chatbot Case](https://github.com/PiSugar/suit-cases/tree/main/pisugar3-whisplay-chatbot)

## Goals

- Integrate the tool with the API ✅
- Enable the AI assistant to adjust the volume autonomously ✅
- Reset the conversation history if there is no speech for five minutes ✅
- Support local llm server ✅
- Support local asr (whisper/vosk) ✅
- Support local tts (piper) ✅
- Support image generation (openai/gemini/volcengine) ✅
- Refactor python render thread, better performance ✅
- Add Google Gemini API support ✅
- **Offline French Advent Calendar** ✅
- Add Grok API support
- RPI camera support
- Support speaker recognition

## License

[GPL-3.0](https://github.com/PiSugar/whisplay-ai-chatbot?tab=GPL-3.0-1-ov-file#readme)
