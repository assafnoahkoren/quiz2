import { IconHome, IconUser, IconLogin, IconLogout, IconUserPlus } from '@tabler/icons-react';

interface IconDemoProps {
  size?: number;
  color?: string;
  stroke?: number;
}

export const IconDemo = ({ size = 24, color, stroke = 2 }: IconDemoProps) => {
  return (
    <div className="flex gap-4 items-center justify-center p-4">
      <IconHome size={size} color={color} stroke={stroke} />
      <IconUser size={size} color={color} stroke={stroke} />
      <IconLogin size={size} color={color} stroke={stroke} />
      <IconLogout size={size} color={color} stroke={stroke} />
      <IconUserPlus size={size} color={color} stroke={stroke} />
    </div>
  );
}; 