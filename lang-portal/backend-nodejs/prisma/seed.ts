import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const prisma = new PrismaClient();

interface WordData {
  Thai: string;
  English: string;
  Romanization: string;
  ipa: string;
  'Exemple sentence': string;
}

async function createInitialActivities() {
  const activities = [
    {
      name: 'Vocabulary Quiz',
      previewUrl: 'https://example.com/vocab-quiz.jpg',
      url: '/activities/vocabulary-quiz', // Added url field
    },
    {
      name: 'Typing Practice',
      previewUrl: 'https://example.com/typing.jpg',
      url: '/activities/typing-practice', // Added url field
    },
  ];

  console.log('Creating initial study activities...');
  for (const activity of activities) {
    await prisma.studyActivity.upsert({
      where: { name: activity.name },
      update: {},
      create: activity,
    });
  }
}

async function createDefaultGroups() {
  const groups = [
    {
      name: 'Common Words',
    },
    {
      name: 'Basic Phrases',
    },
    {
      name: 'Greetings',
    },
  ];

  console.log('Creating default word groups...');
  for (const group of groups) {
    await prisma.group.upsert({
      where: { name: group.name },
      update: {},
      create: group,
    });
  }
}

async function importWords() {
  console.log('Reading CSV file...');
  
  const csvFilePath = join(__dirname, '../database/thai-frequency-list.csv');
  const fileContent = readFileSync(csvFilePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: (header) => header.map((col) => col.trim().toLowerCase()),
    skip_empty_lines: true,
  }) as WordData[];

  console.log(`Importing ${records.length} words...`);
  //console.log("First 5 records from CSV:", records.slice(0, 5));

  
  const commonWordsGroup = await prisma.group.findUnique({
    where: { name: 'Common Words' },
  });

  if (!commonWordsGroup) {
    throw new Error('Common Words group not found');
  }

  let count = 0;
  for (const record of records) {
    console.log("Processing record:", record); // ✅ Debugging

    const word = await prisma.word.upsert({
      where: { thai: record.thai },
      update: {},
      create: {
        thai: record.thai,
        english: record.english,
        romanized: record.romanization,
        example: record['Exemple sentence'],
      },
    });

    // Associate with Common Words group
    await prisma.wordsInGroups.upsert({
      where: {
        wordId_groupId: {
          wordId: word.id,
          groupId: commonWordsGroup.id,
        },
      },
      update: {},
      create: {
        wordId: word.id,
        groupId: commonWordsGroup.id,
      },
    });

    count++;
    if (count % 100 === 0) {
      console.log(`Imported ${count} words...`);
    }
  }
}

async function main() {
  console.log('Starting seed...');
  
  try {
    await createInitialActivities();
    await createDefaultGroups();
    await importWords();
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
