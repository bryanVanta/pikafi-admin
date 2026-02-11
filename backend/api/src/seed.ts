import { query, getPool } from './db';

const seed = async () => {
    const client = await getPool().connect();
    try {
        console.log('Starting seeding...');

        await client.query('BEGIN');

        // Create table if it doesn't exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        hash VARCHAR(255) NOT NULL,
        sender VARCHAR(255) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        amount VARCHAR(255) NOT NULL,
        data TEXT,
        timestamp BIGINT NOT NULL,
        status INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        seller VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        grade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Ensure grade exists
        try {
            await client.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS grade VARCHAR(50);`);
        } catch (e) {
            console.log('Column grade check/add failed or already exists:', e);
        }

        // Migration for tx_hash
        try {
            await client.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(255);`);
        } catch (e) {
            console.log('Column tx_hash check/add failed or already exists:', e);
        }

        // Migration for ipfs_hash
        try {
            await client.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS ipfs_hash VARCHAR(255);`);
        } catch (e) {
            console.log('Column ipfs_hash check/add failed or already exists:', e);
        }
        console.log('Table "transactions" created or already exists.');

        // Check if data exists
        const res = await client.query('SELECT COUNT(*) FROM transactions');
        const count = parseInt(res.rows[0].count, 10);

        if (count === 0) {
            console.log('Seeding data...');
            const insertText = `
        INSERT INTO transactions (hash, sender, recipient, amount, data, timestamp, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

            const dummyTransactions = [
                ['0x123...', '0xSender1', '0xRecipient1', '1000000000000000000', 'Payment for services', Date.now(), 0],
                ['0x456...', '0xSender2', '0xRecipient2', '500000000000000000', 'Refund', Date.now(), 1],
                ['0x789...', '0xSender3', '0xRecipient3', '2000000000000000000', 'Investment', Date.now() - 10000, 2],
            ];

            for (const tx of dummyTransactions) {
                await client.query(insertText, tx);
            }
            console.log(`Inserted ${dummyTransactions.length} dummy transactions.`);
        } else {
            console.log('Data already exists, skipping seed.');
        }

        await client.query('COMMIT');
        console.log('Seeding completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
    } finally {
        client.release();
        await getPool().end();
    }
};

seed();
