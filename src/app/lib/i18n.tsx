import { createContext, ReactNode, useContext, useState } from "react";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অસમীয়া" },
  { code: "ur", label: "Urdu", native: "اردو" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

const DICT = {
  home: { en: "Home", hi: "होम", ta: "முகப்பு", te: "హోమ్" },
  advisor: { en: "AI Farm Advisor", hi: "एआई सलाहकार", ta: "AI ஆலோசகர்", te: "AI సలహాదారు" },
  cropHealth: { en: "Crop Health", hi: "फ़सल स्वास्थ्य", ta: "பயிர் ஆரோக்கியம்", te: "పంట ఆరోగ్యం" },
  marketplace: { en: "Groceries", hi: "किराना", ta: "மளிகை", te: "కిరాణా" },
  weather: { en: "Weather", hi: "मौसम", ta: "வானிலை", te: "వాతావరణం" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", ta: "டாஷ்போர்டு", te: "డాష్‌బోర్డ్" },
  schemes: { en: "Govt. Schemes", hi: "सरकारी योजनाएँ", ta: "அரசு திட்டங்கள்", te: "ప్రభుత్వ పథకాలు" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल", ta: "சுயவிவரம்", te: "ప్రొఫైల్" },
  getStarted: { en: "Get Started", hi: "शुरू करें", ta: "தொடங்குங்கள்", te: "ప్రారంభించండి" },
  
  // Dashboard translations
  welcomeBack: { en: "Welcome back", hi: "स्वागत है", ta: "மீண்டும் வருக", te: "స్వాగతం" },
  revenue: { en: "Revenue (30 days)", hi: "राजस्व (30 दिन)", ta: "வருவாய் (30 நாட்கள்)", te: "ఆదాయం (30 రోజులు)" },
  activeOrders: { en: "Active orders", hi: "सतत ऑर्डर", ta: "செயலில் உள்ள ஆர்டர்கள்", te: "యాక్టివ్ ఆర్డర్లు" },
  soilHealthScore: { en: "Soil Health Score", hi: "मिट्टी स्वास्थ्य स्कोर", ta: "மண் ஆரோக்கிய மதிப்பெண்", te: "నేల ఆరోగ్య స్కోరు" },
  sustainabilityScore: { en: "Sustainability score", hi: "सततता स्कोर", ta: "நிலைத்தன்மை மதிப்பெண்", te: "స్థిరత్వ స్కోరు" },
  soilHealth: { en: "Soil Health", hi: "मृदा स्वास्थ्य", ta: "மண் ஆரோக்கியம்", te: "నేల ఆరోగ్యం" },
  cropRecommendations: { en: "Crop Recommendations", hi: "फसल सिफारिशें", ta: "பயிர் பரிந்துரைகள்", te: "పంట సిఫార్సులు" },
  recentOrders: { en: "Recent Orders", hi: "हाल के ऑर्डर", ta: "சமீபத்திய ஆர்டர்கள்", te: "ఇటీవలి ఆర్డర్లు" },
  alerts: { en: "Alerts", hi: "चेतावनी", ta: "எச்சரிக்கைகள்", te: "హెచ్చరికలు" },
  todaysWeather: { en: "Today's Weather", hi: "आज का मौसम", ta: "இன்றைய வானிலை", te: "నేటి వాతావరణం" },
  marketPrices: { en: "Market Prices", hi: "बाजार मूल्य", ta: "சந்தை விலைகள்", te: "మార్కెట్ ధరలు" },
  listNewHarvest: { en: "List new harvest", hi: "नई फसल सूचीबद्ध करें", ta: "புதிய அறுவடையை பட்டியலிடுங்கள்", te: "కొత్త పంటను చేర్చండి" },
  viewFullReport: { en: "View full report", hi: "पूरी रिपोर्ट देखें", ta: "முழு அறிக்கையை காண்க", te: "పూర్తి నివేదిక చూడండి" },
  uploadNewReport: { en: "Upload new report", hi: "नई रिपोर्ट अपलोड करें", ta: "புதிய அறிக்கையை பதிவேற்றுக", te: "కొత్త నివేదిక అప్‌లోడ్ చేయి" },
  
  // Profile & Form fields
  saveChanges: { en: "Save changes", hi: "परिवर्तन सहेजें", ta: "மாற்றங்களைச் சேமி", te: "మార్పులను సేవ్ చేయి" },
  preferredLanguage: { en: "Preferred language", hi: "पसंदीदा भाषा", ta: "விருப்பமான மொழி", te: "అభిరుచిగల భాష" },
  farmLocation: { en: "Farm location", hi: "खेत का स्थान", ta: "பண்ணை இருப்பிடம்", te: "పంట పొలం ఉన్న ప్రదేశం" },
  farmSize: { en: "Farm size (Acres)", hi: "खेत का आकार (एकड़)", ta: "பண்ணை அளவு (ஏக்கர்)", te: "పొలం పరిమాణం (ఎకరాలు)" },
  primaryCrop: { en: "Primary crop", hi: "मुख्य फसल", ta: "முதன்மை பயிர்", te: "ప్రధాన పంట" },
  fullName: { en: "Full name", hi: "पूरा नाम", ta: "முழு பெயர்", te: "పూర్తి పేరు" },
  mobileNumber: { en: "Mobile number", hi: "मोबाइल नंबर", ta: "கைபேசி எண்", te: "మొబైల్ సంఖ్య" },
  verifiedFarmer: { en: "Verified farmer", hi: "सत्यापित किसान", ta: "சரிபார்க்கப்பட்ட விவசாயி", te: "ధృవీకరించబడిన రైతు" },
  
  // Advisor & Crop Health
  askAdvisor: { en: "Ask me anything about your farm", hi: "अपने खेत के बारे में कुछ भी पूछें", ta: "உங்கள் பண்ணை பற்றி எதையும் கேளுங்கள்", te: "మీ పంట పొలం గురించి ఏదైనా అడగండి" },
  diagnoseLeaf: { en: "Photograph a leaf, spot trouble early", hi: "पत्ती का चित्र लें, बीमारी जल्दी पहचानें", ta: "இலையை படம் எடுத்து நோய் கண்டறியவும்", te: "ఆకును ఫోటో తీసి తెగుళ్ళను గుర్తించండి" },
  uploadPhoto: { en: "Upload a photo", hi: "फोटो अपलोड करें", ta: "புகைப்படம் பதிவேற்றுக", te: "ఫోటో అప్‌లోడ్ చేయి" },
  organicOnly: { en: "Organic only", hi: "केवल जैविक", ta: "இயற்கை விவசாயம் மட்டும்", te: "కేవలం సేంద్రీయమైనవి" },
  schemesMatched: { en: "Schemes matched to your farm", hi: "आपके खेत से मेल खाती योजनाएं", ta: "உங்கள் பண்ணைக்கு பொருந்தும் திட்டங்கள்", te: "మీ పొలానికి సరిపోయే ప్రభుత్వ పథకాలు" },
} as const;

interface I18nContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: keyof typeof DICT) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>("en");
  const t = (key: keyof typeof DICT) => {
    const val = DICT[key] as Record<LangCode, string> | undefined;
    return val?.[lang] ?? val?.en ?? key;
  };
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
