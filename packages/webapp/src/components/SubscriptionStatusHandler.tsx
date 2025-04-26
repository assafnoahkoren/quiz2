import { useEffect } from 'react';
import { useMySubscriptionStatus } from '../api/subscriptions';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Text, Button, Stack, Group } from '@mantine/core';
import { IconBrandWhatsapp, IconCrown, IconLogout, IconMail, IconPhone } from '@tabler/icons-react';
import { useAuth } from './auth/AuthContext';

export const SubscriptionStatusHandler = () => {
	const { data: subscriptionStatus, isLoading } = useMySubscriptionStatus();
	const [opened, { open, close }] = useDisclosure(false);
	const { logout } = useAuth();

	const handleLogout = () => {
		logout();
		close();
	};

	useEffect(() => {
		// Only trigger if not loading and status is demo with 0 questions left
		if (
			!isLoading &&
			subscriptionStatus?.type === 'demo' &&
			subscriptionStatus?.freeQuestionsLeft === 0
		) {
			open(); // Open the modal
		}
	}, [subscriptionStatus, isLoading, open]); // Re-run effect when status, loading state, or open function changes

	return (
		<Modal
			opened={opened}
			onClose={close}
			centered // Center the modal
			size="sm" // Adjust size as needed
			closeOnClickOutside={false} // Prevent closing on overlay click
			withCloseButton={false} // Remove the default close button
		>
			<Stack p="lg" gap="xs">
				<Text fw={700} size="1.6rem" ta="center">השתמשת בכל 20 השאלות החינמיות!</Text>
				<Text mt="md" ta="center" c="dimmed">
					כל הכבוד על ההתקדמות! 💪
					כדי להמשיך להתכונן למבחן בצורה יעילה ולקבל גישה בלתי מוגבלת לכל השאלות והנושאים,
					אפשר לשדרג לחשבון פרימיום.
				</Text>
				<Text mt="sm" ta="center" c="dimmed" size="sm">
					הצטרף למאות סטודנטים שכבר משתמשים בקוויז להצלחה במבחן!
				</Text>
			</Stack>

			<Button 
				fullWidth 
				component="a"
				href="https://pay.grow.link/c02bee3a144e461f86b5259126bb6407-MTk3NzA3Mw"
				rel="noopener noreferrer"
				mt="lg" 
				color="green"
				variant="light"
				leftSection={<IconCrown size={18} />}
			>
				רכוש מנוי
			</Button>

			<Group mt="md" grow justify="center">
				<Button
					variant="subtle"
					color="red"
					leftSection={<IconLogout size={18} />}
					onClick={handleLogout}
				>
					התנתק
				</Button>
				<Button
					variant="subtle"
					component="a"
					href="https://wa.me/972509733829"
					rel="noopener noreferrer"
					leftSection={<IconBrandWhatsapp size={18} />}
				>
					צור קשר
				</Button>
			</Group>

		</Modal>
	);
}; 