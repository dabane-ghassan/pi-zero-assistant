/**
 * Offline LLM Response Module for Advent Calendar
 * Returns predetermined gift messages and funny repeat responses
 * No cloud API required - all responses are hardcoded or loaded locally
 */

import AdventCalendar from "../core/AdventCalendar";
import { Message } from "../type";
import { ChatWithLLMStreamFunction } from "./interface";
import { getCurrentTimeTag } from "../utils";

// Initialize advent calendar
const adventCalendar = new AdventCalendar();

/**
 * Process user input and return appropriate advent calendar response
 */
export const chatWithLLMStream: ChatWithLLMStreamFunction = async (
  inputMessages: Message[] = [],
  partialCallback: (partialAnswer: string) => void,
  endCallback: () => void,
  partialThinkingCallback?: (partialThinking: string) => void
): Promise<void> => {
  try {
    console.log(`[${getCurrentTimeTag()}] Processing advent calendar request`);

    // Get today's gift (first request returns gift, subsequent return funny message)
    const { gift, emoji } = adventCalendar.getTodayGift();

    // Format the response with emoji
    const fullResponse = `${gift}`;

    // Stream the response in chunks (simulate streaming)
    const chunkSize = 5;
    for (let i = 0; i < fullResponse.length; i += chunkSize) {
      const chunk = fullResponse.substring(i, i + chunkSize);
      partialCallback(chunk);
      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // End the streaming
    endCallback();

    console.log(
      `[${getCurrentTimeTag()}] Advent calendar response sent: ${gift}`
    );
  } catch (error) {
    console.error("Error in offline LLM:", error);
    endCallback();
  }
};

/**
 * Reset chat history (not needed for advent calendar, but required by interface)
 */
export const resetChatHistory = (): void => {
  console.log("Chat history reset (advent calendar does not maintain history)");
};

/**
 * Get current day's gift without incrementing counter (for testing/display only)
 */
export const getCurrentDayGift = () => {
  return adventCalendar.getTodayGift();
};

/**
 * Reset all request trackers (for testing/debugging)
 */
export const resetAllTrackers = (): void => {
  adventCalendar.resetAllTrackers();
};
