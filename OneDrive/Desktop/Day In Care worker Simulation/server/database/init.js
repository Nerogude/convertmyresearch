const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await db.query(schema);
    console.log('✓ Database schema initialized successfully');

    // Check if we need to seed initial data
    const orgCheck = await db.query('SELECT COUNT(*) FROM organizations');

    if (parseInt(orgCheck.rows[0].count) === 0) {
      console.log('Seeding initial data...');
      await seedInitialData();
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function seedInitialData() {
  try {
    // Create a demo organization
    const orgResult = await db.query(
      'INSERT INTO organizations (name, code) VALUES ($1, $2) RETURNING id',
      ['Demo Care Home', 'DEMO2024']
    );

    console.log('✓ Demo organization created');

    // Seed the two core scenarios
    await seedScenarios();

    console.log('✓ Initial data seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

async function seedScenarios() {
  // Scenario 1: The Sundowning Wanderer
  const scenario1 = await db.query(
    `INSERT INTO scenarios (title, description, difficulty, module, estimated_time)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [
      'The Sundowning Wanderer',
      'A resident with dementia is distressed and trying to leave the care home to go "home" to her deceased husband.',
      'intermediate',
      'Dementia Care & Empathy',
      15
    ]
  );

  const s1Id = scenario1.rows[0].id;

  // Care plan for scenario 1
  await db.query(
    `INSERT INTO care_plans (scenario_id, client_name, age, diagnosis, care_needs, communication_needs, risk_assessment, allergies, medication)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      s1Id,
      'Margaret Thompson',
      78,
      'Moderate to severe Alzheimer\'s Disease (diagnosed 2021)',
      'Full assistance with personal care, medication management, supervision due to wandering risk',
      'Use short, simple sentences. Avoid arguing or correcting. Responds well to validation and gentle redirection. Becomes distressed if contradicted.',
      'WANDERING RISK: High. Often attempts to leave the building, especially late afternoon (sundowning). Has fallen twice in the past year. Exit door alarms in place.',
      'Penicillin (anaphylaxis)',
      'Donepezil 10mg (morning), Sertraline 50mg (morning), Paracetamol PRN'
    ]
  );

  // Scenario 2: The Fall in the Bathroom
  const scenario2 = await db.query(
    `INSERT INTO scenarios (title, description, difficulty, module, estimated_time)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [
      'The Fall in the Bathroom',
      'A client is found conscious on the bathroom floor after a fall, with a head injury and potential fracture.',
      'intermediate',
      'First Aid & Clinical Safety',
      12
    ]
  );

  const s2Id = scenario2.rows[0].id;

  // Care plan for scenario 2
  await db.query(
    `INSERT INTO care_plans (scenario_id, client_name, age, diagnosis, care_needs, communication_needs, risk_assessment, allergies, medication)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      s2Id,
      'Arthur Davies',
      82,
      'Osteoporosis, Type 2 Diabetes, Hypertension',
      'Assistance with mobility (uses walking frame), medication supervision, twice-daily visits',
      'Hard of hearing (wears hearing aids). Speak clearly and face him when talking. Can be stubborn and minimizes health concerns.',
      'FALLS RISK: High due to osteoporosis and unsteady gait. History of 3 falls in past 6 months. Bathroom has grab rails installed. Sometimes refuses to use walking frame.',
      'None known',
      'Alendronic acid 70mg (weekly), Metformin 500mg (twice daily), Amlodipine 5mg (morning), Adcal-D3 (twice daily)'
    ]
  );

  console.log('✓ Scenarios seeded');
}

module.exports = { initializeDatabase };
