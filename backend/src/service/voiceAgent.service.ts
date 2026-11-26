import { Item } from "../models/item.model";
import { transcribeAudio, synthesizeSpeech } from "./voice.service";
import logger from "../config/logger";

export interface VoiceAgentBookingResult {
  success: boolean;
  transcript: string;
  spokenResponse: string;
  audioBase64?: string;
  bookingCard?: {
    itemId: string;
    title: string;
    image: string;
    category: string;
    locality: string;
    startDate: string;
    endDate: string;
    startDateRaw?: string;
    endDateRaw?: string;
    totalDays: number;
    pricing: {
      dailyPrice: number;
      rentAmount: number;
      securityDeposit: number;
      totalAmount: number;
    };
  };
  message?: string;
}

// Curated verified items for demo/catalog matching across top categories
const FALLBACK_ITEMS = [
  {
    id: "featured-camera",
    title: "Sony Alpha A7 IV Mirrorless Camera",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    dailyPrice: 1400,
    securityDeposit: 5000,
    locality: "Indiranagar, Bangalore",
    keywords: ["camera", "sony", "canon", "dslr", "mirrorless", "alpha", "photo", "shoot", "lens", "कैमरा", "फोटो"],
  },
  {
    id: "featured-drone",
    title: "DJI Mini 3 Pro 4K Drone Combo",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    dailyPrice: 1800,
    securityDeposit: 8000,
    locality: "Alkapuri, Vadodara",
    keywords: ["drone", "dji", "fly", "aerial", "mini 3", "mavic", "quadcopter", "ड्रोन"],
  },
  {
    id: "featured-drill",
    title: "DeWalt 20V Cordless Hammer Drill Kit",
    category: "Tools",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    dailyPrice: 450,
    securityDeposit: 1500,
    locality: "Koramangala, Bangalore",
    keywords: ["drill", "dewalt", "bosch", "hammer", "tool", "repair", "cordless", "ड्रिल", "टूल", "औजार"],
  },
  {
    id: "featured-bike",
    title: "Royal Enfield Classic 350 — Stealth Black",
    category: "Vehicles",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
    dailyPrice: 750,
    securityDeposit: 3000,
    locality: "Bandra West, Mumbai",
    keywords: ["bike", "bullet", "enfield", "motorcycle", "classic 350", "hunter", "ride", "scooter", "बाइक", "गाड़ी", "बुलेट"],
  },
  {
    id: "featured-tent",
    title: "Quechua 4-Person Waterproof Camping Tent",
    category: "Outdoors",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
    dailyPrice: 350,
    securityDeposit: 1200,
    locality: "Kothrud, Pune",
    keywords: ["tent", "camping", "quechua", "camp", "outdoor", "trek", "तंबू", "टेंट", "कैंपिंग"],
  },
  {
    id: "featured-game",
    title: "Sony PlayStation 5 Console + 2 Controllers",
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    dailyPrice: 700,
    securityDeposit: 4000,
    locality: "DLF Phase 4, Gurgaon",
    keywords: ["playstation", "ps5", "ps4", "game", "gaming", "console", "xbox", "कंसोल", "गेम"],
  },
];

/**
 * Parses user Hinglish / English transcript to extract item keywords, duration and location
 */
function parseUserIntent(text: string): {
  keyword: string;
  searchQueries: string[];
  days: number;
  locality?: string;
} {
  const lower = text.toLowerCase();

  // 1. Detect duration across English, Hinglish & Hindi Devanagari
  let days = 2; // default 2 days

  if (
    lower.includes("1 din") || lower.includes("one day") || lower.includes("single day") ||
    lower.includes("ek din") || lower.includes("एक दिन") || lower.includes("1 day")
  ) {
    days = 1;
  } else if (
    lower.includes("2 din") || lower.includes("two days") || lower.includes("do din") ||
    lower.includes("दो दिन") || lower.includes("2 days") || lower.includes("weekend") || lower.includes("वीकेंड")
  ) {
    days = 2;
  } else if (
    lower.includes("3 din") || lower.includes("three days") || lower.includes("teen din") ||
    lower.includes("तीन दिन") || lower.includes("3 days")
  ) {
    days = 3;
  } else if (
    lower.includes("4 din") || lower.includes("four days") || lower.includes("char din") ||
    lower.includes("चार दिन") || lower.includes("4 days")
  ) {
    days = 4;
  } else if (
    lower.includes("5 din") || lower.includes("five days") || lower.includes("panch din") ||
    lower.includes("पांच दिन") || lower.includes("5 days")
  ) {
    days = 5;
  } else if (
    lower.includes("hafta") || lower.includes("haftha") || lower.includes("week") ||
    lower.includes("7 din") || lower.includes("सात दिन") || lower.includes("हफ्ता") || lower.includes("हफ्ते")
  ) {
    days = 7;
  } else {
    const numMatch = text.match(/(\d+)\s*(din|day|days|दिन)/i);
    if (numMatch && numMatch[1]) {
      days = Math.min(Math.max(parseInt(numMatch[1], 10), 1), 30);
    }
  }

  // 2. Detect locality if mentioned
  let locality: string | undefined = undefined;
  const localities = [
    "indiranagar", "koramangala", "bandra", "alkapuri", "hiranandani",
    "bangalore", "mumbai", "delhi", "pune", "goa", "hyderabad", "ahmedabad", "chennai"
  ];
  for (const loc of localities) {
    if (lower.includes(loc)) {
      locality = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  // 3. Keyword extraction across English, Hinglish, Brand names & Hindi Devanagari
  const searchQueries: string[] = [];
  let keyword = "";

  if (lower.includes("drone") || lower.includes("ड्रोन") || lower.includes("dji") || lower.includes("डीजेआई") || lower.includes("mavic") || lower.includes("aerial")) {
    keyword = "drone";
    searchQueries.push("drone", "dji", "mavic");
  } else if (lower.includes("drill") || lower.includes("ड्रिल") || lower.includes("dewalt") || lower.includes("bosch") || lower.includes("बॉश") || lower.includes("tool") || lower.includes("hammer")) {
    keyword = "drill";
    searchQueries.push("drill", "dewalt", "hammer", "tool", "bosch");
  } else if (lower.includes("bike") || lower.includes("बाइक") || lower.includes("bullet") || lower.includes("बुलेट") || lower.includes("enfield") || lower.includes("motorcycle") || lower.includes("गाड़ी")) {
    keyword = "bike";
    searchQueries.push("bike", "bullet", "enfield", "motorcycle");
  } else if (lower.includes("tent") || lower.includes("टेंट") || lower.includes("camping") || lower.includes("quechua") || lower.includes("तंबू")) {
    keyword = "tent";
    searchQueries.push("tent", "camping", "quechua");
  } else if (lower.includes("ps5") || lower.includes("playstation") || lower.includes("xbox") || lower.includes("gaming") || lower.includes("कंसोल")) {
    keyword = "playstation";
    searchQueries.push("playstation", "ps5", "gaming", "console");
  } else if (lower.includes("camera") || lower.includes("कैमरा") || lower.includes("sony") || lower.includes("canon") || lower.includes("dslr") || lower.includes("mirrorless") || lower.includes("फोटो")) {
    keyword = "camera";
    searchQueries.push("camera", "sony", "canon", "dslr", "mirrorless");
  } else {
    // Extract meaningful nouns from user sentence
    const words = lower.replace(/[^\w\s\u0900-\u097F]/gi, "").split(/\s+/).filter(w => w.length > 2);
    const stopWords = new Set([
      "chahiye", "chahiye tha", "mujhe", "mera", "hoga", "karo", "rent", "pe",
      "ke", "liye", "aur", "hai", "bhai", "need", "want", "for", "please", "book",
      "find", "doh", "dekho", "search", "karna", "krna"
    ]);
    const meaningful = words.filter(w => !stopWords.has(w));
    if (meaningful.length > 0) {
      keyword = meaningful[0];
      searchQueries.push(...meaningful);
    }
  }

  return { keyword, searchQueries, days, locality };
}

/**
 * Autonomous Voice-to-Booking Agent Service
 */
export async function runVoiceBookingAgent(
  audioBuffer?: Buffer,
  textQuery?: string,
  langCode: string = "en-IN"
): Promise<VoiceAgentBookingResult> {
  try {
    let transcript = textQuery ? textQuery.trim() : "";

    // 1. If audio buffer provided, transcribe via Sarvam STT
    if (audioBuffer && audioBuffer.length > 0) {
      const sttResult = await transcribeAudio(audioBuffer, "audio/webm", false);
      transcript = sttResult.transcript?.trim() || "";
    }

    const isEnglish = langCode === "en-IN";

    // 2. If nothing was said or audio was silent, DO NOT fake a camera request!
    if (!transcript) {
      logger.info("Voice Booking Agent: Empty speech detected");
      return {
        success: false,
        transcript: "",
        spokenResponse: isEnglish
          ? "No speech was detected. Please tap the microphone and speak your request clearly."
          : "कोई आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन दबाकर साफ़ बोलें।",
        message: "No speech detected. Please tap the microphone to speak, or type your request.",
      };
    }

    logger.info("Voice Booking Agent transcript:", { transcript, langCode });

    // 3. Parse user intent and keywords
    const { keyword, searchQueries, days, locality } = parseUserIntent(transcript);

    if (!keyword) {
      return {
        success: false,
        transcript,
        spokenResponse: isEnglish
          ? "I could not understand which equipment you need. Please say camera, drone, drill, or bike."
          : "समझ नहीं आया कि आपको कौन सा सामान चाहिए। कृपया कैमरा, ड्रोन, ड्रिल या बाइक का नाम बोलें।",
        message: "Could not identify equipment type. Try saying 'Sony camera', 'DJI drone', 'DeWalt drill', or 'Royal Enfield bike'.",
      };
    }

    // 4. Search MongoDB items
    let matchedItem: any = null;

    try {
      const queries = searchQueries.length > 0 ? searchQueries : [keyword];
      const orConditions: any[] = [];
      for (const q of queries) {
        const regex = new RegExp(q, "i");
        orConditions.push({ title: regex }, { description: regex }, { category: regex });
      }

      const dbItem = await Item.findOne({
        $or: orConditions,
        isActive: { $ne: false },
      }).lean();

      if (dbItem) {
        matchedItem = {
          id: dbItem._id.toString(),
          title: dbItem.title,
          category: dbItem.category,
          image: dbItem.images?.[0] || FALLBACK_ITEMS[0].image,
          dailyPrice: dbItem.price?.daily || 1000,
          securityDeposit: dbItem.securityDeposit || 3000,
          locality: dbItem.location?.area || dbItem.location?.city || locality || "Indiranagar, Bangalore",
        };
      }
    } catch (dbErr) {
      logger.warn("DB search error, searching curated items:", dbErr);
    }

    // 5. If not in DB, search curated fallback items ONLY if matching keyword
    if (!matchedItem) {
      const lowerKw = keyword.toLowerCase();
      const fallback = FALLBACK_ITEMS.find((f) =>
        f.keywords.some((k) => k.toLowerCase() === lowerKw || lowerKw.includes(k) || k.includes(lowerKw))
      );

      if (fallback) {
        matchedItem = {
          id: fallback.id,
          title: fallback.title,
          category: fallback.category,
          image: fallback.image,
          dailyPrice: fallback.dailyPrice,
          securityDeposit: fallback.securityDeposit,
          locality: locality ? `${locality}, City Center` : fallback.locality,
        };
      }
    }

    // 6. If STILL no match, DO NOT hallucinate a random camera! Report honest not-found.
    if (!matchedItem) {
      return {
        success: false,
        transcript,
        spokenResponse: isEnglish
          ? `Sorry, I could not find any equipment matching "${keyword}". Please try searching for cameras, drones, drills, or bikes.`
          : `माफ़ कीजिये, "${keyword}" से मिलता-जुलता कोई उपकरण नहीं मिला। कृपया कैमरा, ड्रोन, ड्रिल या बाइक सर्च करें।`,
        message: `No equipment found matching "${keyword}". Try searching for cameras, drones, power tools, or bikes.`,
      };
    }

    // 7. Calculate Dates & Pricing
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const rentAmount = matchedItem.dailyPrice * days;
    const securityDeposit = matchedItem.securityDeposit;
    const totalAmount = rentAmount + securityDeposit;

    // 8. Generate Voice Reply
    const spokenResponse = isEnglish
      ? `Found ${matchedItem.title}! The rent for ${days} days is ₹${rentAmount.toLocaleString()} with a refundable deposit of ₹${securityDeposit.toLocaleString()}.`
      : `${matchedItem.title} मिल गया है! ${days} दिन का किराया ₹${rentAmount.toLocaleString()} और रिफंडेबल सिक्योरिटी डिपॉज़िट ₹${securityDeposit.toLocaleString()} है।`;

    // 9. Synthesize Spoken Audio with Sarvam AI Bulbul TTS
    let audioBase64: string | undefined = undefined;
    try {
      const speechBuffer = await synthesizeSpeech(spokenResponse, langCode);
      if (speechBuffer) {
        audioBase64 = speechBuffer.toString("base64");
      }
    } catch (ttsErr) {
      logger.warn("TTS synthesis warning in voice agent:", ttsErr);
    }

    return {
      success: true,
      transcript,
      spokenResponse,
      audioBase64,
      bookingCard: {
        itemId: matchedItem.id,
        title: matchedItem.title,
        image: matchedItem.image,
        category: matchedItem.category,
        locality: matchedItem.locality,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateRaw: startDate.toISOString().split("T")[0],
        endDateRaw: endDate.toISOString().split("T")[0],
        totalDays: days,
        pricing: {
          dailyPrice: matchedItem.dailyPrice,
          rentAmount,
          securityDeposit,
          totalAmount,
        },
      },
    };
  } catch (err: any) {
    logger.error("Error running voice booking agent:", err);
    return {
      success: false,
      transcript: "",
      spokenResponse: "माफ़ कीजिये, आपकी रिक्वेस्ट प्रोसेस करने में समस्या हुई। कृपया पुनः प्रयास करें।",
      message: err?.message || "Failed to process voice booking",
    };
  }
}
