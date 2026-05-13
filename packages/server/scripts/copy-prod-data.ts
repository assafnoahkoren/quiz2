import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prodClient = new Client({ connectionString: process.env.PROD_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const localClient = new Client({ connectionString: process.env.DATABASE_URL });

async function copySubjectsInOrder(rows: any[]) {
  const map = new Map(rows.map(r => [r.id, r]));
  const inserted = new Set<string>();

  async function insert(row: any) {
    if (inserted.has(row.id)) return;
    if (row.parentSubjectId && !inserted.has(row.parentSubjectId)) {
      const parent = map.get(row.parentSubjectId);
      if (parent) await insert(parent);
    }
    const cols = Object.keys(row);
    const colList = cols.map(c => `"${c}"`).join(', ');
    const values = cols.map((_, i) => `$${i + 1}`).join(', ');
    await localClient.query(
      `INSERT INTO "Subject" (${colList}) VALUES (${values}) ON CONFLICT (id) DO NOTHING`,
      cols.map(c => row[c])
    );
    inserted.add(row.id);
  }

  for (const row of rows) await insert(row);
  console.log(`  Subject: copied ${rows.length} rows`);
}

async function copyTable(tableName: string, rows: any[]) {
  if (rows.length === 0) {
    console.log(`  ${tableName}: no rows`);
    return;
  }
  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `"${c}"`).join(', ');
  for (const row of rows) {
    const values = cols.map((_, i) => `$${i + 1}`).join(', ');
    await localClient.query(
      `INSERT INTO "${tableName}" (${colList}) VALUES (${values}) ON CONFLICT (id) DO NOTHING`,
      cols.map(c => row[c])
    );
  }
  console.log(`  ${tableName}: copied ${rows.length} rows`);
}

async function main() {
  await prodClient.connect();
  await localClient.connect();

  console.log('Fetching data from prod...');
  const [govExams, govExamInstances, subjects, questions, options, users, subscriptions, userExams, userExamQuestions, reports] = await Promise.all([
    prodClient.query('SELECT * FROM "GovExam"'),
    prodClient.query('SELECT * FROM "GovExamInstance"'),
    prodClient.query('SELECT * FROM "Subject"'),
    prodClient.query('SELECT * FROM "Question"'),
    prodClient.query('SELECT * FROM "Options"'),
    prodClient.query('SELECT * FROM "User"'),
    prodClient.query('SELECT * FROM "Subscription"'),
    prodClient.query('SELECT * FROM "UserExam"'),
    prodClient.query('SELECT * FROM "UserExamQuestion"'),
    prodClient.query('SELECT * FROM "Report"'),
  ]);

  console.log('Clearing local tables (reverse dependency order)...');
  await localClient.query('DELETE FROM "Report"');
  await localClient.query('DELETE FROM "UserExamQuestion"');
  await localClient.query('DELETE FROM "UserExam"');
  await localClient.query('DELETE FROM "Subscription"');
  await localClient.query('DELETE FROM "Options"');
  await localClient.query('DELETE FROM "Question"');
  await localClient.query('DELETE FROM "Subject"');
  await localClient.query('DELETE FROM "GovExamInstance"');
  await localClient.query('UPDATE "User" SET "govExamId" = NULL, "govExamInstanceId" = NULL');
  await localClient.query('DELETE FROM "GovExam"');
  await localClient.query('DELETE FROM "User"');

  console.log('Inserting prod data locally...');
  await copyTable('GovExam', govExams.rows);
  await copyTable('GovExamInstance', govExamInstances.rows);
  await copySubjectsInOrder(subjects.rows);
  await copyTable('Question', questions.rows);
  await copyTable('Options', options.rows);
  await copyTable('User', users.rows);
  await copyTable('Subscription', subscriptions.rows);
  await copyTable('UserExam', userExams.rows);
  await copyTable('UserExamQuestion', userExamQuestions.rows);
  await copyTable('Report', reports.rows);

  console.log('Done.');
  await prodClient.end();
  await localClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
