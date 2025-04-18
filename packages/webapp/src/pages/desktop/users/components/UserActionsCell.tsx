import React from 'react';
import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { EnrichedUser } from '../../../../types/user';

interface UserActionsCellProps {
  user: EnrichedUser;
  onEdit?: (user: EnrichedUser) => void;
  onDelete?: (user: EnrichedUser) => void;
}

export const UserActionsCell: React.FC<UserActionsCellProps> = ({ 
  user, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Group gap="xs" justify="center">
      <Tooltip label="ערוך משתמש">
        <ActionIcon
          variant="subtle"
          color="blue"
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit(user);
          }}
        >
          <IconEdit size={16} />
        </ActionIcon>
      </Tooltip>
      
      <Tooltip label="מחק משתמש">
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(user);
          }}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}; 