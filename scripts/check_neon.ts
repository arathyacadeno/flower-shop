import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkNeon() {
  const sql = neon(process.env.DATABASE_URL!);
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  const productCount = await sql`SELECT count(*) FROM products;`;
  const orderCount = await sql`SELECT count(*) FROM orders;`;
  const userCount = await sql`SELECT count(*) FROM users;`;
  
  console.log('Tables in Neon:', tables.map(t => t.table_name));
  console.log(`Products: ${productCount[0].count} | Orders: ${orderCount[0].count} | Users: ${userCount[0].count}`);
}

checkNeon().catch(console.error);
