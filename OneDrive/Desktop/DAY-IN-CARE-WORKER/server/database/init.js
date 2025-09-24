const bcrypt = require('bcryptjs');
const { getConnection } = require('./db');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    const db = await getConnection();

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Split by statements and execute each one
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execute(statement);
          console.log('✓ Executed SQL statement');
        } catch (error) {
          // Ignore table exists errors
          if (!error.message.includes('already exists')) {
            console.error('SQL Error:', error.message);
          }
        }
      }
    }

    // Create demo users with hashed passwords
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Update the sample users with proper hashed passwords
    try {
      await db.execute(`
        UPDATE users
        SET password_hash = ?
        WHERE email IN ('manager@sunshinecare.co.uk', 'staff@sunshinecare.co.uk', 'admin@platform.com')
      `, [hashedPassword]);

      console.log('✓ Updated demo user passwords');
    } catch (error) {
      console.log('Note: Demo users may already have proper passwords');
    }

    console.log('✅ Database initialization complete');
    console.log('\n📧 Demo Accounts:');
    console.log('Manager: manager@sunshinecare.co.uk (password: password123)');
    console.log('Staff: staff@sunshinecare.co.uk (password: password123)');
    console.log('Admin: admin@platform.com (password: password123)');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initializeDatabase };