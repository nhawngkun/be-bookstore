import fs from 'fs';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD || 'thang044')
);

const session = driver.session();

const generateSeedFile = async () => {
    try {
        const result = await session.run('MATCH (b:Book) RETURN b');
        const books = result.records.map(record => {
            const book = record.get('b').properties;
            return {
                id: book.id,
                name: book.name,
                lang: book.lang,
                category: book.category,
                image: book.image,
                title: book.title,
                link: book.link,
                content: book.content,
                description: book.description
            };
        });

        const formatted = JSON.stringify(books, null, 2);

        const content = `import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD || 'thang044')
);

const session = driver.session();

const sampleBooks = ${formatted};

const seedBooks = async () => {
  try {
    await session.run('MATCH (b:Book) DETACH DELETE b');
    console.log('Deleted all existing books');

    for (const book of sampleBooks) {
      await session.run(
        \`CREATE (b:Book {
          id: $id,
          name: $name,
          lang: $lang,
          category: $category,
          image: $image,
          title: $title,
          link: $link,
          content: $content,
          description: $description
        })\`,
        book
      );
    }

    console.log('Seeded books to Neo4j successfully');
  } catch (err) {
    console.error('Error seeding books:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
};

seedBooks();`;

        fs.writeFileSync('seedBooksNeo4j.js', content, 'utf-8');
        console.log('✅ seedBooksNeo4j.js has been updated from database');
    } catch (err) {
        console.error('❌ Failed to generate seed file:', err.message);
    } finally {
        await session.close();
        await driver.close();
    }
};

generateSeedFile();

