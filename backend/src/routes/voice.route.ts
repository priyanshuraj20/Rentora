import { Router, Request, Response } from "express";
import { synthesizeSpeech } from "../service/voice.service";
import { runVoiceBookingAgent } from "../service/voiceAgent.service";
import { uploadAudioMemory } from "../middlewares/upload.middleware";

const router = Router();

// In-memory audio caches for zero latency & eliminating repeated API consumption
const audioCache = new Map<string, Buffer>();
const tourAudioCache = new Map<string, Buffer>();

export const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "en-IN", label: "English", native: "English", flag: "🌐" },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "ta-IN", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "bn-IN", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "kn-IN", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "pa-IN", label: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "od-IN", label: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
];

const WELCOME_MESSAGES: Record<string, string> = {
  "hi-IN": "नमस्ते! Rentora में आपका स्वागत है। अपने बिना इस्तेमाल किए सामान से कमाई करें, या अपनी पसंद की चीज़ें पड़ोस से आसानी से किराए पर लें।",
  "en-IN": "Welcome to Rentora! Turn your unused items into steady income, or rent whatever you need right in your neighborhood with verified escrow safety.",
  "gu-IN": "નમસ્તે! Rentora માં આપનું સ્વાગત છે. તમારી ન વપરાતી વસ્તુઓ ભાડે આપીને કમાણી કરો, અથવા જરૂરી સામાન સહેલાઈથી ભાડે મેળવો.",
  "mr-IN": "नमस्कार! Rentora मध्ये आपले स्वागत आहे. आपल्या न वापरलेल्या वस्तूंमधून दररोज कमाई करा, किंवा गरजेच्या गोष्टी शेजारून भाड्याने मिळवा.",
  "ta-IN": "வணக்கம்! Rentora-விற்கு அன்புடன் வரவேற்கிறோம். உங்களின் பயன்படாத பொருட்களை வாடகைக்கு விட்டு வருமானம் ஈட்டுங்கள்.",
  "te-IN": "నమస్కారం! Rentora కి స్వాగతం. మీ వస్తువులను అద్దెకు ఇచ్చి ఆదాయం పొందండి, లేదా మీకు కావాల్సినవి సులభంగా అద్దెకు తీసుకోండి.",
  "bn-IN": "নমস্কার! Rentora-তে আপনাকে স্বাগতম। আপনার অব্যবহৃত জিনিস ভাড়া দিয়ে আয় করুন, अथवा প্রয়োজনীয় জিনিস সহজে ভাড়া নিন।",
  "kn-IN": "ನಮಸ್ಕಾರ! Rentora ಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಬಳಕೆಯಾಗದ ವಸ್ತುಗಳನ್ನು ಬಾಡಿಗೆಗೆ ನೀಡಿ ಹಣ ಗಳಿಸಿ, અથવા ಅಗತ್ಯ ವಸ್ತುಗಳನ್ನು ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ.",
  "ml-IN": "നമസ്കാരം! Rentora-ലേക്ക് സ്വാഗതം. നിങ്ങളുടെ ഉപയോഗിക്കാത്ത സാധനങ്ങൾ വാടകയ്ക്ക് നൽകി വരുമാനം നേടൂ.",
  "pa-IN": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! Rentora ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਆਪਣੀਆਂ ਅਣਵਰਤੀਆਂ ਚੀਜ਼ਾਂ ਕਿਰਾਏ 'ਤੇ ਦੇ ਕੇ ਕਮਾਈ ਕਰੋ।",
  "od-IN": "ନମସ୍କାର! Rentora ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଆପଣଙ୍କ ଅଦରକାରୀ ଜିନିଷ ଭଡ଼ାରେ ଦେଇ ରୋଜଗାର କରନ୍ତୁ।",
};

export const TOUR_SCRIPTS: Record<string, Record<number, Record<string, string>>> = {
  renter: {
    1: {
      "hi-IN": "यहाँ सर्च बार से आप कैमरे, ड्रोन या टूल्स सर्च कर सकते हैं। आप बिना टाइप किए Voice Agent पर क्लिक करके बोलकर भी सामान बुक कर सकते हैं।",
      "en-IN": "Use the search bar to find cameras, drones, or equipment, or click Voice Agent to search and book simply by speaking in Hinglish.",
      "gu-IN": "અહીં સર્ચ બાર અને વોઇસ એજન્ટ દ્વારા બોલીને સરળતાથી ગિયર બુક કરો.",
      "mr-IN": "येथे सर्च बार आणि व्हॉइस एजंट द्वारे बोलून सामान सहज बुक करा.",
    },
    2: {
      "hi-IN": "यहाँ से आप अपना शहर चुन सकते हैं और रेडियस सेट कर सकते हैं, ताकि आपको सिर्फ़ अपने नज़दीक उपलब्ध सामान दिखे।",
      "en-IN": "Select your city and adjust the distance radius here to discover verified equipment available right in your neighborhood.",
      "gu-IN": "અહીંથી તમારું શહેર પસંદ કરો અને નજીકનો સામાન શોધો.",
      "mr-IN": "येथून आपले शहर निवडा आणि जवळचे सामान शोधा.",
    },
    3: {
      "hi-IN": "यहाँ सभी वेरीफ़ाइड आइटम्स उनकी फ़ोटो, रोज़ का किराया और डिपॉज़िट के साथ दिखते हैं। किसी भी सामान पर क्लिक करके बुक करें।",
      "en-IN": "Browse all verified items with high-res photos, daily rates, and security deposits. Click any item card to proceed to checkout.",
      "gu-IN": "અહીં બધી ચકાસાયેલ વસ્તુઓ જુઓ અને વિગતો મેળવો.",
      "mr-IN": "येथे सर्व पडताळणी केलेल्या वस्तूंचे दैनिक दर तपासा.",
    },
    4: {
      "hi-IN": "आपकी पेमेंट रेज़रपे एस्क्रो में सुरक्षित रहती है। जब आप सामान देखकर ओनर को 6-डिजिट पिन देंगे, तभी पेमेंट रिलीज़ होगी। माय रेंटल्स में अपनी बुकिंग्स ट्रैक करें!",
      "en-IN": "Your booking is protected by Razorpay escrow. Funds are locked until you inspect the gear and share your 6-digit PIN. Track bookings in My Rentals!",
      "gu-IN": "તમારી પેમેન્ટ રેઝરપે એસ્ક્રોમાં સુરક્ષિત છે અને 6-અંકના પિન પછી જ રિલીઝ થાય છે.",
      "mr-IN": "आपले पेमेंट रेझरपे एस्क्रोमध्ये सुरक्षित राहते आणि ६-अंकी पिन दिल्यानंतरच ट्रान्सफर होते.",
    },
  },
  owner: {
    1: {
      "hi-IN": "यहाँ आप अपने सभी लिस्टेड आइटम्स देख सकते हैं। आपके जितने भी कैमरे, ड्रोन या टूल्स रेंट पर उपलब्ध हैं, उनकी गिनती यहाँ दिखेगी।",
      "en-IN": "Here you can track your total listed assets. All cameras, drones, or equipment you have available for rent are displayed here.",
      "gu-IN": "અહીં તમે તમારી કુલ લિસ્ટેડ વસ્તુઓની સંખ્યા જોઈ શકો છો.",
      "mr-IN": "येथे आपण आपल्या एकूण लिस्ट केलेल्या वस्तूंची संख्या पाहू शकता.",
    },
    2: {
      "hi-IN": "नया सामान किराए पर देने के लिए Quick Actions में Add New Item पर क्लिक करें। फ़ोटो अपलोड करें, रोज़ का किराया और सिक्योरिटी डिपॉज़िट सेट करके तुरंत लाइव करें।",
      "en-IN": "To list new gear, click Add New Item in Quick Actions. Upload photos, set daily rental rates and security deposits to go live instantly.",
      "gu-IN": "નવો સામાન ભાડે આપવા Quick Actions માં Add New Item પર ક્લિક કરો.",
      "mr-IN": "नवीन सामान भाड्याने देण्यासाठी Quick Actions मध्ये Add New Item वर ક્લિક करा.",
    },
    3: {
      "hi-IN": "इस सेक्शन में आपके सभी ऐक्टिव रेंटल्स दिखेंगे। जब रेंटर सामान लेने आए, तो उनसे 6-डिजिट हैंडओवर पिन और वॉयस कंसेंट वेरिफ़ाई करें ताकि आपका सामान 100% सुरक्षित रहे।",
      "en-IN": "This section shows all ongoing bookings. When the renter arrives, verify their 6-digit PIN and acoustic voice consent for complete protection.",
      "gu-IN": "આ સેક્શનમાં તમારા એક્ટિવ રેન્ટલ્સ દેખાશે. સામાન આપતી વખતે 6-અંકનો પિન ચકાસો.",
      "mr-IN": "या भागात तुमचे सर्व ॲक्टिव्ह रेंटल्स दिसतील. हँडओव्हर वेळी ६-अंकी पिन तपासा.",
    },
    4: {
      "hi-IN": "यहाँ आपकी टोटल कमाई दिखेगी। जैसे ही सामान का हैंडओवर कम्प्लीट होता है, रेज़रपे एस्क्रो से आपकी कमाई सीधे आपके बैंक खाते में सुरक्षित ट्रांसफ़र हो जाती है।",
      "en-IN": "Here you can monitor your total earnings. Once handover is verified, your revenue is safely transferred from Razorpay escrow directly to your account.",
      "gu-IN": "અહીં તમારી કુલ કમાણી દેખાશે. હેન્ડઓવર પૂર્ણ થતાં જ પૈસા તમારા ખાતામાં જમા થશે.",
      "mr-IN": "येथे आपली एकूण कमाई दिसेल. हँडओव्हर पूर्ण झाल्यावर रक्कम थेट खात्यात जमा होते.",
    },
  },
};

const DASHBOARD_GUIDES: Record<string, Record<string, string>> = {
  owner: {
    "hi-IN": "नमस्ते ओनर! Rentora ओनर डैशबोर्ड में आपका स्वागत है। यहाँ आप Add New Item पर क्लिक करके अपने कैमरे, ड्रोन या टूल्स को लिस्ट कर सकते हैं। जब कोई रेंटर बुक करेगा, आपको तुरंत रिक्वेस्ट मिलेगी। सामान हैंडओवर करते समय 6-डिजिट पिन और वॉयस कंसेंट वेरीफाई करें। आपका पेमेंट सीधे आपके खाते में सुरक्षित ट्रांसफ़र होगा!",
    "en-IN": "Welcome to your Owner Dashboard! Click Add New Item to list your cameras, drones, or tools. When a renter books, you'll receive a request. Verify the 6-digit PIN and voice consent at handover, and payouts are transferred securely to your account!",
    "gu-IN": "નમસ્તે ઓનર! Rentora ડેશબોર્ડમાં આપનું સ્વાગત છે. તમારી વસ્તુઓ લિસ્ટ કરો અને નિયમિત કમાણી કરો.",
    "mr-IN": "नमस्कार ओनर! Rentora डॅशबोर्डमध्ये आपले स्वागत आहे. आपल्या वस्तू लिस्ट करा आणि दरमहा चांगली कमाई करा.",
  },
  renter: {
    "hi-IN": "नमस्ते रेंटर! Rentora में आपका स्वागत है। यहाँ आप Browse Gear से अपने आस-पास कोई भी कैमरा, ड्रोन या टूल्स आसानी से ढूंढ सकते हैं। बुकिंग के बाद, ओनर से मिलते वक्त अपना 6-डिजिट पिन और वॉयस कंसेंट देकर सामान रिसीव करें। रेज़रपे एस्क्रो के साथ आपका पैसा पूरी तरह सुरक्षित रहता है!",
    "en-IN": "Welcome to your Renter Dashboard! Browse gear nearby, track active rentals, and verify physical delivery with your 6-digit PIN and voice consent. Your money is completely protected by Razorpay escrow!",
    "gu-IN": "નમસ્તે રેન્ટર! અહીં તમે તમારી જરૂરિયાત મુજબ વસ્તુઓ શોધી શકો છો અને સુરક્ષિત રીતે ભાડે લઈ શકો છો.",
    "mr-IN": "नमस्कार रेंटर! येथे आपण सहजपणे सामान शोधू शकता आणि सुरक्षितपणे भाड्याने घेऊ शकता.",
  },
  gated: {
    "hi-IN": "नमस्ते! यह Autonomous Voice Agent केवल रेंटर्स के लिए उपलब्ध है। यहाँ आप बिना टाइप किए सिर्फ़ बोलकर कैमरा, ड्रोन या टूल्स सर्च कर सकते हैं और 1-Click में बुक कर सकते हैं। कृपया रेंटर के रूप में लॉगिन करें!",
    "en-IN": "Hello! The Autonomous Voice-to-Booking Agent is an exclusive feature for Renters. You can speak naturally in Hinglish to search gear and book in 1 click with escrow security. Please sign in as a Renter to use this feature!",
  },
};

/**
 * GET /api/v1/voice/languages
 * Returns list of supported Indic languages
 */
router.get("/languages", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: SUPPORTED_LANGUAGES,
    defaultLanguage: "hi-IN",
  });
});

/**
 * GET /api/v1/voice/welcome?lang=hi-IN
 * Streams Indic speech audio directly (WAV) synthesized via Sarvam AI
 */
router.get("/welcome", async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || "hi-IN";
    const selectedLang = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "hi-IN";

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // 1. Check in-memory cache
    if (audioCache.has(selectedLang)) {
      const cached = audioCache.get(selectedLang)!;
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(cached);
    }

    // 2. Synthesize using Sarvam AI Bulbul TTS
    const text = WELCOME_MESSAGES[selectedLang] || WELCOME_MESSAGES["hi-IN"];
    const audioBuffer = await synthesizeSpeech(text, selectedLang);

    if (!audioBuffer) {
      return res.status(503).json({
        success: false,
        message: "Voice synthesis currently unavailable",
      });
    }

    // Save to cache
    audioCache.set(selectedLang, audioBuffer);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(audioBuffer);
  } catch (error: any) {
    console.error("Welcome voice synthesis error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Internal error generating welcome audio",
    });
  }
});

/**
 * GET /api/v1/voice/tour?persona=renter&step=1&lang=hi-IN
 * Streams Indic speech audio for guided interactive tour steps
 */
router.get("/tour", async (req: Request, res: Response) => {
  try {
    const persona = ((req.query.persona as string) || "renter").toLowerCase();
    const step = parseInt((req.query.step as string) || "1", 10);
    const lang = (req.query.lang as string) || "hi-IN";

    const selectedPersona = TOUR_SCRIPTS[persona] ? persona : "renter";
    const selectedStep = Math.min(Math.max(step, 1), 4);
    const selectedLang = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "hi-IN";

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const cacheKey = `v3_${selectedPersona}_${selectedStep}_${selectedLang}`;

    // 1. Check tour cache
    if (tourAudioCache.has(cacheKey)) {
      const cached = tourAudioCache.get(cacheKey)!;
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(cached);
    }

    // 2. Find script text
    const personaScripts = TOUR_SCRIPTS[selectedPersona] || TOUR_SCRIPTS.renter;
    const stepScripts = personaScripts[selectedStep] || personaScripts[1];
    const text = stepScripts[selectedLang] || stepScripts["hi-IN"] || stepScripts["en-IN"];

    // 3. Synthesize via Sarvam AI
    const audioBuffer = await synthesizeSpeech(text, selectedLang);

    if (!audioBuffer) {
      return res.status(503).json({
        success: false,
        message: "Tour voice synthesis failed",
      });
    }

    // Cache buffer
    tourAudioCache.set(cacheKey, audioBuffer);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(audioBuffer);
  } catch (error: any) {
    console.error("Tour voice synthesis error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Internal error generating tour voice",
    });
  }
});

/**
 * GET /api/v1/voice/dashboard-guide?role=owner&lang=hi-IN
 * Streams Indic speech for role-specific dashboard tours (Owner / Renter / Gated Voice Agent)
 */
router.get("/dashboard-guide", async (req: Request, res: Response) => {
  try {
    const role = ((req.query.role as string) || "renter").toLowerCase();
    const lang = (req.query.lang as string) || "hi-IN";

    const selectedRole = DASHBOARD_GUIDES[role] ? role : "renter";
    const selectedLang = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "hi-IN";

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const cacheKey = `guide_${selectedRole}_${selectedLang}`;

    if (tourAudioCache.has(cacheKey)) {
      const cached = tourAudioCache.get(cacheKey)!;
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(cached);
    }

    const scripts = DASHBOARD_GUIDES[selectedRole] || DASHBOARD_GUIDES.renter;
    const text = scripts[selectedLang] || scripts["hi-IN"] || scripts["en-IN"];

    const audioBuffer = await synthesizeSpeech(text, selectedLang);

    if (!audioBuffer) {
      return res.status(503).json({ success: false, message: "Guide voice unavailable" });
    }

    tourAudioCache.set(cacheKey, audioBuffer);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(audioBuffer);
  } catch (error: any) {
    console.error("Dashboard guide voice error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Error generating guide" });
  }
});

/**
 * POST /api/v1/voice/speak
 * Dynamically synthesizes any text into speech
 */
router.post("/speak", async (req: Request, res: Response) => {
  try {
    const { text, languageCode = "hi-IN" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const audioBuffer = await synthesizeSpeech(text.slice(0, 500), languageCode);
    if (!audioBuffer) {
      return res.status(503).json({ success: false, message: "Speech synthesis failed" });
    }

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioBuffer.length);
    return res.status(200).send(audioBuffer);
  } catch (error: any) {
    console.error("Dynamic speech synthesis error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Speech synthesis error" });
  }
});

/**
 * POST /api/v1/voice/agent
 * Autonomous Voice-to-Booking Agent (Sarvam STT/TTS + Multi-step Entity & Inventory Booking Match)
 */
router.post("/agent", uploadAudioMemory, async (req: Request, res: Response) => {
  try {
    const audioBuffer = req.file?.buffer;
    const textQuery = (req.body.query as string) || (req.body.text as string) || "";
    const lang = (req.body.lang as string) || "hi-IN";

    const result = await runVoiceBookingAgent(audioBuffer, textQuery, lang);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Voice booking agent error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Internal error processing voice booking",
    });
  }
});

export default router;
