import React from 'react';
import { Box } from '@mantine/core';
import { UserRole } from '../../../../types/user';
import { IconUser, IconCrown } from '@tabler/icons-react';

interface UserRoleCellProps {
  role: UserRole;
}

const roleTranslations = {
  [UserRole.USER]: 'משתמש',
  [UserRole.ADMIN]: 'מנהל'
};


const roleIcons = {
  [UserRole.USER]: <IconUser size={16} />,
  [UserRole.ADMIN]: <IconCrown size={16} />
};





export const UserRoleCell: React.FC<UserRoleCellProps> = ({ role }) => {
  const displayRole = role || UserRole.USER;
  
  return (
    <Box fw={700} c={displayRole === UserRole.ADMIN ? 'blue' : 'gray'} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {roleIcons[displayRole]} {roleTranslations[displayRole]}
    </Box>
  );
}; 