import React, { useState } from 'react';
import { Group, ActionIcon, Tooltip, Modal } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { EnrichedUser } from '../../../../types/user';
import { UserForm } from './UserForm';

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
  const [modalOpened, setModalOpened] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpened(true);
    if (onEdit) onEdit(user);
  };

  const handleModalClose = () => {
    setModalOpened(false);
  };

  return (
    <>
      <Modal 
        opened={modalOpened} 
        onClose={handleModalClose} 
        title="עריכת משתמש"
        size="md"
      >
        <UserForm 
          userId={user.id} 
          onSuccess={handleModalClose} 
          onCancel={handleModalClose} 
        />
      </Modal>

      <Group gap="xs" justify="center">
        <Tooltip label="ערוך משתמש">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={handleEditClick}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        
        {/* <Tooltip label="מחק משתמש">
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
        </Tooltip> */}
      </Group>
    </>
  );
}; 