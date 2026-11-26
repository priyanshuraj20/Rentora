import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { synthesizeSpeech } from "../service/voice.service";
import { runVoiceBookingAgent } from "../service/voiceAgent.service";
import { uploadAudioMemory } from "../middlewares/upload.middleware";

const router = Router();

// In-memory audio caches for zero latency & eliminating repeated API consumption
const audioCache = new Map<string, Buffer>();
const tourAudioCache = new Map<string, Buffer>();

// Persistent disk cache directory for instant tour speech playback
const VOICE_CACHE_DIR = path.join(process.cwd(), "voice_tour_cache");
if (!fs.existsSync(VOICE_CACHE_DIR)) {
  try {
    fs.mkdirSync(VOICE_CACHE_DIR, { recursive: true });
  } catch (err) {
    console.warn("Could not create voice cache dir:", err);
  }
}

export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", label: "English", native: "English", flag: "🌐" },
  { code: "hi-IN", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
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
      "hi-IN": "आप अभी Rentora Renter Tour में हैं! महँगा सामान खरीदने की क्या ज़रूरत जब आप अपने पड़ोस से किराए पर ले सकते हैं? वीकेंड शूट या प्रोजेक्ट्स के लिए 4K कैमरे, ड्रोन, टूल्स और बाइक्स आसानी से रेंट करें।",
      "en-IN": "You are currently taking the Rentora Renter Tour! Why buy expensive equipment when you can borrow nearby? Rent verified 4K cameras, drones, power tools, and bikes for weekend shoots or DIY projects at a fraction of retail price.",
      "gu-IN": "તમે અત્યારે Rentora Renter Tour માં છો! મોંઘી વસ્તુઓ ખરીદવાને બદલે નજીકમાંથી કેમેરા, ડ્રોન અને ટૂલ્સ ભાડે મેળવો.",
      "mr-IN": "तुम्ही आता Rentora Renter Tour मध्ये आहात! महागडे सामान खरेदी करण्याऐवजी जवळच्या लोकांकडून कॅमेरा, ड्रोन आणि टूल्स भाड्याने घ्या.",
    },
    2: {
      "hi-IN": "बिना टाइप किए अपनी भाषा में बोलकर सामान ढूंढें और बुक करें। आपका रिफंडेबल सिक्योरिटी डिपॉज़िट एस्क्रो में पूरी तरह सुरक्षित रहता है और सामान सही लौटाने पर तुरंत रिफंड हो जाता है।",
      "en-IN": "No tedious typing needed! Speak naturally in Hindi, Hinglish, or English to find and book gear instantly. Your refundable security deposit is locked safely in escrow and automatically refunded when gear is returned in good condition.",
      "gu-IN": "બોલીને સામાન શોધો અને બુક કરો. તમારી સિક્યોરિટી ડિપોઝિટ એસ્ક્રોમાં સંપૂર્ણ સુરક્ષિત રહે છે.",
      "mr-IN": "व्हॉइसने बोलून सामान शोधा आणि बुक करा. तुमची सुरक्षा ठेव एस्क्रोमध्ये सुरक्षित राहते.",
    },
    3: {
      "hi-IN": "इलेक्ट्रॉनिक्स, टूल्स, फर्नीचर और व्हीकल्स जैसी लोकप्रिय कैटेगरीज़ एक्सप्लोर करें। अपनी ज़रूरत के अनुसार बेस्ट क्वालिटी गियर चुनें और 'View All Categories' पर क्लिक करके पूरा कैटलॉग देखें।",
      "en-IN": "Explore verified equipment across popular categories like Electronics, Tools, Furniture, and Vehicles. Find creator kits, cordless power drills, or city commuters ready for pickup near you.",
      "gu-IN": "ઇલેક્ટ્રોનિક્સ, ટૂલ્સ, ફર્નિચર અને વ્હીકલ્સ જેવી કેટેગરીઝ એક્સપ્લોર કરો.",
      "mr-IN": "इलेक्ट्रॉनिक्स, टूल्स, फर्निचर आणि वाहने यांसारख्या लोकप्रिय श्रेणी एक्सप्लोर करा.",
    },
    4: {
      "hi-IN": "आपका रेंटर टूर पूरा हुआ! अब रेंट शुरू करने के लिए नीचे दिए गए 'Browse All Equipment' बटन पर क्लिक करें, या सीधे Voice Booking से बोलकर सामान बुक करें।",
      "en-IN": "Your Renter Tour is complete! To start renting now, please click the 'Browse All Equipment' button below, or try hands-free Voice Booking to reserve gear instantly.",
      "gu-IN": "તમારો રેન્ટર ટૂર પૂર્ણ થયો! હવે રેન્ટ શરૂ કરવા માટે નીચે આપેલા 'Browse All Equipment' બટન પર ક્લિક કરો.",
      "mr-IN": "तुमचा रेंटर टूर पूर्ण झाला! आता भाड्याने घेण्यासाठी खालील 'Browse All Equipment' बटणावर क्लिक करा.",
    },
  },
  owner: {
    1: {
      "hi-IN": "आप अभी Rentora Owner Tour में हैं! अपने घर पर रखे कैमरे, ड्रोन या टूल्स को रेंट पर देकर आसान कमाई करें। आप खुद अपनी मर्ज़ी से रोज़ का किराया तय करते हैं, सिक्योरिटी डिपॉज़िट एस्क्रो में सुरक्षित लॉक रहता है और सीधे आपके बैंक खाते में कमाई आती है।",
      "en-IN": "You are currently taking the Rentora Owner Tour! Turn cameras, drones, or power tools lying around your home into steady income. You set your own daily rates, verified neighbors borrow safely, and security deposits are locked in escrow before gear is handed over.",
      "gu-IN": "તમે અત્યારે Rentora Owner Tour માં છો! ઘરમાં પડેલા કેમેરા, ડ્રોન અને ટૂલ્સ ભાડે આપીને સરળતાથી કમાણી કરો.",
      "mr-IN": "तुम्ही आता Rentora Owner Tour मध्ये आहात! घरातील कॅमेरा, ड्रोन आणि टूल्स भाड्याने देऊन नियमित कमाई सुरू करा.",
    },
    2: {
      "hi-IN": "सुरक्षा हमारी सबसे बड़ी प्राथमिकता है। जब रेंटर सामान लेने आता है, तो उनके 15-सेकंड डायनेमिक पिन को वेरिफ़ाई करके ही सामान रिलीज़ करें। रेज़रपे एस्क्रो के साथ आपका पेमेंट 100% सुरक्षित रहता है।",
      "en-IN": "Security is our top priority. Gear is released only when you verify the renter's 15-second dynamic PIN in person. With Razorpay platform escrow, your rental payment is 100% guaranteed with zero dispute risk.",
      "gu-IN": "સુરક્ષા સર્વોપરી છે. હેન્ડઓવર વખતે 15-સેકન્ડનો ડાયનેમિક પિન ચકાસીને જ સામાન આપો.",
      "mr-IN": "सुरक्षा आमचे प्राधान्य आहे. हँडઓવર वेळी १५-સેકંડાચા ડાયનૅમિક પિન તપાર્સુનચ સામાન સુપૂર્દ કરા.",
    },
    3: {
      "hi-IN": "इस कैलकुलेटर से देखें कि आपका सामान हर महीने कितनी कमाई कर सकता है। रेंटोरा केवल 10% फ़ीस लेता है और 90% नेट कमाई सीधे आपके बैंक खाते में आती है। 'List Your First Item' पर क्लिक करके आज ही शुरुआत करें।",
      "en-IN": "Use this income calculator to see how much your gear can earn per month. Rentora takes only a modest 10% platform fee, and you take home 90% net earnings directly to your bank account. Click 'List Your First Item' to go live in seconds.",
      "gu-IN": "આ કેલ્ક્યુલેટરથી જુઓ કે તમારી વસ્તુઓ દર મહિને કેટલી કમાણી કરી શકે છે. 90% કમાણી સીધી તમારા ખાતામાં જશે.",
      "mr-IN": "या कॅल्क्युलेटरने तपासा की आपले सामान दरमहा किती उत्पन्न देऊ शकते. ९०% कमाई थेट आपल्या खात्यात.",
    },
    4: {
      "hi-IN": "आपका ओनर टूर पूरा हुआ! अब अपनी कमाई शुरू करने के लिए नीचे दिए गए 'List Your First Item' बटन पर क्लिक करें और कुछ ही सेकंड में अपना सामान लाइव करें।",
      "en-IN": "Your Owner Tour is complete! To start earning today, please click the 'List Your First Item' button below to list your gear in seconds.",
      "gu-IN": "તમારો ઓનર ટૂર પૂર્ણ થયો! હવે કમાણી શરૂ કરવા માટે નીચે આપેલા 'List Your First Item' બટન પર ક્લિક કરો.",
      "mr-IN": "तुमचा ओनर टूर पूर्ण झाला! आता कमाई सुरू करण्यासाठी खालील 'List Your First Item' बटणावर क्लिक करा.",
    },
  },
  owner_portal: {
    1: {
      "hi-IN": "नमस्ते! आपके Rentora ओनर डैशबोर्ड में आपका स्वागत है। यहाँ आप अपनी लिस्टेड इक्विपमेंट, चालू रेंटल्स, और सीधे बैंक में आने वाली 90% नेट कमाई देख सकते हैं।",
      "en-IN": "Welcome to your Owner Dashboard! Here you can monitor your active equipment listings, track ongoing handovers with verified borrowers, and view your 90% net earnings deposited directly into your bank account.",
      "gu-IN": "નમસ્તે! તમારા Rentora ઓનર ડેશબોર્ડમાં સ્વાગત છે. અહીં તમે તમારા સાધનો, ભાડાની વિગતો અને બેંકમાં જમા થતી 90% કમાણી જોઈ શકો છો.",
      "mr-IN": "नमस्कार! आपल्या Rentora ओनर डॅशबोर्डमध्ये स्वागत आहे. येथे आपण आपली उपकरणे, भाड्याने दिलेले सामान आणि खात्यात जमा होणारी ९०% कमाई पाहू शकता.",
    },
    2: {
      "hi-IN": "यह है आपका लिस्टिंग्स पेज। यहाँ आप 60 सेकंड में नया सामान लिस्ट कर सकते हैं, रोज़ का किराया और एस्क्रो डिपॉज़िट तय कर सकते हैं, या ज़रूरत पड़ने पर लिस्टिंग पॉज़ कर सकते हैं।",
      "en-IN": "Here in Listings, you can publish new equipment with photo verification in 60 seconds. Set your daily price and security deposit, or pause any item whenever you need it personally.",
      "gu-IN": "આ છે લિસ્ટિંગ્સ પેજ. અહીં તમે નવા સાધનો લિસ્ટ કરી શકો છો, દૈનિક ભાડું નક્કી કરી શકો છો અને જરૂર પડ્યે વસ્તુ પોઝ કરી શકો છો.",
      "mr-IN": "हे आहे लिस्टिंग्स पेज. येथे आपण नवीन सामान लिस्ट करू शकता, दररोजचे भाडे ठरवू शकता आणि आवश्यकतेनुसार आयटम पॉज करू शकता.",
    },
    3: {
      "hi-IN": "बुकिंग्स टैब में, रेंटर द्वारा पिकअप फ़ोटो अपलोड करने के बाद 'Verify Renter PIN' पर क्लिक करके उनका 15-सेकंड डायनेमिक पिन दर्ज करें। वापसी पर आप स्वयं रिटर्न फ़ोटो अपलोड करें और 'Show Return PIN' बताएं ताकि रेंटर रिटर्न पूरा कर सके।",
      "en-IN": "In the Bookings tab, once the renter uploads pickup photos, click 'Verify Renter PIN' to enter their 15-second dynamic code. On return, inspect the gear, upload return condition photos, and share your 'Show Return PIN' so the renter can complete the return.",
      "gu-IN": "બુકિંગ્સમાં, રેન્ટર પિકઅપ ફોટો અપલોડ કરે પછી 'Verify Renter PIN' થી 15-સેકન્ડનો ડાયનેમિક પિન દાખલ કરો. પરત કરતી વખતે રિટર્ન ફોટો અપલોડ કરી 'Show Return PIN' બતાવો.",
      "mr-IN": "बुकिंग्स टॅबमध्ये, रेंटरने पिकअप फोटो अपलोड केल्यावर 'Verify Renter PIN' द्वारे १५-सेकंदाचा पिन नोंदवा. परत करताना रिटर्न फोटो अपलोड करून 'Show Return PIN' दाखवा.",
    },
    4: {
      "hi-IN": "अर्निंग्स टैब में आप अपनी पूरी कमाई देख सकते हैं। रेंटोरा पूरा पेमेंट एडमिन एस्क्रो में सुरक्षित रखता है, और सफल रिटर्न व AI फोटो वेरिफ़िकेशन के बाद केवल 10% फ़ीस काटकर 90% नेट कमाई आपके खाते में भेजता है।",
      "en-IN": "In Earnings, track your payout history. Rentora holds all funds in Admin Escrow until verified return and AI photo inspection, then deducts only a 10% platform fee and credits 90% net earnings to your account.",
      "gu-IN": "અર્નિંગ્સમાં તમારી કમાણી જુઓ. સફળ રિટર્ન અને ફોટો વેરિફિકેશન પછી 10% ફી કાપીને 90% ચોખ્ખી કમાણી તમારા ખાતામાં જમા થાય છે.",
      "mr-IN": "अर्निंग्समध्ये आपली कमाई पहा. यशस्वी रिटर्न आणि फोटो पडताळणीनंतर १०% फी वजा करून ९०% निव्वळ उत्पन्न आपल्या खात्यात जमा होते.",
    },
    5: {
      "hi-IN": "और अंत में, मैसेजेस टैब! यहाँ आप रेंटर के साथ सीधे चैट करके पिकअप का समय और जगह तय कर सकते हैं, और सुरक्षित हैंडओवर पूरा कर सकते हैं।",
      "en-IN": "Finally, the Messages tab! Chat directly with confirmed renters to coordinate equipment pickup location, inspect gear together, and ensure a seamless handover.",
      "gu-IN": "અને છેલ્લે મેસેજીસ! અહીં તમે રેટર્સ સાથે સીધી વાત કરીને પિકઅપનો સમય અને સ્થળ નક્કી કરી શકો છો.",
      "mr-IN": "आणि शेवटी मेसेजेस! येथे आपण भाडेकरूंशी थेट संवाद साधून पिकअप वेळ आणि जागा ठरवू शकता.",
    },
  },
  renter_portal: {
    1: {
      "hi-IN": "नमस्ते! Rentora रेंटर पोर्टल में आपका स्वागत है। यहाँ आप अपने आस-पास 4K कैमरे, ड्रोन, टूल्स और बाइक्स आसानी से सर्च और रेंट कर सकते हैं।",
      "en-IN": "Welcome to your Renter Portal! Search verified cameras, drones, power tools, or bikes near you using the GPS search bar, with 100% refundable escrow protection.",
      "gu-IN": "નમસ્તે! Rentora રેન્ટર પોર્ટલમાં સ્વાગત છે. નજીકમાંથી કેમેરા, ડ્રોન અને ટૂલ્સ સરળતાથી શોધો અને ભાડે મેળવો.",
      "mr-IN": "नमस्कार! Rentora रेंटर पोर्टलमध्ये स्वागत आहे. आपल्या जवळ कॅमेरा, ड्रोन आणि टूल्स सहज शोधा आणि भाड्याने घ्या.",
    },
    2: {
      "hi-IN": "माई रेंटल्स में अपनी बुकिंग्स ट्रैक करें। पिकअप पर पहले कंडीशन फ़ोटो अपलोड करें, फिर अपना 15-सेकंड डायनेमिक Handover PIN ओनर को बताएं। वापसी पर ओनर रिटर्न फ़ोटो अपलोड करके Return PIN देंगे, जिसे दर्ज करते ही आपकी सिक्योरिटी डिपॉज़िट रेज़रपे से वापस मिल जाएगी!",
      "en-IN": "In My Rentals, upload pickup condition photos first to unlock your 15-second dynamic Handover PIN for the owner. On return, the owner inspects the gear, uploads return photos, and shares their Return PIN so you can claim your Razorpay security deposit refund!",
      "gu-IN": "માય રેન્ટલ્સમાં, પહેલા પિકઅપ ફોટો અપલોડ કરી 15-સેકન્ડનો Handover PIN બતાવો. રિટર્ન વખતે ઓનર ફોટો અપલોડ કરી Return PIN આપશે, જેનાથી ડિપોઝિટ રિફંડ મળશે!",
      "mr-IN": "माय रेंटल्समध्ये, प्रथम पिकअप फोटो अपलोड करून १५-सेकंदाचा Handover PIN दाखवा. परत करताना ओनर फोटो अपलोड करून Return PIN देतील, ज्यामुळे डिपॉझिट परत मिळेल!",
    },
    3: {
      "hi-IN": "विशलिस्ट में आप अपने पसंदीदा कैमरे या टूल्स सेव कर सकते हैं, ताकि अगली बार शूट या ट्रिप के लिए सिर्फ एक क्लिक में तुरंत बुक कर सकें।",
      "en-IN": "In Wishlist, save equipment you want to rent for upcoming video shoots, weekend trips, or DIY projects for fast 1-click booking anytime.",
      "gu-IN": "વિશલિસ્ટમાં મનપસંદ સાધનો સેવ કરો અને ભવિષ્યના પ્રોજેક્ટ માટે 1-ક્લિકમાં બુક કરો.",
      "mr-IN": "विशलिस्टमध्ये आवडीचे सामान सेव्ह करा आणि पुढील प्रोजेक्टसाठी त्वरित बुक करा.",
    },
    4: {
      "hi-IN": "मैसेजेस टैब में आप सामान के मालिक से सीधे चैट करके मिलने का समय तय कर सकते हैं और सामान से जुड़े कोई भी सवाल पूछ सकते हैं।",
      "en-IN": "In Messages, chat directly with equipment owners to coordinate pickup timing, ask questions about accessories, and verify item condition.",
      "gu-IN": "મેસેજીસમાં ઓનર સાથે સીધી વાત કરીને પિકઅપ સમય નક્કી કરો અને પ્રશ્નો પૂછો.",
      "mr-IN": "मेसेजेसमध्ये मालकांशी थेट बोलून पिकअप वेळ ठरवा आणि शंका विचारा.",
    },
  },
};

const DASHBOARD_GUIDES: Record<string, Record<string, string>> = {
  owner: {
    "hi-IN": "नमस्ते ओनर! Rentora ओनर डैशबोर्ड में आपका स्वागत है। यहाँ आप Add New Item पर क्लिक करके अपने कैमरे, ड्रोन या टूल्स लिस्ट कर सकते हैं। पिकअप पर रेंटर की फ़ोटो और 15-सेकंड डायनेमिक पिन वेरिफ़ाई करें। वापसी पर स्वयं रिटर्न फ़ोटो अपलोड करके Return PIN दें, और सफल वेरिफ़िकेशन के बाद 90% नेट कमाई पाएं!",
    "en-IN": "Welcome to your Owner Dashboard! Click Add New Item to list equipment. At pickup, verify the renter's pickup photos and 15-second dynamic PIN. On return, upload return inspection photos and share your Return PIN to receive your 90% net payout from Admin Escrow!",
    "gu-IN": "નમસ્તે ઓનર! Rentora ડેશબોર્ડમાં સ્વાગત છે. પિકઅપ વખતે 15-સેકન્ડનો પિન ચકાસો અને રિટર્ન વખતે ફોટો અપલોડ કરી Return PIN આપો.",
    "mr-IN": "नमस्कार ओनर! Rentora डॅशबोर्डमध्ये स्वागत आहे. पिकअप वेळी १५-सेकंदाचा पिन तपासा आणि परत करताना फोटो अपलोड करून Return PIN द्या.",
  },
  renter: {
    "hi-IN": "नमस्ते रेंटर! Rentora में आपका स्वागत है। यहाँ आप Browse Gear से अपने आस-पास कोई भी कैमरा, ड्रोन या टूल्स आसानी से ढूंढ सकते हैं। पिकअप के समय अपना 15-सेकंड डायनेमिक पिन दिखाकर सामान रिसीव करें, और वापसी पर ओनर का रिटर्न पिन डालकर 100% एस्क्रो रिफ़ंड पाएं!",
    "en-IN": "Welcome to your Renter Dashboard! Browse gear nearby, track active rentals, and present your 15-second dynamic PIN at pickup. On return, enter the owner's Return PIN to claim your instant 100% deposit refund!",
    "gu-IN": "નમસ્તે રેન્ટર! અહીં તમે વસ્તુઓ શોધી શકો છો. પિકઅપ વખતે 15-સેકન્ડનો પિન આપો અને રિટર્ન વખતે ઓનરનો પિન નાખી ડિપોઝિટ રિફંડ મેળવો.",
    "mr-IN": "नमस्कार रेंटर! येथे आपण सामान शोधू शकता. पिकअप वेळी १५-सेकंदाचा पिन द्या आणि परतीच्या वेळी ओनरचा पिन टाकून संपूर्ण डिपॉझिट परत मिळवा.",
  },
  gated: {
    "hi-IN": "नमस्ते! Rentora Voice Booking में आपका स्वागत है। यहाँ आप बोलकर कैमरा, ड्रोन या टूल्स आसानी से ढूंढ सकते हैं।",
    "en-IN": "Welcome to Rentora Voice Booking! Speak naturally in Hindi, Hinglish, or English to find equipment nearby with escrow protection.",
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
    defaultLanguage: "en-IN",
  });
});

/**
 * GET /api/v1/voice/welcome?lang=en-IN
 * Streams Indic speech audio directly (WAV) synthesized via Sarvam AI
 */
router.get("/welcome", async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || "en-IN";
    const selectedLang = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "en-IN";

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
    const text = WELCOME_MESSAGES[selectedLang] || WELCOME_MESSAGES["en-IN"] || WELCOME_MESSAGES["hi-IN"];
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
 * GET /api/v1/voice/tour?persona=renter&step=1&lang=en-IN
 * Streams Indic speech audio for guided interactive tour steps
 */
router.get("/tour", async (req: Request, res: Response) => {
  try {
    const persona = ((req.query.persona as string) || "renter").toLowerCase();
    const step = parseInt((req.query.step as string) || "1", 10);
    const lang = (req.query.lang as string) || "en-IN";

    const selectedPersona = TOUR_SCRIPTS[persona] ? persona : "renter";
    const personaScripts = TOUR_SCRIPTS[selectedPersona] || TOUR_SCRIPTS.renter;
    const maxSteps = Object.keys(personaScripts).length || 4;
    const selectedStep = Math.min(Math.max(step, 1), maxSteps);
    const selectedLang = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "en-IN";

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const cacheKey = `v9_${selectedPersona}_${selectedStep}_${selectedLang}`;
    const diskPath = path.join(VOICE_CACHE_DIR, `${cacheKey}.wav`);

    // 1. Check in-memory tour cache
    if (tourAudioCache.has(cacheKey)) {
      const cached = tourAudioCache.get(cacheKey)!;
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(cached);
    }

    // 2. Check persistent disk cache (instant < 2ms response)
    if (fs.existsSync(diskPath)) {
      try {
        const fileBuf = fs.readFileSync(diskPath);
        tourAudioCache.set(cacheKey, fileBuf);
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Content-Length", fileBuf.length);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.status(200).send(fileBuf);
      } catch (readErr) {
        console.warn("Error reading cached tour wav file:", readErr);
      }
    }

    // 3. Find script text
    const stepScripts = personaScripts[selectedStep] || personaScripts[1];
    const text = stepScripts[selectedLang] || stepScripts["en-IN"] || stepScripts["hi-IN"] || Object.values(stepScripts)[0];

    // 4. Synthesize via Sarvam AI
    const audioBuffer = await synthesizeSpeech(text, selectedLang);

    if (!audioBuffer) {
      return res.status(503).json({
        success: false,
        message: "Tour voice synthesis failed",
      });
    }

    // Cache in memory and persist to disk
    tourAudioCache.set(cacheKey, audioBuffer);
    try {
      fs.writeFileSync(diskPath, audioBuffer);
    } catch (saveErr) {
      console.warn("Error saving tour wav to disk:", saveErr);
    }

    // Background pre-warm remaining steps so next clicks are 0ms instant
    Object.keys(personaScripts).map(Number).forEach((s) => {
      if (s !== selectedStep) {
        const nextKey = `v9_${selectedPersona}_${s}_${selectedLang}`;
        const nextDiskPath = path.join(VOICE_CACHE_DIR, `${nextKey}.wav`);
        if (!tourAudioCache.has(nextKey) && !fs.existsSync(nextDiskPath)) {
          setTimeout(async () => {
            try {
              const sText = personaScripts[s]?.[selectedLang] || personaScripts[s]?.["en-IN"];
              if (sText) {
                const buf = await synthesizeSpeech(sText, selectedLang);
                if (buf) {
                  fs.writeFileSync(nextDiskPath, buf);
                  tourAudioCache.set(nextKey, buf);
                }
              }
            } catch (_) {}
          }, 300 * s);
        }
      }
    });

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
 * GET /api/v1/voice/dashboard-guide?role=owner&lang=en-IN
 * Streams Indic speech for role-specific dashboard tours (Owner / Renter / Gated Voice Agent)
 */
router.get("/dashboard-guide", async (req: Request, res: Response) => {
  try {
    const role = ((req.query.role as string) || "renter").toLowerCase();
    const lang = (req.query.lang as string) || "en-IN";

    const selectedRole = DASHBOARD_GUIDES[role] ? role : "renter";
    const selectedLang = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "en-IN";

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const cacheKey = `guide_v8_${selectedRole}_${selectedLang}`;

    if (tourAudioCache.has(cacheKey)) {
      const cached = tourAudioCache.get(cacheKey)!;
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(cached);
    }

    const scripts = DASHBOARD_GUIDES[selectedRole] || DASHBOARD_GUIDES.renter;
    const text = scripts[selectedLang] || scripts["en-IN"] || scripts["hi-IN"];

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
    const { text, languageCode = "en-IN" } = req.body;
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
    const lang = (req.body.lang as string) || "en-IN";

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
