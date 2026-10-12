import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyOrderInNeon() {
  const sql = neon(process.env.DATABASE_URL!);
  const recentOrders = await sql`SELECT id, customer_name, final_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 5;`;
  console.log('Recent orders in Neon:');
  console.table(recentOrders);
}

verifyOrderInNeon().catch(console.error);
