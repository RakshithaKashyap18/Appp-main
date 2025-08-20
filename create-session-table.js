import { pool } from './server/db.ts';

async function createSessionTable() {
  try {
    console.log('Creating session table...');
    
    // Create session table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
    `);
    
    // Create index if it doesn't exist (use DO block to handle "already exists" error)
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_session_expire') THEN
          CREATE INDEX idx_session_expire ON session (expire);
        END IF;
      END $$;
    `);
    
    console.log('Session table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating session table:', error);
    process.exit(1);
  }
}

createSessionTable();
