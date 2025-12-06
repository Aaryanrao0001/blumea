// scripts/create_text_index.js
// Usage:
//   export MONGODB_URI="mongodb+srv://anon:Anon%40007@cluster0.d7biwar.mongodb.net/?appName=Cluster0"
//   node scripts/create_text_index.js

const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Please set MONGODB_URI environment variable');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(); // default DB from URI
    const collections = (await db.listCollections().toArray()).map(c => c.name);
    console.log('Existing collections:', collections);

    // Choose likely collection name (adjust if your collection uses a different name)
    const candidates = ['skincareproducts', 'skincareProducts', 'products', 'product', 'skincare_product'];
    const collName = candidates.find(n => collections.includes(n)) || 'skincareproducts';
    console.log('Using collection:', collName);

    // Create text index on the searched fields (name, brand, slug, ingredientNames)
    console.log(`Creating text index on ${collName} (name, brand, slug, ingredientNames)...`);
    const idxName = await db.collection(collName).createIndex(
      { name: 'text', brand: 'text', slug: 'text', ingredientNames: 'text' },
      { name: 'skincare_text_index', default_language: 'english' }
    );

    console.log('Created index:', idxName);
    const indexes = await db.collection(collName).indexes();
    console.log('Indexes on collection:', indexes);
  } catch (err) {
    console.error('Error creating text index:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();