/**
 * Offline French ASR - Simple phrase matching
 * No cloud API, no ML models required
 * Uses simple string matching for common French trigger phrases
 */

import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

// Trigger phrases to listen for (in French)
const TRIGGER_PHRASES = [
  "donnez-moi mon cadeau",
  "donne-moi mon cadeau",
  "mon cadeau",
  "donne mon cadeau",
  "le cadeau",
  "cadeau",
  "donnez",
];

/**
 * Simple speech-to-text using local tools (pocketsphinx/pocketsphinx-continuous)
 * Falls back to basic audio analysis if sphinxd is not available
 */
export const recognizeAudio = async (audioFilePath: string): Promise<string> => {
  if (!fs.existsSync(audioFilePath)) {
    console.error("Audio file does not exist:", audioFilePath);
    return "";
  }

  try {
    // Try using pocketsphinx if available (French model)
    const result = await tryPocketSphinx(audioFilePath);
    if (result) {
      return matchTriggerPhrase(result);
    }
  } catch (error) {
    console.warn("Pocketsphinx failed, trying alternative method");
  }

  try {
    // Fallback: Try using SoX to detect if there's speech
    const hasSpeech = await detectSpeech(audioFilePath);
    if (hasSpeech) {
      // If speech detected but phrase matching failed, return empty
      console.log("Speech detected but phrase not recognized");
    }
  } catch (error) {
    console.warn("Speech detection failed");
  }

  return "";
};

/**
 * Try to use pocketsphinx for speech recognition
 */
const tryPocketSphinx = async (audioFilePath: string): Promise<string> => {
  try {
    // Ensure we have a WAV file with the correct sample rate/chan
    const ext = path.extname(audioFilePath).toLowerCase();
    let wavFile = audioFilePath;
    let createdTemp = false;

    if (ext !== ".wav") {
      // create a temp wav path next to original
      wavFile = audioFilePath.replace(/\.[^/.]+$/, ".wav");
      try {
        // Prefer ffmpeg, fallback to sox
        try {
          await execAsync(`ffmpeg -y -i "${audioFilePath}" -ar 16000 -ac 1 "${wavFile}"`);
        } catch (ffErr) {
          // try sox
          await execAsync(`sox "${audioFilePath}" -r 16000 -b 16 -c 1 "${wavFile}"`);
        }
        createdTemp = true;
      } catch (convErr) {
        console.warn("Audio conversion to WAV failed:", (convErr as Error).message);
      }
    }

    // Use pocketsphinx for French speech recognition
    try {
      // Try a simple pocketsphinx invocation; additional model flags can be configured by the user
      const cmd = `pocketsphinx_continuous -infile "${wavFile}" 2>/dev/null`;
      const { stdout } = await execAsync(cmd, { timeout: 30000 });
      const text = stdout.trim().toLowerCase();

      if (createdTemp) {
        try {
          fs.unlinkSync(wavFile);
        } catch {}
      }

      return text;
    } catch (e) {
      console.warn("Pocketsphinx command failed:", (e as Error).message);
      // cleanup temp
      if (createdTemp) {
        try {
          fs.unlinkSync(wavFile);
        } catch {}
      }
      return "";
    }
  } catch (error) {
    return "";
  }
};

/**
 * Detect if there's speech in the audio file using energy analysis
 */
const detectSpeech = async (audioFilePath: string): Promise<boolean> => {
  try {
    // Use SoX to analyze audio statistics
    const { stdout } = await execAsync(
      `sox "${audioFilePath}" -n stats 2>&1 | grep "Maximum amplitude"`
    );
    const match = stdout.match(/Maximum amplitude\s+([\d.]+)/);
    if (match) {
      const amplitude = parseFloat(match[1]);
      return amplitude > 0.05; // If amplitude is significant, speech likely detected
    }
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Match spoken text against trigger phrases
 * Returns the recognized phrase if found, empty string otherwise
 */
const matchTriggerPhrase = (spokenText: string): string => {
  const normalized = spokenText
    .toLowerCase()
    .trim()
    .replace(/[.,!?]/g, "");

  // Check for exact or partial matches
  for (const phrase of TRIGGER_PHRASES) {
    if (normalized.includes(phrase.toLowerCase())) {
      console.log(`Matched trigger phrase: "${phrase}"`);
      return phrase;
    }
  }

  // Levenshtein-like fuzzy matching for close matches (handles slight mispronunciations)
  for (const phrase of TRIGGER_PHRASES) {
    if (isSimilar(normalized, phrase.toLowerCase())) {
      console.log(`Fuzzy matched trigger phrase: "${phrase}"`);
      return phrase;
    }
  }

  return "";
};

/**
 * Simple similarity check (Levenshtein-like)
 */
const isSimilar = (str1: string, str2: string): boolean => {
  if (Math.abs(str1.length - str2.length) > 5) return false;

  let matches = 0;
  const minLength = Math.min(str1.length, str2.length);

  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) matches++;
  }

  const similarity = matches / Math.max(str1.length, str2.length);
  return similarity > 0.7; // 70% similarity threshold
};
