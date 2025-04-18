import React, { useState } from 'react';
import { Group, ActionIcon, Tooltip, Modal, Select, Button, Stack, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconCoin } from '@tabler/icons-react';
import { EnrichedUser } from '../../../../types/user';
import { UserForm } from './UserForm';
import { SubscriptionForm } from '../../../desktop/subscriptions/components/SubscriptionForm';

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
  const [subscriptionModalOpened, setSubscriptionModalOpened] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpened(true);
    if (onEdit) onEdit(user);
  };

  const handleSubscriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSubscriptionModalOpened(true);
    setSelectedSubscriptionId(null);
    setIsCreatingNew(false);
  };

  const handleModalClose = () => {
    setModalOpened(false);
  };

  const handleSubscriptionModalClose = () => {
    setSubscriptionModalOpened(false);
    setSelectedSubscriptionId(null);
    setIsCreatingNew(false);
  };

  const handleCreateNewSubscription = () => {
    setSelectedSubscriptionId(null);
    setIsCreatingNew(true);
  };

  // Format subscriptions for the dropdown
  const subscriptionOptions = user.Subscriptions.map(sub => ({
    value: sub.id,
    label: `ID: ${sub.id} - Expires: ${new Date(sub.expiresAt).toLocaleDateString()}`
  }));

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

      <Modal
        opened={subscriptionModalOpened}
        onClose={handleSubscriptionModalClose}
        title="ניהול מנויים"
        size="md"
      >
        {!isCreatingNew && (
          <Stack mb="md">
            <Group>
              <Select
                style={{ flex: 1 }}
                placeholder="בחר מנוי"
                data={subscriptionOptions}
                value={selectedSubscriptionId}
                onChange={setSelectedSubscriptionId}
                clearable
              />
              <Button onClick={handleCreateNewSubscription}>חדש</Button>
            </Group>
            {subscriptionOptions.length === 0 && (
              <Text c="dimmed" size="sm">אין מנויים למשתמש זה</Text>
            )}
          </Stack>
        )}

        {(selectedSubscriptionId || isCreatingNew) && (
          <SubscriptionForm
            subscriptionId={selectedSubscriptionId || undefined}
            userId={user.id}
            onSuccess={handleSubscriptionModalClose}
            onCancel={handleSubscriptionModalClose}
          />
        )}
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
        
        <Tooltip label="ניהול מנויים">
          <ActionIcon
            variant="subtle"
            color="yellow"
            onClick={handleSubscriptionClick}
          >
            <IconCoin size={16} />
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