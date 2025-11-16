import dotenv from "dotenv";

dotenv.config();

export interface AdventGift {
  day: number;
  gift: string;
  emoji: string;
  funny: string;
}

interface DayRequest {
  count: number;
  lastRequestTime: number;
}

// French advent calendar - 25 days of gifts
const ADVENT_GIFTS: { [key: number]: AdventGift } = {
  1: {
    day: 1,
    gift: "Un chocolat chaud ☕",
    emoji: "☕",
    funny: "Tu as déjà eu ton cadeau, gourmand! 😄",
  },
  2: {
    day: 2,
    gift: "Une écharpe douillette 🧣",
    emoji: "🧣",
    funny: "Deux fois, c'est quand même abuser! 😅",
  },
  3: {
    day: 3,
    gift: "Des mitaines colorées 🧤",
    emoji: "🧤",
    funny: "Frimeur! Tu veux encore plus? 😎",
  },
  4: {
    day: 4,
    gift: "Un bonnet floconneux ❄️",
    emoji: "❄️",
    funny: "Allez, pas de triche! 🎄",
  },
  5: {
    day: 5,
    gift: "Des chaussettes chaudes 🧦",
    emoji: "🧦",
    funny: "C'est NON pour aujourd'hui! 😤",
  },
  6: {
    day: 6,
    gift: "Un biscuit de Noël 🍪",
    emoji: "🍪",
    funny: "T'es gourmand toi! 😋",
  },
  7: {
    day: 7,
    gift: "Une cannelle parfumée 🕯️",
    emoji: "🕯️",
    funny: "Qu'est-ce qu'on attend pour demain! 🎅",
  },
  8: {
    day: 8,
    gift: "Un livre de contes 📖",
    emoji: "📖",
    funny: "Patience, encore 17 jours! ⏰",
  },
  9: {
    day: 9,
    gift: "Une boule de Noël brillante 🎄",
    emoji: "🎄",
    funny: "Tu peux pas arrêter toi? 😆",
  },
  10: {
    day: 10,
    gift: "Un puzzle festif 🧩",
    emoji: "🧩",
    funny: "C'est bien de vouloir partager! 🎁",
  },
  11: {
    day: 11,
    gift: "Une guirlande colorée ✨",
    emoji: "✨",
    funny: "Reviens demain pour plus de magie! 🪄",
  },
  12: {
    day: 12,
    gift: "Un sapin miniature 🌲",
    emoji: "🌲",
    funny: "C'est pas ton jour aujourd'hui! 😜",
  },
  13: {
    day: 13,
    gift: "Des boules de neige factices ❄️",
    emoji: "❄️",
    funny: "L'avidité n'est pas une vertu! 😒",
  },
  14: {
    day: 14,
    gift: "Un carillon de Noël 🔔",
    emoji: "🔔",
    funny: "Écoute-le une fois c'est assez! 🎵",
  },
  15: {
    day: 15,
    gift: "Des petites lumières LED 💡",
    emoji: "💡",
    funny: "Plus que 10 jours! Ne sois pas impatient! ⏳",
  },
  16: {
    day: 16,
    gift: "Un flocon de neige 3D ❄️",
    emoji: "❄️",
    funny: "Trop gourmand pour ce matin! 🙅",
  },
  17: {
    day: 17,
    gift: "Une petite bougie parfumée 🕯️",
    emoji: "🕯️",
    funny: "Tu reviens demain hein! 😄",
  },
  18: {
    day: 18,
    gift: "Un bas de Noël 🎄",
    emoji: "🎄",
    funny: "Arrête d'essayer, ça ne marche pas! 🛑",
  },
  19: {
    day: 19,
    gift: "Une couronne de l'Avent 👑",
    emoji: "👑",
    funny: "Trop tôt mon ami! Reviens demain! 🤐",
  },
  20: {
    day: 20,
    gift: "Des décorations en bois 🪵",
    emoji: "🪵",
    funny: "C'est pas ta journée! 🚫",
  },
  21: {
    day: 21,
    gift: "Un panneau 'Joyeux Noël' 🎅",
    emoji: "🎅",
    funny: "Plus que quelques jours! Patience! 🙏",
  },
  22: {
    day: 22,
    gift: "Des rennes en peluche 🦌",
    emoji: "🦌",
    funny: "Les rennes ont besoin de repos! 😴",
  },
  23: {
    day: 23,
    gift: "Un traineau miniature 🛷",
    emoji: "🛷",
    funny: "Bientôt! Presque là! 🏁",
  },
  24: {
    day: 24,
    gift: "La veille de Noël - Un cœur en chocolat 🍫",
    emoji: "🍫",
    funny: "Demain c'est le jour J! 🎉",
  },
  25: {
    day: 25,
    gift: "Joyeux Noël! 🎄🎅🎁 Merci d'avoir participé! 🌟",
    emoji: "🎁",
    funny: "À l'année prochaine! Bonnes fêtes! 🥳",
  },
};

class AdventCalendar {
  private requestTracker: Map<number, DayRequest> = new Map();
  private resetInterval: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Initialize tracker
    this.requestTracker.clear();
  }

  /**
   * Get today's gift based on the current date
   * First request returns the gift, subsequent requests return funny messages
   */
  getTodayGift(): { gift: string; emoji: string } {
    const today = this.getCurrentDay();
    const adventGift = ADVENT_GIFTS[today];

    if (!adventGift) {
      return {
        gift: `Désolé, le jour ${today} n'est pas dans le calendrier (1-25)`,
        emoji: "🤷",
      };
    }

    const tracker = this.getOrCreateTracker(today);

    if (tracker.count === 0) {
      // First request - return the actual gift
      tracker.count = 1;
      tracker.lastRequestTime = Date.now();
      return {
        gift: adventGift.gift,
        emoji: adventGift.emoji,
      };
    } else {
      // Subsequent requests - return funny response
      tracker.count += 1;
      tracker.lastRequestTime = Date.now();
      return {
        gift: adventGift.funny,
        emoji: adventGift.emoji,
      };
    }
  }

  /**
   * Get gift for a specific day (useful for testing or manual access)
   */
  getGiftForDay(day: number): { gift: string; emoji: string } {
    const adventGift = ADVENT_GIFTS[day];

    if (!adventGift) {
      return {
        gift: `Désolé, le jour ${day} n'est pas disponible`,
        emoji: "🤷",
      };
    }

    const tracker = this.getOrCreateTracker(day);

    if (tracker.count === 0) {
      tracker.count = 1;
      tracker.lastRequestTime = Date.now();
      return {
        gift: adventGift.gift,
        emoji: adventGift.emoji,
      };
    } else {
      tracker.count += 1;
      tracker.lastRequestTime = Date.now();
      return {
        gift: adventGift.funny,
        emoji: adventGift.emoji,
      };
    }
  }

  /**
   * Get the current day of December (1-31)
   * If not in December, returns day 1 (for testing or off-season)
   */
  private getCurrentDay(): number {
    const now = new Date();
    const month = now.getMonth();
    const date = now.getDate();

    // If in December, return the day (capped at 25)
    if (month === 11) {
      // December is month 11 (0-indexed)
      return Math.min(date, 25);
    }

    // Off-season: simulate day 1 for testing
    return 1;
  }

  /**
   * Get or create a request tracker for a specific day
   */
  private getOrCreateTracker(day: number): DayRequest {
    let tracker = this.requestTracker.get(day);

    if (!tracker) {
      tracker = { count: 0, lastRequestTime: 0 };
      this.requestTracker.set(day, tracker);
    }

    // Reset if 24 hours have passed (for daily reset)
    if (Date.now() - tracker.lastRequestTime > this.resetInterval) {
      tracker.count = 0;
    }

    return tracker;
  }

  /**
   * Reset all request counters (useful for testing)
   */
  resetAllTrackers(): void {
    this.requestTracker.clear();
  }

  /**
   * Get request count for a specific day
   */
  getRequestCount(day: number): number {
    const tracker = this.requestTracker.get(day);
    return tracker ? tracker.count : 0;
  }

  /**
   * Get all advent gifts (for reference or management)
   */
  getAllGifts(): { [key: number]: AdventGift } {
    return ADVENT_GIFTS;
  }
}

export default AdventCalendar;
