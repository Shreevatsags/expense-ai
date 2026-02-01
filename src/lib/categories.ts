import { 
  Utensils, 
  Car, 
  Home, 
  GraduationCap, 
  ShoppingBag, 
  Zap, 
  Tv, 
  Wallet, 
  HelpCircle,
  LucideIcon 
} from "lucide-react";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Education",
  "Shopping",
  "Utilities",
  "Subscriptions",
  "Income",
  "Miscellaneous",
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_CONFIG: Record<Category, { icon: LucideIcon; color: string; bgColor: string }> = {
  Food: { 
    icon: Utensils, 
    color: "text-orange-400", 
    bgColor: "bg-orange-400/20" 
  },
  Transport: { 
    icon: Car, 
    color: "text-blue-400", 
    bgColor: "bg-blue-400/20" 
  },
  Rent: { 
    icon: Home, 
    color: "text-purple-400", 
    bgColor: "bg-purple-400/20" 
  },
  Education: { 
    icon: GraduationCap, 
    color: "text-cyan-400", 
    bgColor: "bg-cyan-400/20" 
  },
  Shopping: { 
    icon: ShoppingBag, 
    color: "text-pink-400", 
    bgColor: "bg-pink-400/20" 
  },
  Utilities: { 
    icon: Zap, 
    color: "text-yellow-400", 
    bgColor: "bg-yellow-400/20" 
  },
  Subscriptions: { 
    icon: Tv, 
    color: "text-red-400", 
    bgColor: "bg-red-400/20" 
  },
  Income: { 
    icon: Wallet, 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-400/20" 
  },
  Miscellaneous: { 
    icon: HelpCircle, 
    color: "text-gray-400", 
    bgColor: "bg-gray-400/20" 
  },
};

// Rule-based categorization keywords
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Food: [
    "swiggy", "zomato", "uber eats", "dominos", "pizza", "restaurant", 
    "cafe", "coffee", "starbucks", "mcdonalds", "kfc", "subway", 
    "grocery", "supermarket", "food", "lunch", "dinner", "breakfast",
    "bigbasket", "grofers", "blinkit", "zepto", "instamart"
  ],
  Transport: [
    "uber", "ola", "lyft", "rapido", "metro", "bus", "train", 
    "railway", "petrol", "diesel", "fuel", "gas station", "parking",
    "toll", "cab", "taxi", "auto", "rickshaw", "flight", "airline"
  ],
  Rent: [
    "rent", "lease", "landlord", "housing", "apartment", "flat",
    "maintenance", "society", "hoa"
  ],
  Education: [
    "school", "college", "university", "tuition", "course", "udemy",
    "coursera", "skillshare", "masterclass", "book", "kindle",
    "education", "training", "certification", "exam", "test"
  ],
  Shopping: [
    "amazon", "flipkart", "myntra", "ajio", "nykaa", "shopping",
    "mall", "store", "retail", "clothes", "electronics", "gadget",
    "fashion", "shoes", "accessories", "home decor"
  ],
  Utilities: [
    "electricity", "water", "gas", "internet", "wifi", "broadband",
    "phone", "mobile", "recharge", "bill", "utility", "sewage"
  ],
  Subscriptions: [
    "netflix", "spotify", "amazon prime", "hotstar", "disney",
    "youtube premium", "apple music", "hbo", "hulu", "subscription",
    "membership", "gym", "fitness", "club"
  ],
  Income: [
    "salary", "income", "credit", "refund", "cashback", "dividend",
    "interest", "bonus", "payment received", "transfer received",
    "deposit", "freelance", "consulting"
  ],
  Miscellaneous: [],
};

export function categorizeTransaction(description: string): Category {
  const lowerDescription = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "Miscellaneous") continue;
    
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        return category as Category;
      }
    }
  }
  
  return "Miscellaneous";
}

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_CONFIG[category as Category]?.icon || HelpCircle;
}

export function getCategoryColor(category: string): string {
  return CATEGORY_CONFIG[category as Category]?.color || "text-gray-400";
}

export function getCategoryBgColor(category: string): string {
  return CATEGORY_CONFIG[category as Category]?.bgColor || "bg-gray-400/20";
}
