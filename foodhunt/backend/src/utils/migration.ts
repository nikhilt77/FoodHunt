import { FoodItem } from '../models/FoodItem';

export const migrateFoodItems = async () => {
  try {
    console.log('🔄 Starting migration: Adding stock fields to existing food items...');
    
    // Find all items that don't have stock or maxDailyStock fields
    const itemsNeedingMigration = await FoodItem.find({
      $or: [
        { stock: { $exists: false } },
        { maxDailyStock: { $exists: false } },
        { stock: null },
        { maxDailyStock: null }
      ]
    });

    console.log(`Found ${itemsNeedingMigration.length} items needing migration`);

    for (const item of itemsNeedingMigration) {
      console.log(`Migrating item: ${item.name}`);
      
      await FoodItem.updateOne(
        { _id: item._id },
        {
          $set: {
            stock: item.stock || 0,
            maxDailyStock: item.maxDailyStock || 50
          }
        }
      );
    }

    console.log('✅ Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
};
