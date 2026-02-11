import fs from 'fs';
import path from 'path';
import { getPool } from '../db';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    const pool = getPool();
    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();

        console.log('📖 Reading schema file...');
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing migration...');
        await client.query(schema);

        console.log('✅ Migration successful! Table "gradings" created.');
        client.release();
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
