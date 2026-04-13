import('mongodb').then(async ({ MongoClient }) => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('innovus-ringoo'); // Try to guess db name or retrieve from env
  const cols = await db.listCollections().toArray();
  console.log(cols.map(c => c.name));
  await client.close();
}).catch(console.error);
