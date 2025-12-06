// scripts/listDrafts.js
// Usage:
//   export MONGODB_URI="mongodb+srv://anon:Anon%40007@cluster0.d7biwar.mongodb.net/?appName=Cluster0"
//   node scripts/listDrafts.js

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
    const db = client.db();
    const collections = (await db.listCollections().toArray()).map(c => c.name);
    console.log('Collections:', collections);

    const candidates = ['generatedDrafts', 'generateddrafts', 'generated_drafts', 'drafts', 'posts'];
    for (const name of candidates) {
      if (!collections.includes(name)) continue;
      console.log(`\nLatest docs from collection: ${name}`);
      const docs = await db.collection(name).find().sort({ createdAt: -1 }).limit(10).toArray();
      console.dir(docs, { depth: 2 });
      return;
    }

    console.log('No known draft collections found. If your collection name differs, update candidates in this script.');
  } catch (err) {
    console.error('Error listing drafts:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();