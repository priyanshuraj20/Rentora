/**
 * Seed Script: Populate 12 realistic rental items for the owner account.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/scripts/seedItems.ts
 *
 * This script:
 *   1. Connects to MongoDB using MONGO_URI from .env
 *   2. Finds the owner user by email
 *   3. Inserts 12 varied rental items across 4 categories
 *   4. Uses real Unsplash image URLs (not hardcoded placeholders)
 *   5. Disconnects cleanly
 */

import "dotenv/config";
import mongoose from "mongoose";
import { Item } from "../models/item.model";
import { User } from "../models/user.model";

const OWNER_EMAIL = "priyanshuagrwl08@gmail.com";

interface SeedItem {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  images: string[];
  price: { daily: number; weekly: number; monthly: number };
  securityDeposit: number;
  rating: { average: number; count: number };
}

const seedItems: SeedItem[] = [
  // ── Electronics ──────────────────────────────
  {
    title: "Canon EOS R6 Mirrorless Camera",
    description:
      "Professional-grade full-frame mirrorless camera with 20MP sensor, 4K 60fps video, and in-body stabilization. Comes with RF 24-105mm f/4 lens, 2 batteries, SD card, and a padded camera bag. Perfect for events, travel shoots, or content creation weekends.",
    category: "Electronics",
    subCategory: "Cameras",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
    ],
    price: { daily: 1500, weekly: 8500, monthly: 28000 },
    securityDeposit: 10000,
    rating: { average: 4.7, count: 23 },
  },
  {
    title: 'MacBook Pro 16" M2 Pro',
    description:
      'Apple MacBook Pro 16-inch with M2 Pro chip, 16GB unified memory, 512GB SSD. Retina XDR display with ProMotion. Pre-installed with Final Cut Pro and Logic Pro. Charger and USB-C hub included. Ideal for video editing, coding bootcamps, or business travel.',
    category: "Electronics",
    subCategory: "Laptops",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80",
    ],
    price: { daily: 2000, weekly: 11000, monthly: 35000 },
    securityDeposit: 15000,
    rating: { average: 4.9, count: 41 },
  },
  {
    title: "Sony WH-1000XM5 Headphones",
    description:
      "Industry-leading noise cancelling wireless headphones with 30-hour battery life, multipoint connection, and crystal-clear hands-free calling. Includes carry case and charging cable. Great for flights, co-working spaces, or study sessions.",
    category: "Electronics",
    subCategory: "Audio",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    ],
    price: { daily: 250, weekly: 1400, monthly: 4500 },
    securityDeposit: 2000,
    rating: { average: 4.8, count: 67 },
  },

  // ── Furniture ────────────────────────────────
  {
    title: "Herman Miller Aeron Ergonomic Chair",
    description:
      "Size B fully loaded Aeron chair with PostureFit SL lumbar support, adjustable arms, and tilt limiter. Graphite frame with pellicle mesh. Perfect for work-from-home setups or temporary office spaces. Delivered assembled.",
    category: "Furniture",
    subCategory: "Office",
    images: [
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
    ],
    price: { daily: 350, weekly: 2000, monthly: 6500 },
    securityDeposit: 5000,
    rating: { average: 4.6, count: 18 },
  },
  {
    title: "Solid Oak Study Desk — 140cm",
    description:
      "Minimalist solid oak study desk with cable management tray and two soft-close drawers. Dimensions: 140×70×75 cm. Warm walnut finish. Suits modern apartments and co-living spaces. Assembly included on delivery.",
    category: "Furniture",
    subCategory: "Desks",
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
      "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80",
    ],
    price: { daily: 200, weekly: 1100, monthly: 3500 },
    securityDeposit: 3000,
    rating: { average: 4.4, count: 12 },
  },
  {
    title: "3-Seater Linen Sofa — Charcoal",
    description:
      "Premium linen-blend 3-seater sofa in charcoal grey. Solid wood frame with high-density foam cushions. Removable covers for easy cleaning. Great for staging, short-term apartments, or event lounges. Seats 3 adults comfortably.",
    category: "Furniture",
    subCategory: "Living Room",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80",
    ],
    price: { daily: 500, weekly: 2800, monthly: 9000 },
    securityDeposit: 5000,
    rating: { average: 4.5, count: 9 },
  },

  // ── Tools ────────────────────────────────────
  {
    title: "Bosch Professional Rotary Hammer Drill",
    description:
      "Bosch GBH 2-28 DFV SDS-Plus rotary hammer with 850W motor, 3 modes (drill, hammer drill, chisel), vibration control, and quick-change chuck. Includes 6 SDS drill bits, carry case, and depth gauge. Ideal for concrete, masonry, and renovation projects.",
    category: "Tools",
    subCategory: "Power Tools",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    ],
    price: { daily: 300, weekly: 1600, monthly: 5000 },
    securityDeposit: 3000,
    rating: { average: 4.3, count: 31 },
  },
  {
    title: "Pressure Washer — 2200 PSI",
    description:
      "Electric high-pressure washer with 2200 PSI output, 5 interchangeable nozzles, foam cannon, and 8m hose. Compact and wheeled for easy transport. Perfect for car detailing, driveway cleaning, patio maintenance, or pre-paint surface preparation.",
    category: "Tools",
    subCategory: "Cleaning",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    ],
    price: { daily: 400, weekly: 2200, monthly: 7000 },
    securityDeposit: 3500,
    rating: { average: 4.2, count: 15 },
  },
  {
    title: "DeWalt Cordless Circular Saw Kit",
    description:
      "DeWalt DCS391 20V MAX cordless circular saw with 6.5-inch carbide blade, battery, fast charger, and contractor bag. Bevel capacity up to 50°. Lightweight at 3.7 kg. Suitable for framing, plywood cuts, and jobsite carpentry.",
    category: "Tools",
    subCategory: "Power Tools",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
      "https://images.unsplash.com/photo-1530124566582-a45a7e3fa2e2?w=800&q=80",
    ],
    price: { daily: 350, weekly: 1800, monthly: 5500 },
    securityDeposit: 4000,
    rating: { average: 4.6, count: 22 },
  },

  // ── Vehicles ─────────────────────────────────
  {
    title: "Royal Enfield Classic 350 — Stealth Black",
    description:
      "2023 Royal Enfield Classic 350 in Stealth Black. Single-cylinder 349cc engine, ABS, and tubeless tyres. Fully serviced, complete paperwork, 2 helmets and a tank bag included. Insurance valid. Perfect for weekend road trips or daily city commute.",
    category: "Vehicles",
    subCategory: "Motorcycles",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80",
    ],
    price: { daily: 800, weekly: 4500, monthly: 14000 },
    securityDeposit: 5000,
    rating: { average: 4.8, count: 36 },
  },
  {
    title: "Maruti Suzuki Swift Dzire — White",
    description:
      "2022 Maruti Suzuki Swift Dzire VXI in white. Petrol, manual transmission, excellent mileage. Clean interior, all documents valid, fully insured. Includes phone mount and USB charger. Self-drive rental — fuel not included.",
    category: "Vehicles",
    subCategory: "Cars",
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&q=80",
    ],
    price: { daily: 1200, weekly: 7000, monthly: 22000 },
    securityDeposit: 8000,
    rating: { average: 4.5, count: 28 },
  },
  {
    title: "Hero Electric Cycle — City Speed",
    description:
      "Hero Lectro City Speed electric bicycle with 250W rear hub motor, 7-speed Shimano gears, front suspension, and removable lithium battery (40 km range). USB charging port on handlebar. Lock and helmet included. Great for campus or inner-city travel.",
    category: "Vehicles",
    subCategory: "Bicycles",
    images: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
    ],
    price: { daily: 300, weekly: 1600, monthly: 5000 },
    securityDeposit: 2500,
    rating: { average: 4.4, count: 19 },
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  console.log("⏳ Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // Find the owner user
  const owner = await User.findOne({ email: OWNER_EMAIL });
  if (!owner) {
    console.error(`❌ Owner user not found: ${OWNER_EMAIL}`);
    console.error("   Please register with this email first, then run the seed.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`👤 Found owner: ${owner.email} (ID: ${owner._id})`);

  // Check if items already exist for this owner
  const existingCount = await Item.countDocuments({ ownerId: owner._id });
  if (existingCount > 0) {
    console.log(`⚠️  Owner already has ${existingCount} items. Skipping seed to avoid duplicates.`);
    console.log("   To re-seed, first delete existing items:");
    console.log(`   db.items.deleteMany({ ownerId: ObjectId("${owner._id}") })`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Insert all items
  const itemDocs = seedItems.map((item) => ({
    ownerId: owner._id,
    ...item,
    availability: { isAvailable: true, unavailableDates: [] },
    isActive: true,
    status: "active" as const,
    totalBookings: 0,
  }));

  const inserted = await Item.insertMany(itemDocs);
  console.log(`\n🎉 Successfully seeded ${inserted.length} items:\n`);

  inserted.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.title} (₹${item.price.daily}/day) — ${item.category}`);
  });

  console.log("\n✅ Seed complete. Disconnecting...");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
