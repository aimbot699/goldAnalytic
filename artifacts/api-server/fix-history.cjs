const mysql = require('mysql2/promise');

async function fixHistory() {
  const connection = await mysql.createConnection({
    host: '91.99.159.222',
    user: 'gold_user',
    password: 'gold_pass_123',
    database: 'gold_db',
  });

  console.log('Connected to DB');
  
  const [result] = await connection.query('DELETE FROM price_history WHERE price < 15000');
  console.log(`Deleted ${result.affectedRows} old data points.`);

  await connection.end();
}

fixHistory().catch(console.error);
