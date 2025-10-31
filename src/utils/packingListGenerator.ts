export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
  essential: boolean;
}

export interface PackingCategory {
  id: string;
  name: string;
  icon: string;
  items: PackingItem[];
}

const baseItems = {
  clothing: [
    { name: "Underwear", essential: true },
    { name: "Socks", essential: true },
    { name: "T-shirts", essential: true },
    { name: "Pants/Jeans", essential: true },
    { name: "Shoes", essential: true },
    { name: "Jacket", essential: false },
    { name: "Sweater", essential: false },
    { name: "Shorts", essential: false },
    { name: "Pajamas", essential: true },
  ],
  toiletries: [
    { name: "Toothbrush & Toothpaste", essential: true },
    { name: "Deodorant", essential: true },
    { name: "Shampoo & Conditioner", essential: true },
    { name: "Soap/Body Wash", essential: true },
    { name: "Sunscreen", essential: false },
    { name: "Razor", essential: false },
    { name: "Medications", essential: true },
    { name: "First Aid Kit", essential: false },
  ],
  electronics: [
    { name: "Phone Charger", essential: true },
    { name: "Power Bank", essential: false },
    { name: "Laptop & Charger", essential: false },
    { name: "Camera", essential: false },
    { name: "Headphones", essential: false },
    { name: "Travel Adapter", essential: false },
  ],
  documents: [
    { name: "Passport/ID", essential: true },
    { name: "Travel Insurance", essential: false },
    { name: "Booking Confirmations", essential: true },
    { name: "Credit Cards", essential: true },
    { name: "Cash", essential: true },
    { name: "Driver's License", essential: false },
  ],
};

export function generatePackingList(
  tripType: string,
  destination: string,
  weather?: string
): PackingCategory[] {
  const categories: PackingCategory[] = [
    {
      id: "clothing",
      name: "Clothing",
      icon: "👕",
      items: baseItems.clothing.map((item, idx) => ({
        ...item,
        id: `clothing-${idx}`,
        category: "clothing",
        packed: false,
      })),
    },
    {
      id: "toiletries",
      name: "Toiletries",
      icon: "🧴",
      items: baseItems.toiletries.map((item, idx) => ({
        ...item,
        id: `toiletries-${idx}`,
        category: "toiletries",
        packed: false,
      })),
    },
    {
      id: "electronics",
      name: "Electronics",
      icon: "🔌",
      items: baseItems.electronics.map((item, idx) => ({
        ...item,
        id: `electronics-${idx}`,
        category: "electronics",
        packed: false,
      })),
    },
    {
      id: "documents",
      name: "Travel Documents",
      icon: "📄",
      items: baseItems.documents.map((item, idx) => ({
        ...item,
        id: `documents-${idx}`,
        category: "documents",
        packed: false,
      })),
    },
  ];

  // Add trip-specific items
  if (tripType === "business") {
    categories[0].items.push({
      id: "clothing-business-1",
      name: "Business Suit",
      category: "clothing",
      packed: false,
      essential: true,
    });
    categories[0].items.push({
      id: "clothing-business-2",
      name: "Dress Shoes",
      category: "clothing",
      packed: false,
      essential: true,
    });
    categories[2].items.push({
      id: "electronics-business-1",
      name: "Business Cards",
      category: "electronics",
      packed: false,
      essential: true,
    });
  }

  if (tripType === "adventure") {
    categories.push({
      id: "adventure",
      name: "Adventure Gear",
      icon: "⛰️",
      items: [
        {
          id: "adventure-1",
          name: "Hiking Boots",
          category: "adventure",
          packed: false,
          essential: true,
        },
        {
          id: "adventure-2",
          name: "Backpack",
          category: "adventure",
          packed: false,
          essential: true,
        },
        {
          id: "adventure-3",
          name: "Water Bottle",
          category: "adventure",
          packed: false,
          essential: true,
        },
        {
          id: "adventure-4",
          name: "Flashlight",
          category: "adventure",
          packed: false,
          essential: false,
        },
      ],
    });
  }

  if (tripType === "leisure" || tripType === "family") {
    categories[0].items.push({
      id: "clothing-leisure-1",
      name: "Swimsuit",
      category: "clothing",
      packed: false,
      essential: false,
    });
    categories[0].items.push({
      id: "clothing-leisure-2",
      name: "Sandals",
      category: "clothing",
      packed: false,
      essential: false,
    });
  }

  // Weather-based additions (mock for now)
  if (weather?.includes("rain")) {
    categories[0].items.push({
      id: "clothing-weather-1",
      name: "Rain Jacket",
      category: "clothing",
      packed: false,
      essential: true,
    });
    categories[0].items.push({
      id: "clothing-weather-2",
      name: "Umbrella",
      category: "clothing",
      packed: false,
      essential: true,
    });
  }

  return categories;
}
