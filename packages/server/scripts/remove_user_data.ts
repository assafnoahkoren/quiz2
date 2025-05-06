import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  let userIdToDelete: string | undefined;

  try {
    userIdToDelete = await askQuestion('Enter the ID of the user to delete: ');
    if (!userIdToDelete || userIdToDelete.trim() === '') {
      console.log('No User ID provided. Exiting.');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdToDelete },
    });

    if (!user) {
      console.log(`User with ID "${userIdToDelete}" not found. Exiting.`);
      return;
    }

    console.log(`Found user:`);
    console.log(`  ID:    ${user.id}`);
    console.log(`  Email: ${user.email}`);
    if (user.name) {
      console.log(`  Name:  ${user.name}`);
    }

    const confirmation = await askQuestion(
      'Are you sure you want to delete this user and all their related data? (yes/no): ',
    );

    if (confirmation.toLowerCase() !== 'yes') {
      console.log('Deletion cancelled by user. Exiting.');
      return;
    }

    console.log(`Proceeding with deletion for user ID: ${userIdToDelete}...`);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete UserExamQuestion records
      const deletedUserExamQuestions = await tx.userExamQuestion.deleteMany({
        where: { userId: userIdToDelete },
      });
      console.log(`Deleted ${deletedUserExamQuestions.count} UserExamQuestion records.`);

      // 2. Delete Subscription records
      const deletedSubscriptions = await tx.subscription.deleteMany({
        where: { userId: userIdToDelete },
      });
      console.log(`Deleted ${deletedSubscriptions.count} Subscription records.`);

      // 3. Delete UserExam records
      // Note: UserExamQuestion records related to these UserExams (and the specific user)
      // should have already been deleted in step 1.
      const deletedUserExams = await tx.userExam.deleteMany({
        where: { userId: userIdToDelete },
      });
      console.log(`Deleted ${deletedUserExams.count} UserExam records.`);

      // 4. Delete the User record itself
      const deletedUser = await tx.user.delete({
        where: { id: userIdToDelete },
      });
      console.log(`Deleted user: ${deletedUser.email}`);

      return {
        deletedUserExamQuestionsCount: deletedUserExamQuestions.count,
        deletedSubscriptionsCount: deletedSubscriptions.count,
        deletedUserExamsCount: deletedUserExams.count,
        deletedUserEmail: deletedUser.email,
      };
    });

    console.log('\nDeletion successful:');
    console.log(`  User: ${result.deletedUserEmail}`);
    console.log(`  UserExamQuestions removed: ${result.deletedUserExamQuestionsCount}`);
    console.log(`  Subscriptions removed: ${result.deletedSubscriptionsCount}`);
    console.log(`  UserExams removed: ${result.deletedUserExamsCount}`);

  } catch (error) {
    console.error('\nAn error occurred:');
    if (error instanceof Error) {
      console.error(error.message);
      if ((error as any).code === 'P2025' && userIdToDelete) {
         console.error(`Attempted to delete user with ID "${userIdToDelete}", but they might have already been deleted or never existed.`);
      }
    } else {
      console.error(String(error));
    }
    console.log("If the error is 'Record to delete does not exist', it might mean the user was already deleted or the ID was incorrect.");
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main()
  .then(() => {
    console.log('\nScript finished.');
  })
  .catch((e) => {
    console.error('\nUnhandled error in main:', e);
    process.exit(1);
  });
