import { Stack, Title, Text, NumberInput, Group, Paper, Divider } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useCurrentUser, useUpdateUser } from '../../api/users';

const DEFAULT_THRESHOLD = 3;

export function SettingsPage() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateUser } = useUpdateUser();

  const effectiveThreshold = currentUser?.correctnessThreshold ?? DEFAULT_THRESHOLD;

  const handleThresholdChange = useDebouncedCallback((value: number | string) => {
    if (!currentUser || typeof value !== 'number' || value < 1) return;
    updateUser({ id: currentUser.id, correctnessThreshold: value });
  }, 600);

  return (
    <Stack p="md" gap="lg">
      <Title order={3}>הגדרות</Title>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Text fw={500}>שאלות ידועות</Text>
          <Divider />
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Text size="sm">מספר חזרות לשאלה ידועה</Text>
              <Text size="xs" c="dimmed">שאלה תיחשב כ"ידועה" לאחר מספר זה של תשובות נכונות</Text>
            </Stack>
            <NumberInput
              value={effectiveThreshold}
              onChange={handleThresholdChange}
              min={1}
              max={20}
              step={1}
              w={80}
              styles={{ input: { textAlign: 'center' } }}
            />
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
