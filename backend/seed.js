import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Property from './models/Property.js';
import Booking from './models/Booking.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@househunt.com',
      password: 'admin123',
      role: 'admin',
    });

    const landlord = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'password123',
      role: 'user',
    });

    const customer = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'password123',
      role: 'user',
    });

    console.log('👤 Created 3 users (1 admin, 2 regular)');

    // Create Properties
    const properties = await Property.insertMany([
      {
        title: 'Luxury Penthouse in Bandra West',
        description:
          'Stunning 3-bedroom penthouse located in the premium Bandra West neighborhood with panoramic views of the sea link. Features floor-to-ceiling windows, a modern modular kitchen, Italian marble floors throughout, and a private rooftop terrace. Building amenities include 24/7 security, a swimming pool, and a fully equipped gymnasium.',
        location: 'Bandra West, Mumbai',
        price: 180000,
        type: 'apartment',
        amenities: ['WiFi', 'Gym', 'Pool', 'Concierge', 'Parking', 'Rooftop Terrace'],
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        owner: landlord._id,
        status: 'approved',
      },
      {
        title: 'Spacious Villa in Whitefield',
        description:
          'Charming 4-bedroom villa in a quiet gated community in Whitefield. Features a large private garden, modular kitchen with modern chimneys, spacious living room with a pooja room, and a two-car parking garage. Close to major IT parks, international schools, and shopping malls.',
        location: 'Whitefield, Bangalore',
        price: 75000,
        type: 'house',
        amenities: ['Backyard', 'Garage', 'Fireplace', 'Pet Friendly', 'Washer/Dryer'],
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        owner: landlord._id,
        status: 'approved',
      },
      {
        title: 'Luxury Beachside Villa in Anjuna',
        description:
          'Breathtaking 4-bedroom villa directly overlooking the beaches of Anjuna, Goa. Wake up to ocean views every morning. The property features a private infinity pool, outdoor BBQ and bar area, home theater, and a direct pathway to the beach. Fully furnished with designer Goan-Portuguese furniture.',
        location: 'Anjuna, Goa',
        price: 250000,
        type: 'villa',
        amenities: ['Pool', 'Beach Access', 'Home Theater', 'BBQ Area', 'Furnished', 'Security'],
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        owner: landlord._id,
        status: 'approved',
      },
      {
        title: 'Modern Studio Apartment in Indiranagar',
        description:
          'Sleek and efficient 1BHK studio apartment in the heart of Indiranagar. Perfect for young IT professionals. Features high-speed fiber internet, in-unit washing machine, modern kitchenette with premium appliances, and large windows with plenty of natural light. Steps away from top restaurants and cafes.',
        location: 'Indiranagar, Bangalore',
        price: 28000,
        type: 'studio',
        amenities: ['WiFi', 'In-unit Laundry', 'Air Conditioning', 'Elevator'],
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        owner: landlord._id,
        status: 'approved',
      },
      {
        title: 'Cozy Furnished Room in PG, HSR Layout',
        description:
          'Bright and airy private room in a premium co-living townhouse in HSR Layout. Comes fully furnished with a queen-sized bed, study desk, and wardrobe. Shared kitchen, dining, and living areas are spacious and well-maintained. All utilities, maintenance, and high-speed WiFi included in the rent.',
        location: 'HSR Layout, Bangalore',
        price: 14000,
        type: 'room',
        amenities: ['Furnished', 'WiFi', 'Utilities Included', 'Shared Kitchen'],
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        owner: customer._id,
        status: 'approved',
      },
      {
        title: 'Elegant 2BHK Apartment in Koregaon Park',
        description:
          'Beautifully restored 2-bedroom flat in a premium society in Koregaon Park. Features original teakwood detailing, updated bathrooms with geysers, modular kitchen, and private balconies. Located in Pune\'s trendiest area, walkable to popular eateries and parks.',
        location: 'Koregaon Park, Pune',
        price: 45000,
        type: 'apartment',
        amenities: ['Hardwood Floors', 'Pet Friendly', 'Air Conditioning', 'Storage'],
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        owner: customer._id,
        status: 'approved',
      },
      {
        title: 'Mountain View Cabin in Manali',
        description:
          'Rustic yet modern wooden cabin nestled in the hills near Manali. Features 3 bedrooms, a wrap-around deck with stunning Himalayan views, wood-burning fireplace, and a private hot tub. Perfect for remote workers seeking peace. High-speed fiber internet and power backup available.',
        location: 'Manali, Himachal Pradesh',
        price: 60000,
        type: 'house',
        amenities: ['Hot Tub', 'Mountain View', 'WiFi', 'Fireplace', 'Deck', 'Pet Friendly'],
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
        owner: landlord._id,
        status: 'pending',
      },
      {
        title: 'Waterfront Luxury Condo in Kochi',
        description:
          'Premium 3BHK condominium with stunning views of the Vembanad backwaters. Features open floor design, modular dry and wet kitchens, marble bathrooms, and a spacious balcony. Building facilities include a clubhouse, swimming pool, spa, and security.',
        location: 'Marine Drive, Kochi',
        price: 55000,
        type: 'apartment',
        amenities: ['Waterfront', 'Spa', 'Pool', 'Valet Parking', 'Balcony', 'Gym'],
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
        owner: customer._id,
        status: 'pending',
      },
    ]);

    console.log(`🏠 Created ${properties.length} property listings (6 approved, 2 pending)`);

    // Create a sample booking
    const approvedProperty = properties[0]; // Luxury Penthouse
    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 7);
    const futureEnd = new Date();
    futureEnd.setDate(futureEnd.getDate() + 37); // ~30 days

    await Booking.create({
      property: approvedProperty._id,
      user: customer._id,
      startDate: futureStart,
      endDate: futureEnd,
      totalPrice: approvedProperty.price,
      status: 'confirmed',
    });

    console.log('📋 Created 1 sample booking');

    console.log('\n🎉 Seed complete! You can now log in with:');
    console.log('───────────────────────────────────────────');
    console.log('  Admin:    admin@househunt.com / admin123');
    console.log('  Landlord: rahul@example.com / password123');
    console.log('  Customer: priya@example.com / password123');
    console.log('───────────────────────────────────────────\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
