export const farmer = {
  name: "Ramesh Kumar",
  village: "Kondapur, Medak District",
  state: "Telangana",
  farmSize: "4.2 acres",
  crops: ["Cotton", "Red Gram"],
  memberSince: "2024",
  phone: "+91 98•••••210",
};

export const soilReport = {
  uploadedOn: "2 days ago",
  healthScore: 68,
  nitrogen: { value: 240, unit: "kg/ha", status: "Low", ideal: "280–320" },
  phosphorus: { value: 18, unit: "kg/ha", status: "Adequate", ideal: "15–20" },
  potassium: { value: 210, unit: "kg/ha", status: "Adequate", ideal: "190–220" },
  ph: { value: 6.4, unit: "", status: "Good", ideal: "6.0–7.0" },
  organicCarbon: { value: 0.42, unit: "%", status: "Low", ideal: "0.5–0.75" },
  ec: { value: 0.31, unit: "dS/m", status: "Good", ideal: "<0.8" },
  moisture: { value: 22, unit: "%", status: "Good", ideal: "18–26" },
  summary:
    "Your soil is in fair condition. Nitrogen and organic carbon are below the ideal range, which can limit leaf growth and long-term fertility. Phosphorus, potassium and pH are healthy. Adding compost or FYM before the next sowing will help the most.",
  criticalIssues: [
    { title: "Nitrogen deficiency", severity: "medium", detail: "12–15% below the level red gram and cotton need for strong vegetative growth." },
    { title: "Low organic carbon", severity: "medium", detail: "Soil is losing structure over time; this affects water retention in the dry weeks." },
  ],
};

export const weather = {
  location: "Kondapur, Medak",
  current: { temp: 31, condition: "Partly cloudy", humidity: 64, wind: 11 },
  forecast7: [
    { day: "Today", high: 33, low: 24, rain: 10, icon: "cloud-sun" },
    { day: "Fri", high: 34, low: 25, rain: 5, icon: "sun" },
    { day: "Sat", high: 32, low: 24, rain: 40, icon: "cloud-rain" },
    { day: "Sun", high: 30, low: 23, rain: 65, icon: "cloud-rain" },
    { day: "Mon", high: 29, low: 22, rain: 55, icon: "cloud-rain" },
    { day: "Tue", high: 31, low: 23, rain: 20, icon: "cloud-sun" },
    { day: "Wed", high: 33, low: 24, rain: 8, icon: "sun" },
  ],
  risks: [
    { label: "Rainfall (7-day)", level: "Moderate", value: 58 },
    { label: "Heat stress", level: "Low", value: 22 },
    { label: "Flood risk", level: "Low", value: 12 },
    { label: "Drought risk (30-day)", level: "Moderate", value: 44 },
  ],
  seasonalNote:
    "The southwest monsoon is expected to remain active over Telangana for the next two weeks, with a wetter-than-average window around the weekend — good timing for topdressing nitrogen before rain.",
};

export const cropRecommendations = [
  {
    crop: "Red Gram (Tur Dal)",
    suitability: 92,
    expectedYield: "8–10 quintals/acre",
    water: "Low–Medium",
    profitability: "₹42,000–₹55,000/acre",
    risk: "Low",
    reason: "Matches current soil pH and nitrogen profile; deep roots improve soil structure and fix nitrogen for the next cycle.",
  },
  {
    crop: "Cotton (Bt hybrid)",
    suitability: 84,
    expectedYield: "14–16 quintals/acre",
    water: "Medium–High",
    profitability: "₹58,000–₹70,000/acre",
    risk: "Medium",
    reason: "Strong regional market and MSP support, but needs the nitrogen gap closed first to avoid boll shedding.",
  },
  {
    crop: "Green Gram (Moong) — intercrop",
    suitability: 77,
    expectedYield: "3–4 quintals/acre",
    water: "Low",
    profitability: "₹18,000–₹24,000/acre",
    risk: "Low",
    reason: "Short duration cover/companion crop between main sowings; restores organic matter before the next season.",
  },
];

export const irrigationPlan = [
  { day: "Mon", action: "Irrigate", amount: "22mm", note: "Topsoil dry at 4cm" },
  { day: "Tue", action: "Skip", amount: "—", note: "Rain expected (65%)" },
  { day: "Wed", action: "Skip", amount: "—", note: "Soil still moist from rain" },
  { day: "Thu", action: "Irrigate", amount: "15mm", note: "Light top-up" },
  { day: "Fri", action: "Irrigate", amount: "20mm", note: "Flowering stage — critical" },
  { day: "Sat", action: "Skip", amount: "—", note: "Rain expected (40%)" },
  { day: "Sun", action: "Monitor", amount: "—", note: "Check moisture before deciding" },
];

export const fertilizerPlan = {
  items: [
    { name: "Urea (Nitrogen)", qty: "45 kg/acre", schedule: "Split: 40% now, 30% at flowering, 30% at pod fill", cost: "₹1,150" },
    { name: "DAP (starter)", qty: "18 kg/acre", schedule: "One-time, at sowing", cost: "₹1,080" },
    { name: "Farmyard manure (organic)", qty: "1.5 tonnes/acre", schedule: "2 weeks before sowing", cost: "₹2,400" },
    { name: "Zinc sulphate (micronutrient)", qty: "5 kg/acre", schedule: "Basal application", cost: "₹420" },
  ],
  organicAlternative: "Replace urea split-doses with composted poultry manure + vermicompost — slower release, similar 90-day nitrogen availability, ~30% lower cost.",
};

export const diseaseLibrary = [
  {
    id: "leaf-blight",
    name: "Bacterial Leaf Blight",
    confidence: 87,
    crop: "Cotton",
    causes: "Wet-humid conditions after recent rain; spreads through water splash and contaminated tools.",
    prevention: "Avoid overhead irrigation during humid spells; remove and destroy infected leaves; rotate with non-host crops.",
    organicControl: "Neem oil spray (5ml/litre) every 7 days; copper-based organic fungicide.",
    chemicalControl: "Streptocycline + copper oxychloride spray, 2g + 3g per litre, repeat after 10 days.",
  },
  {
    id: "aphid",
    name: "Aphid Infestation",
    confidence: 91,
    crop: "Red Gram",
    causes: "Dry warm spells with new tender growth attract aphid colonies on the underside of leaves.",
    prevention: "Encourage ladybird beetles; avoid excess nitrogen which causes soft new growth.",
    organicControl: "Soap-water spray (1%) or neem-based bio-pesticide every 5 days.",
    chemicalControl: "Imidacloprid 17.8% SL, 0.3ml/litre, spray in the evening.",
  },
];

export const marketPrices = [
  { crop: "Cotton", price: 7250, unit: "quintal", change: 2.4, msp: 7020 },
  { crop: "Red Gram", price: 8600, unit: "quintal", change: -1.1, msp: 7550 },
  { crop: "Paddy", price: 2280, unit: "quintal", change: 0.6, msp: 2183 },
  { crop: "Maize", price: 2050, unit: "quintal", change: 1.8, msp: 2090 },
];

export const products = [
  {
    id: "p1",
    name: "Organic Red Gram (Tur Dal)",
    farmer: "Ramesh Kumar",
    location: "Kondapur, Medak",
    price: 118,
    unit: "kg",
    quality: "Grade A",
    freshness: 94,
    harvestDate: "3 days ago",
    organic: true,
    soilHealthScore: 68,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
  },
  {
    id: "p2",
    name: "Farm-Fresh Tomatoes",
    farmer: "Lakshmi Devi",
    location: "Sangareddy",
    price: 32,
    unit: "kg",
    quality: "Grade A",
    freshness: 98,
    harvestDate: "Today",
    organic: false,
    soilHealthScore: 74,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfad?w=600&q=80",
  },
  {
    id: "p3",
    name: "Desi Cotton (Raw)",
    farmer: "Venkat Rao",
    location: "Nizamabad",
    price: 72,
    unit: "kg",
    quality: "Grade B+",
    freshness: 88,
    harvestDate: "1 week ago",
    organic: false,
    soilHealthScore: 61,
    image: "https://images.unsplash.com/photo-1594475701973-c8c2d3d8e0b9?w=600&q=80",
  },
  {
    id: "p4",
    name: "Pesticide-Free Green Gram",
    farmer: "Anitha Reddy",
    location: "Karimnagar",
    price: 145,
    unit: "kg",
    quality: "Grade A",
    freshness: 91,
    harvestDate: "2 days ago",
    organic: true,
    soilHealthScore: 79,
    image: "https://images.unsplash.com/photo-1515543904379-3d757abe72ea?w=600&q=80",
  },
];

export const governmentSchemes = [
  {
    id: "s1",
    name: "PM-KISAN",
    type: "Direct Income Support",
    benefit: "₹6,000/year in 3 installments",
    eligibility: "All landholding farmer families",
    match: 96,
  },
  {
    id: "s2",
    name: "Pradhan Mantri Fasal Bima Yojana",
    type: "Crop Insurance",
    benefit: "Premium as low as 2% of sum insured for Kharif crops",
    eligibility: "Farmers growing notified crops (Cotton, Red Gram qualify in Telangana)",
    match: 91,
  },
  {
    id: "s3",
    name: "Rythu Bandhu (Telangana)",
    type: "State Investment Support",
    benefit: "₹5,000/acre per season",
    eligibility: "Land-owning farmers in Telangana",
    match: 98,
  },
  {
    id: "s4",
    name: "Kisan Credit Card",
    type: "Low-Interest Loan",
    benefit: "Crop loans at 4% effective interest (with subvention)",
    eligibility: "Any active farmer, minimal paperwork",
    match: 85,
  },
];

export const advisorSuggestedQuestions = [
  "Why are my cotton leaves turning yellow?",
  "When should I irrigate this week?",
  "Which fertilizer should I use for red gram?",
  "Will it rain in the next 3 days?",
  "When should I harvest my cotton?",
];
