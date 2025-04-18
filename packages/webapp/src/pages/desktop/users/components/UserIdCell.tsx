import React from 'react';
import { CopyButton, ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';

interface UserIdCellProps {
  id: string;
}

export const UserIdCell: React.FC<UserIdCellProps> = ({ id }) => {
  const parts = id.split('-');
  
  return (
    <Group gap={4} justify="flex-end" wrap="nowrap">
      <Text>{parts[0] || id}</Text>
      <CopyButton value={id} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Copied' : 'Copy full ID'} withArrow position="right">
            <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}; 