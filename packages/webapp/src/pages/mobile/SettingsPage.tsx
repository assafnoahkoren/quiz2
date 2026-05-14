import { useState } from 'react';
import { Stack, Title, Text, Group, Paper, Divider, ActionIcon, Loader } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconPlus, IconMinus } from '@tabler/icons-react';
import { useCurrentUser, useUpdateUser } from '../../api/users';

const DEFAULT_THRESHOLD = 3;
const MIN = 1;
const MAX = 20;

export function SettingsPage() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateUser, isPending } = useUpdateUser();

  const serverValue = currentUser?.correctnessThreshold ?? DEFAULT_THRESHOLD;
  const [localValue, setLocalValue] = useState<number | null>(null);
  const displayValue = localValue ?? serverValue;

  const saveDebounced = useDebouncedCallback((value: number) => {
    if (!currentUser) return;
    updateUser(
      { id: currentUser.id, correctnessThreshold: value },
      { onSuccess: () => setLocalValue(null) },
    );
  }, 600);

  const handleChange = (delta: number) => {
    const next = Math.min(MAX, Math.max(MIN, displayValue + delta));
    if (next === displayValue) return;
    setLocalValue(next);
    saveDebounced(next);
  };

  return (
    <Stack p="md" gap="lg">
      <Title order={3}>הגדרות</Title>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Text fw={500}>שאלות ידועות</Text>
          <Divider />
          <Group justify="space-between" align="center" wrap="nowrap">
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm">מספר חזרות לשאלה ידועה</Text>
              <Text size="xs" c="dimmed">שאלה תיחשב כ"ידועה" לאחר מספר זה של תשובות נכונות</Text>
            </Stack>
            <Group gap={4} align="center">
              {isPending && <Loader size="xs" />}
              <ActionIcon
                variant="default"
                size="sm"
                onClick={() => handleChange(-1)}
                disabled={displayValue <= MIN || isPending}
                aria-label="הפחת ב-1"
              >
                <IconMinus size={12} />
              </ActionIcon>
              <Text w={28} ta="center" fw={600} size="lg">
                {displayValue}
              </Text>
              <ActionIcon
                variant="default"
                size="sm"
                onClick={() => handleChange(1)}
                disabled={displayValue >= MAX || isPending}
                aria-label="הוסף 1"
              >
                <IconPlus size={12} />
              </ActionIcon>
            </Group>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
