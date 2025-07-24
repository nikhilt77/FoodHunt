import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import { User } from './models/User';
import { FoodItem } from './models/FoodItem';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await FoodItem.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create demo users
    const users = [
      {
        studentId: 'STU001',
        name: 'Demo Student',
        email: 'student@demo.com',
        password: await bcrypt.hash('password123', 12),
        role: 'student',
        department: 'Computer Science',
        year: 2,
        balance: 500,
        isActive: true
      },
      {
        studentId: 'ADM001',
        name: 'Admin User',
        email: 'admin@demo.com',
        password: await bcrypt.hash('password123', 12),
        role: 'admin',
        department: 'Administration',
        balance: 1000,
        isActive: true
      },
      {
        studentId: 'STF001',
        name: 'Staff Member',
        email: 'staff@demo.com',
        password: await bcrypt.hash('password123', 12),
        role: 'staff',
        department: 'Canteen',
        balance: 200,
        isActive: true
      }
    ];

    await User.insertMany(users);
    console.log('👥 Created demo users');

    // Create food items
    const foodItems = [
      // Breakfast
      {
        name: 'Masala Dosa',
        description: 'Crispy South Indian crepe served with coconut chutney and sambar',
        price: 45,
        category: 'breakfast',
        isAvailable: true,
        preparationTime: 15,
        nutritionalInfo: { calories: 320, protein: 8, carbs: 45, fat: 12 }
      },
      {
        name: 'Aloo Paratha',
        description: 'Stuffed potato flatbread served with yogurt and pickle',
        price: 35,
        category: 'breakfast',
        isAvailable: true,
        preparationTime: 10,
        nutritionalInfo: { calories: 280, protein: 6, carbs: 40, fat: 10 }
      },
      {
        name: 'Poha',
        description: 'Flattened rice with onions, mustard seeds, and curry leaves',
        price: 25,
        category: 'breakfast',
        isAvailable: true,
        preparationTime: 8,
        nutritionalInfo: { calories: 180, protein: 4, carbs: 32, fat: 4 }
      },

      // Lunch
      {
        name: 'Dal Rice Combo',
        description: 'Yellow lentil curry with steamed basmati rice and pickle',
        price: 55,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 12,
        nutritionalInfo: { calories: 420, protein: 18, carbs: 75, fat: 8 }
      },
      {
        name: 'Chicken Curry',
        description: 'Spicy chicken curry with rice and roti',
        price: 85,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 20,
        nutritionalInfo: { calories: 580, protein: 35, carbs: 45, fat: 22 }
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese in rich tomato-based curry with rice/roti',
        price: 75,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 15,
        nutritionalInfo: { calories: 520, protein: 20, carbs: 35, fat: 28 }
      },
      {
        name: 'Vegetable Biryani',
        description: 'Fragrant basmati rice with mixed vegetables and spices',
        price: 65,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 25,
        nutritionalInfo: { calories: 480, protein: 12, carbs: 85, fat: 15 }
      },

      // Dinner
      {
        name: 'Chapati with Sabzi',
        description: 'Whole wheat flatbread with seasonal vegetable curry',
        price: 40,
        category: 'dinner',
        isAvailable: true,
        preparationTime: 10,
        nutritionalInfo: { calories: 300, protein: 10, carbs: 55, fat: 8 }
      },
      {
        name: 'Rajma Rice',
        description: 'Red kidney bean curry with steamed rice',
        price: 50,
        category: 'dinner',
        isAvailable: true,
        preparationTime: 15,
        nutritionalInfo: { calories: 380, protein: 16, carbs: 68, fat: 6 }
      },

      // Snacks
      {
        name: 'Samosa',
        description: 'Crispy triangular pastry filled with spiced potatoes',
        price: 15,
        category: 'snacks',
        isAvailable: true,
        preparationTime: 5,
        nutritionalInfo: { calories: 150, protein: 3, carbs: 18, fat: 8 }
      },
      {
        name: 'Vada Pav',
        description: 'Mumbai street food - spiced potato fritter in a bun',
        price: 20,
        category: 'snacks',
        isAvailable: true,
        preparationTime: 8,
        nutritionalInfo: { calories: 220, protein: 5, carbs: 35, fat: 8 }
      },
      {
        name: 'Pani Puri',
        description: 'Crispy puris with tangy tamarind water (6 pieces)',
        price: 25,
        category: 'snacks',
        isAvailable: true,
        preparationTime: 5,
        nutritionalInfo: { calories: 120, protein: 2, carbs: 25, fat: 2 }
      },

      // Beverages
      {
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea',
        price: 10,
        category: 'beverages',
        isAvailable: true,
        preparationTime: 3,
        nutritionalInfo: { calories: 50, protein: 2, carbs: 8, fat: 2 }
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime juice with soda water',
        price: 15,
        category: 'beverages',
        isAvailable: true,
        preparationTime: 2,
        nutritionalInfo: { calories: 40, protein: 0, carbs: 10, fat: 0 }
      },
      {
        name: 'Lassi',
        description: 'Traditional yogurt-based drink (sweet/salty)',
        price: 20,
        category: 'beverages',
        isAvailable: true,
        preparationTime: 3,
        nutritionalInfo: { calories: 120, protein: 6, carbs: 15, fat: 4 }
      },
      {
        name: 'Filter Coffee',
        description: 'South Indian filter coffee',
        price: 12,
        category: 'beverages',
        isAvailable: true,
        preparationTime: 3,
        nutritionalInfo: { calories: 30, protein: 1, carbs: 4, fat: 1 }
      }
    ];

    await FoodItem.insertMany(foodItems);
    console.log('🍽️ Created food items');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Student: student@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    console.log('Staff: staff@demo.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
