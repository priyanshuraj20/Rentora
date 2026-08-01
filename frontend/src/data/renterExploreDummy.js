const renterExploreDummy = [
  {
    id: "r1",
    title: "Sony A7 IV Mirrorless Camera",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1606986628470-26a67fa4730c",
    pricing: { daily: 850, weekly: 5000, monthly: 15000 },

    booking: {
      securityDeposit: 500,
      serviceFee: 42,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: ["2026-02-12", "2026-02-20"],
        minRentalDays: 1,
        maxRentalDays: 60,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 5000 },
    },

    description: "Professional mirrorless camera with 33MP sensor and 4K video.",
    rating: 4.9,
    totalReviews: 124,
    featured: true,
    distanceKm: 2.4,
    location: "Bhubaneswar",
    owner: { name: "Rahul Verma", rating: 4.8 },
    specs: [
      { label: "Sensor", value: "33MP Full Frame" },
      { label: "Video", value: "4K 60fps" },
    ],
    guidelines: ["Handle with care", "No water exposure"],
  },

  {
    id: "r2",
    title: "DJI Mavic 3 Pro Drone",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e",
    pricing: { daily: 950, weekly: 5800, monthly: 17000 },

    booking: {
      securityDeposit: 700,
      serviceFee: 50,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: ["2026-02-15"],
        minRentalDays: 2,
        maxRentalDays: 30,
      },
      policies: {
        checkInAfter: "09:00",
        checkOutBefore: "13:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 8000 },
    },

    description: "Triple-camera drone with 43 min flight time.",
    rating: 4.8,
    totalReviews: 88,
    featured: true,
    distanceKm: 1.2,
    location: "Bhubaneswar",
    owner: { name: "Ankit Sharma", rating: 4.7 },
    specs: [
      { label: "Flight Time", value: "43 min" },
      { label: "Camera", value: "4/3 CMOS" },
    ],
    guidelines: ["Fly only in permitted zones", "Return with full battery"],
  },

  {
    id: "r3",
    title: "MacBook Pro 16-inch (M2)",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    pricing: { daily: 1200, weekly: 7200, monthly: 22000 },

    booking: {
      securityDeposit: 1500,
      serviceFee: 60,
      discounts: { weeklyPercent: 8, monthlyPercent: 12 },
      availability: {
        blockedDates: [],
        minRentalDays: 3,
        maxRentalDays: 45,
      },
      policies: {
        checkInAfter: "11:00",
        checkOutBefore: "15:00",
        lateReturnHours: 6,
      },
      protection: { included: true, coverageAmount: 10000 },
    },

    description: "High-performance laptop for editing and development.",
    rating: 4.9,
    totalReviews: 201,
    featured: false,
    distanceKm: 3.1,
    location: "Cuttack",
    owner: { name: "Saurav Das", rating: 4.9 },
    specs: [
      { label: "Chip", value: "Apple M2" },
      { label: "RAM", value: "32 GB" },
    ],
    guidelines: ["No liquid exposure", "No OS modification"],
  },

  {
    id: "r4",
    title: "PS5 Console",
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3",
    pricing: { daily: 500, weekly: 3000, monthly: 9000 },

    booking: {
      securityDeposit: 600,
      serviceFee: 40,
      discounts: { weeklyPercent: 10, monthlyPercent: 20 },
      availability: {
        blockedDates: ["2026-02-18"],
        minRentalDays: 1,
        maxRentalDays: 30,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 3,
      },
      protection: { included: true, coverageAmount: 4000 },
    },

    description: "PlayStation 5 with two controllers and games.",
    rating: 4.7,
    totalReviews: 152,
    featured: false,
    distanceKm: 0.9,
    location: "Bhubaneswar",
    owner: { name: "Aman Patel", rating: 4.6 },
    specs: [
      { label: "Storage", value: "825GB SSD" },
      { label: "Controllers", value: "2 Included" },
    ],
    guidelines: ["No physical damage", "Return controllers charged"],
  },

  {
    id: "r5",
    title: "Royal Enfield Classic 350",
    category: "Vehicles",
    image: "https://images.unsplash.com/photo-1694956792421-e946fff94564",
    pricing: { daily: 900, weekly: 5500, monthly: 18000 },

    booking: {
      securityDeposit: 2000,
      serviceFee: 75,
      discounts: { weeklyPercent: 5, monthlyPercent: 10 },
      availability: {
        blockedDates: ["2026-02-22"],
        minRentalDays: 1,
        maxRentalDays: 15,
      },
      policies: {
        checkInAfter: "08:00",
        checkOutBefore: "12:00",
        lateReturnHours: 2,
      },
      protection: { included: true, coverageAmount: 15000 },
    },

    description: "Cruiser bike perfect for city and highway rides.",
    rating: 4.8,
    totalReviews: 97,
    featured: true,
    distanceKm: 4.5,
    location: "Bhubaneswar",
    owner: { name: "Vikram Singh", rating: 4.7 },
    specs: [
      { label: "Engine", value: "349cc" },
      { label: "Mileage", value: "35 km/l" },
    ],
    guidelines: ["Helmet mandatory", "Fuel refill required"],
  },

  {
    id: "r6",
    title: "Camping Tent (4 Person)",
    category: "Camping Gear",
    image: "https://images.unsplash.com/photo-1633805159007-8e198bbcc931",
    pricing: { daily: 300, weekly: 1800, monthly: 5500 },

    booking: {
      securityDeposit: 400,
      serviceFee: 35,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: ["2026-02-14"],
        minRentalDays: 2,
        maxRentalDays: 20,
      },
      policies: {
        checkInAfter: "09:00",
        checkOutBefore: "13:00",
        lateReturnHours: 3,
      },
      protection: { included: true, coverageAmount: 3000 },
    },

    description: "Waterproof tent ideal for outdoor camping trips.",
    rating: 4.6,
    totalReviews: 63,
    featured: false,
    distanceKm: 6.8,
    location: "Cuttack",
    owner: { name: "Neha Mishra", rating: 4.5 },
    specs: [
      { label: "Capacity", value: "4 Person" },
      { label: "Material", value: "Polyester" },
    ],
    guidelines: ["Dry before return", "No fire inside tent"],
  },

  {
    id: "r7",
    title: "Electric Scooter (Ather)",
    category: "Vehicles",
    image: "https://images.unsplash.com/photo-1648204834832-78e68052c04f",
    pricing: { daily: 600, weekly: 3600, monthly: 11000 },

    booking: {
      securityDeposit: 1500,
      serviceFee: 65,
      discounts: { weeklyPercent: 5, monthlyPercent: 10 },
      availability: {
        blockedDates: ["2026-02-19"],
        minRentalDays: 1,
        maxRentalDays: 14,
      },
      policies: {
        checkInAfter: "08:00",
        checkOutBefore: "12:00",
        lateReturnHours: 2,
      },
      protection: { included: true, coverageAmount: 12000 },
    },

    description: "Eco-friendly electric scooter with fast charging.",
    rating: 4.7,
    totalReviews: 89,
    featured: false,
    distanceKm: 1.8,
    location: "Bhubaneswar",
    owner: { name: "Kunal Jain", rating: 4.6 },
    specs: [
      { label: "Range", value: "85 km" },
      { label: "Charging", value: "Fast Charge" },
    ],
    guidelines: ["Helmet required", "Charge before return"],
  },

  {
    id: "r8",
    title: "GoPro Hero 12",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1555611637-09de5810478e",
    pricing: { daily: 400, weekly: 2400, monthly: 7500 },

    booking: {
      securityDeposit: 600,
      serviceFee: 40,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: [],
        minRentalDays: 1,
        maxRentalDays: 30,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 5000 },
    },

    description: "Action camera with 5.3K video and stabilization.",
    rating: 4.8,
    totalReviews: 141,
    featured: false,
    distanceKm: 2.9,
    location: "Bhubaneswar",
    owner: { name: "Ritika Sen", rating: 4.7 },
    specs: [
      { label: "Resolution", value: "5.3K" },
      { label: "Stabilization", value: "HyperSmooth" },
    ],
    guidelines: ["Waterproof up to limit", "No lens damage"],
  },

  {
    id: "r9",
    title: "Professional DSLR Tripod",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1545254000-6c843440c5cd",
    pricing: { daily: 150, weekly: 900, monthly: 2800 },

    booking: {
      securityDeposit: 250,
      serviceFee: 30,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: [],
        minRentalDays: 1,
        maxRentalDays: 45,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 2000 },
    },

    description: "Heavy-duty tripod for stable photography.",
    rating: 4.5,
    totalReviews: 44,
    featured: false,
    distanceKm: 5.2,
    location: "Cuttack",
    owner: { name: "Aditya Roy", rating: 4.4 },
    specs: [
      { label: "Height", value: "6 ft" },
      { label: "Material", value: "Aluminium" },
    ],
    guidelines: ["Avoid sand usage", "Lock clamps securely"],
  },

  {
    id: "r10",
    title: "Portable Projector",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580",
    pricing: { daily: 350, weekly: 2100, monthly: 6500 },

    booking: {
      securityDeposit: 700,
      serviceFee: 45,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: ["2026-02-16"],
        minRentalDays: 1,
        maxRentalDays: 30,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 6000 },
    },

    description: "Mini projector for movies and presentations.",
    rating: 4.6,
    totalReviews: 71,
    featured: false,
    distanceKm: 3.6,
    location: "Bhubaneswar",
    owner: { name: "Priya Nair", rating: 4.6 },
    specs: [
      { label: "Resolution", value: "1080p" },
      { label: "Brightness", value: "400 ANSI lumens" },
    ],
    guidelines: ["Use indoors only", "Avoid lens scratches"],
  },

  {
    id: "r11",
    title: "Office Chair (Ergonomic)",
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    pricing: { daily: 120, weekly: 700, monthly: 2200 },

    booking: {
      securityDeposit: 300,
      serviceFee: 25,
      discounts: { weeklyPercent: 10, monthlyPercent: 20 },
      availability: {
        blockedDates: [],
        minRentalDays: 3,
        maxRentalDays: 90,
      },
      policies: {
        checkInAfter: "09:00",
        checkOutBefore: "17:00",
        lateReturnHours: 6,
      },
      protection: { included: true, coverageAmount: 2500 },
    },

    description: "Comfortable ergonomic chair for work.",
    rating: 4.4,
    totalReviews: 39,
    featured: false,
    distanceKm: 4.1,
    location: "Bhubaneswar",
    owner: { name: "Rohit Kumar", rating: 4.5 },
    specs: [
      { label: "Material", value: "Mesh" },
      { label: "Adjustable", value: "Yes" },
    ],
    guidelines: ["No jumping", "Avoid overloading"],
  },

  {
    id: "r12",
    title: "Bluetooth Party Speaker",
    category: "Party Supplies",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
    pricing: { daily: 250, weekly: 1500, monthly: 4800 },

    booking: {
      securityDeposit: 500,
      serviceFee: 40,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: ["2026-02-21"],
        minRentalDays: 1,
        maxRentalDays: 10,
      },
      policies: {
        checkInAfter: "11:00",
        checkOutBefore: "13:00",
        lateReturnHours: 2,
      },
      protection: { included: true, coverageAmount: 4000 },
    },

    description: "High bass speaker for house parties.",
    rating: 4.6,
    totalReviews: 66,
    featured: false,
    distanceKm: 2.0,
    location: "Bhubaneswar",
    owner: { name: "Siddharth", rating: 4.6 },
    specs: [
      { label: "Output", value: "120W" },
      { label: "Connectivity", value: "Bluetooth" },
    ],
    guidelines: ["Avoid max volume", "Indoor use preferred"],
  },

  {
    id: "r13",
    title: "DSLR Lighting Kit",
    category: "Photography",
    image: "https://plus.unsplash.com/premium_photo-1710708584065-3aa4dec8271d",
    pricing: { daily: 300, weekly: 1800, monthly: 5500 },

    booking: {
      securityDeposit: 450,
      serviceFee: 35,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: [],
        minRentalDays: 1,
        maxRentalDays: 30,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 3500 },
    },

    description: "Softbox lighting kit for studio shoots.",
    rating: 4.5,
    totalReviews: 58,
    featured: false,
    distanceKm: 3.3,
    location: "Cuttack",
    owner: { name: "Manish", rating: 4.4 },
    specs: [
      { label: "Lights", value: "2 Softboxes" },
      { label: "Power", value: "LED" },
    ],
    guidelines: ["Avoid overheating", "Handle bulbs carefully"],
  },

  {
    id: "r14",
    title: "Mountain Bicycle",
    category: "Vehicles",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
    pricing: { daily: 350, weekly: 2100, monthly: 6500 },

    booking: {
      securityDeposit: 800,
      serviceFee: 45,
      discounts: { weeklyPercent: 5, monthlyPercent: 10 },
      availability: {
        blockedDates: [],
        minRentalDays: 1,
        maxRentalDays: 14,
      },
      policies: {
        checkInAfter: "08:00",
        checkOutBefore: "12:00",
        lateReturnHours: 2,
      },
      protection: { included: true, coverageAmount: 6000 },
    },

    description: "21-speed mountain bike for trails.",
    rating: 4.7,
    totalReviews: 82,
    featured: false,
    distanceKm: 1.7,
    location: "Bhubaneswar",
    owner: { name: "Arjun", rating: 4.6 },
    specs: [
      { label: "Gears", value: "21 Speed" },
      { label: "Brake", value: "Disc" },
    ],
    guidelines: ["Helmet recommended", "Clean after use"],
  },

  {
    id: "r15",
    title: "VR Headset (Meta Quest)",
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac",
    pricing: { daily: 600, weekly: 3600, monthly: 11000 },

    booking: {
      securityDeposit: 900,
      serviceFee: 50,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: [],
        minRentalDays: 1,
        maxRentalDays: 30,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 7000 },
    },

    description: "Wireless VR headset with immersive experience.",
    rating: 4.8,
    totalReviews: 103,
    featured: true,
    distanceKm: 2.6,
    location: "Bhubaneswar",
    owner: { name: "Nikhil", rating: 4.8 },
    specs: [
      { label: "Storage", value: "128GB" },
      { label: "Tracking", value: "Inside-out" },
    ],
    guidelines: ["No drops", "Use wrist straps"],
  },

  {
    id: "r16",
    title: "Air Purifier",
    category: "Appliances",
    image: "https://images.unsplash.com/photo-1632928274371-878938e4d825",
    pricing: { daily: 200, weekly: 1200, monthly: 3800 },

    booking: {
      securityDeposit: 400,
      serviceFee: 30,
      discounts: { weeklyPercent: 10, monthlyPercent: 20 },
      availability: {
        blockedDates: [],
        minRentalDays: 5,
        maxRentalDays: 90,
      },
      policies: {
        checkInAfter: "09:00",
        checkOutBefore: "18:00",
        lateReturnHours: 6,
      },
      protection: { included: true, coverageAmount: 3000 },
    },

    description: "HEPA air purifier for clean indoor air.",
    rating: 4.4,
    totalReviews: 47,
    featured: false,
    distanceKm: 3.9,
    location: "Cuttack",
    owner: { name: "Pooja", rating: 4.5 },
    specs: [
      { label: "Filter", value: "HEPA" },
      { label: "Coverage", value: "400 sq ft" },
    ],
    guidelines: ["Indoor use only", "Clean filter before return"],
  },

  {
    id: "r17",
    title: "Office Projector Screen",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1721733258410-35e699661ad6",
    pricing: { daily: 180, weekly: 1000, monthly: 3200 },

    booking: {
      securityDeposit: 350,
      serviceFee: 30,
      discounts: { weeklyPercent: 10, monthlyPercent: 20 },
      availability: {
        blockedDates: [],
        minRentalDays: 3,
        maxRentalDays: 60,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "17:00",
        lateReturnHours: 5,
      },
      protection: { included: true, coverageAmount: 2800 },
    },

    description: "100-inch foldable projector screen.",
    rating: 4.3,
    totalReviews: 29,
    featured: false,
    distanceKm: 5.6,
    location: "Bhubaneswar",
    owner: { name: "Deepak", rating: 4.4 },
    specs: [
      { label: "Size", value: "100 inch" },
      { label: "Type", value: "Foldable" },
    ],
    guidelines: ["Avoid creasing", "Use stand carefully"],
  },

  {
    id: "r18",
    title: "Sound Mixer Console",
    category: "Party Supplies",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    pricing: { daily: 700, weekly: 4200, monthly: 13000 },

    booking: {
      securityDeposit: 1000,
      serviceFee: 55,
      discounts: { weeklyPercent: 10, monthlyPercent: 15 },
      availability: {
        blockedDates: ["2026-02-23"],
        minRentalDays: 1,
        maxRentalDays: 20,
      },
      policies: {
        checkInAfter: "11:00",
        checkOutBefore: "13:00",
        lateReturnHours: 3,
      },
      protection: { included: true, coverageAmount: 8000 },
    },

    description: "Professional audio mixer for events.",
    rating: 4.6,
    totalReviews: 54,
    featured: false,
    distanceKm: 6.2,
    location: "Cuttack",
    owner: { name: "Ramesh", rating: 4.6 },
    specs: [
      { label: "Channels", value: "12" },
      { label: "Output", value: "XLR" },
    ],
    guidelines: ["No liquid spill", "Pack cables properly"],
  },

  {
    id: "r19",
    title: "DSLR Camera Bag",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1521134563007-647ff6127244",
    pricing: { daily: 90, weekly: 500, monthly: 1600 },

    booking: {
      securityDeposit: 200,
      serviceFee: 25,
      discounts: { weeklyPercent: 10, monthlyPercent: 20 },
      availability: {
        blockedDates: [],
        minRentalDays: 1,
        maxRentalDays: 60,
      },
      policies: {
        checkInAfter: "10:00",
        checkOutBefore: "14:00",
        lateReturnHours: 4,
      },
      protection: { included: true, coverageAmount: 1500 },
    },

    description: "Waterproof camera backpack with padding.",
    rating: 4.5,
    totalReviews: 33,
    featured: false,
    distanceKm: 1.4,
    location: "Bhubaneswar",
    owner: { name: "Karthik", rating: 4.5 },
    specs: [
      { label: "Material", value: "Waterproof Nylon" },
      { label: "Capacity", value: "2 Cameras" },
    ],
    guidelines: ["No tearing", "Keep zippers intact"],
  },

  {
    id: "r20",
    title: "Foldable Event Table",
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    pricing: { daily: 160, weekly: 950, monthly: 3000 },

    booking: {
      securityDeposit: 350,
      serviceFee: 30,
      discounts: { weeklyPercent: 10, monthlyPercent: 20 },
      availability: {
        blockedDates: [],
        minRentalDays: 3,
        maxRentalDays: 90,
      },
      policies: {
        checkInAfter: "09:00",
        checkOutBefore: "17:00",
        lateReturnHours: 6,
      },
      protection: { included: true, coverageAmount: 3000 },
    },

    description: "Sturdy foldable table for events & parties.",
    rating: 4.4,
    totalReviews: 41,
    featured: false,
    distanceKm: 7.0,
    location: "Cuttack",
    owner: { name: "Shalini", rating: 4.5 },
    specs: [
      { label: "Material", value: "Steel + Wood" },
      { label: "Foldable", value: "Yes" },
    ],
    guidelines: ["Avoid overloading", "Fold carefully"],
  }

];

export default renterExploreDummy;
