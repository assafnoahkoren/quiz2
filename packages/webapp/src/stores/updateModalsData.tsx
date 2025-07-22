import { ReactNode } from 'react';
import { Text, Stack, Title, Box } from '@mantine/core';

export interface UpdateModalData {
  id: string;
  title: ReactNode;
  body: ReactNode;
}

export const updateModalsData: UpdateModalData[] = [
  {
    id: 'good-luck-exam',
    title: <Text fw={600}>בהצלחה במבחן הממשלתי! 🎯</Text>,
    body: (
      <Stack gap="md" p="md">
        <Text fw={700} size="lg">סטודנטים יקרים,</Text>
        <Text>המבחן הממשלתי מתקרב- וזה הזמן לאחל לכם המון בהצלחה!</Text>
        <Text>אני יודעת כמה השקעתם, למדתם ושקדתם ועוד רגע זה מאחוריכם.</Text>
        <Text>תנו את הטוב ביותר שלכם, תאמינו בעצמכם, ואל תשכחו גם לקחת נשימה עמוקה.</Text>
        <Text>מחזיקה לכם אצבעות ומאמינה בכם!</Text>
        <Text>ועוד רגע אתם קלינאים/יות מן המניין 💪📚✨</Text>
        <Text fw={700} size="lg" mt="md">בהצלחה!</Text>
        <Text fs="italic" c="dimmed">שגב קורן קלינאית תקשורת</Text>
      </Stack>
    ),
  },
];