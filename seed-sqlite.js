const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

const DUMMY_PRODUCTS = [
  { id: 1, name: "Kopi Susu", price: 15000 },
  { id: 2, name: "Teh Manis", price: 5000 },
  { id: 3, name: "Es Teh", price: 5000 },
  { id: 4, name: "Kopi Hitam", price: 10000 },
  { id: 5, name: "Roti Coklat", price: 8000 },
  { id: 6, name: "Bakso", price: 15000 },
];

try {
  const insert = db.prepare('INSERT OR IGNORE INTO Product (id, name, price) VALUES (?, ?, ?)');
  
  db.transaction(() => {
    for (const p of DUMMY_PRODUCTS) {
      insert.run(p.id, p.name, p.price);
    }
  })();
  
  console.log("Seeding products success");
} catch (e) {
  console.error("Failed to seed", e);
} finally {
  db.close();
}
