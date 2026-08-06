import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { Item } from "../models/item.model";
import { Booking } from "../models/booking.model";
import { Message } from "../models/message.model";
import { Notification } from "../models/notification.model";
import { Payment } from "../models/payment.model";

async function restoreEnvironment() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing.");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected.");

    // Find any existing items to get the expected owner ID
    const items = await Item.find({});
    console.log(`📦 Found ${items.length} items in DB.`);

    let targetOwnerId: string | mongoose.Types.ObjectId;

    if (items.length > 0 && items[0].ownerId) {
      targetOwnerId = items[0].ownerId;
      console.log(`🔑 Using target ownerId from existing items: ${targetOwnerId}`);
    } else {
      targetOwnerId = new mongoose.Types.ObjectId("6a6ce56ac47de0b4918f21f2");
      console.log(`🔑 Created target ownerId: ${targetOwnerId}`);
    }

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password@123", salt);

    const ownerEmail = "owner@rentora.com";

    // Upsert Owner User document
    await User.findByIdAndDelete(targetOwnerId);
    await User.deleteMany({ email: ownerEmail });

    const ownerUser = await User.create({
      _id: targetOwnerId,
      name: "Rentora Owner",
      email: ownerEmail,
      password: hashedPassword,
      phone: "+919876543210",
      roles: "owner",
      isVerified: true,
      trustScore: 100,
      walletBalance: 0,
      address: {
        district: "South Goa",
        state: "Goa",
        pincode: "403001",
      },
      verifications: {
        email: { isVerified: true, verifiedAt: new Date() },
        phone: { isVerified: true, verifiedAt: new Date() },
        govtId: { status: "verified" },
      },
      owner: {
        totalEarnings: 0,
        totalListings: items.length,
        totalBookings: 0,
        rating: { average: 5.0, count: 5 },
      },
    });

    console.log(`\n👤 Restored Owner User:`);
    console.log(`   - ID: ${ownerUser._id}`);
    console.log(`   - Email: ${ownerUser.email}`);
    console.log(`   - Password: Password@123`);
    console.log(`   - Location: South Goa, Goa (Pincode: 403001)`);

    // Ensure all items are linked to this owner and have location attached
    const updateResult = await Item.updateMany(
      {},
      {
        ownerId: ownerUser._id,
        status: "active",
        isActive: true,
        address: {
          district: "South Goa",
          state: "Goa",
          pincode: "403001",
        },
        location: {
          type: "Point",
          coordinates: [73.8278, 15.4989], // [Longitude, Latitude] for Goa/Panaji
        },
      }
    );
    console.log(`🔗 Re-linked ${updateResult.modifiedCount} items to owner ID ${ownerUser._id} with Goa location.`);

    // Clear stale bookings, messages, notifications, and payments for clean testing
    const deletedBookings = await Booking.deleteMany({});
    const deletedMessages = await Message.deleteMany({});
    const deletedNotifications = await Notification.deleteMany({});
    const deletedPayments = await Payment.deleteMany({});

    console.log("\n🧹 Cleaned up stale data:");
    console.log(`   - Bookings cleared: ${deletedBookings.deletedCount}`);
    console.log(`   - Messages cleared: ${deletedMessages.deletedCount}`);
    console.log(`   - Notifications cleared: ${deletedNotifications.deletedCount}`);
    console.log(`   - Payments cleared: ${deletedPayments.deletedCount}`);

    console.log("\n✨ Environment successfully restored & ready for testing!");
    console.log("🔑 You can log in as Owner with:");
    console.log(`   Email: ${ownerEmail}`);
    console.log(`   Password: Password@123`);
  } catch (err) {
    console.error("❌ Error restoring environment:", err);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB.");
  }
}

restoreEnvironment();
