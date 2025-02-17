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
      description: 'A quiz to test your vocabulary knowledge',
    },
    {
      name: 'Typing Practice',
      previewUrl: 'https://example.com/typing.jpg',
      url: '/activities/typing-practice',
      description: 'A typing practice to test your vocabulary knowledge', // Added url field
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

async function createStudySessions() {
  console.log('Creating study sessions...');

  // Fetch a group and activity to associate with the session
  const group = await prisma.group.findFirst();
  const activity = await prisma.studyActivity.findFirst();

  if (!group || !activity) {
    throw new Error('Missing required group or activity for study sessions');
  }

  // Generate startTime as current time and endTime as 5 minutes later
  const now = new Date();
  const end = new Date(now.getTime() + 5 * 60 * 1000); // +5 minutes

  // Create two study sessions with startTime and endTime
  await prisma.studySession.createMany({
    data: [
      {
        groupId: group.id,
        studyActivityId: activity.id,
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        groupId: group.id,
        studyActivityId: activity.id,
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ],
  });

  console.log('Study sessions created successfully!');
}

async function createStudyResults() {
  console.log('Creating study results...');

  const sessions = await prisma.studySession.findMany();
  if (sessions.length === 0) {
    throw new Error('No study sessions found to create results');
  }

  const words = await prisma.word.findMany({ take: 10 });
  if (words.length === 0) {
    throw new Error('No words found to create study results');
  }

  let count = 0;
  for (const session of sessions) {
    for (const word of words) {
      await prisma.studyResult.create({
        data: {
          studySessionId: session.id,
          wordId: word.id,
          correct: Math.random() > 0.3, // 70% chance of correct answer
          createdAt: new Date(),
        },
      });
      count++;
    }
  }

  console.log(`✅ Created ${count} study results!`);
}

async function createWordReviews() {
  console.log('Creating word reviews...');

  const words = await prisma.word.findMany({ take: 10 }); // Limit to first 10 words
  if (words.length === 0) {
    throw new Error('No words found to create word reviews');
  }

  let count = 0;
  for (const word of words) {
    await prisma.wordReview.upsert({
      where: { wordId: word.id },
      update: {},
      create: {
        wordId: word.id,
        correctCount: Math.floor(Math.random() * 5), // Random 0-4 correct reviews
        wrongCount: Math.floor(Math.random() * 3),  // Random 0-2 wrong reviews
        lastReviewed: new Date(),
      },
    });
    count++;
  }

  console.log(`✅ Created ${count} word reviews!`);
}




async function main() {
  console.log('Starting seed...');
  
  try {
    await createInitialActivities();
    await createDefaultGroups();
    await importWords();
    await createStudySessions();
    await createStudyResults(); 
    await createWordReviews(); // ✅ Add this
    
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
