import React from 'react';
import { Box, Badge, Tooltip, Text } from '@mantine/core';
import { Subscription } from '../../../../types/user';

interface UserSubscriptionCellProps {
  subscriptions?: Subscription[];
}

export const UserSubscriptionCell: React.FC<UserSubscriptionCellProps> = ({ subscriptions }) => {
  // If no subscriptions array or empty array
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Badge color="gray">No subscription</Badge>
        <Text size="sm">(0)</Text>
      </Box>
    );
  }

  // Sort subscriptions by expiration date (latest first)
  const sortedSubscriptions = [...subscriptions].sort(
    (a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
  );
  
  // Get the latest subscription
  const latestSubscription = sortedSubscriptions[0];
  
  // Check if user has any active subscription
  const isActive = hasActiveSubscription(subscriptions);
  
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Tooltip 
        label={`תוקף: ${new Date(latestSubscription.expiresAt).toLocaleDateString('he-IL')}`}
        withArrow
      >
        <Badge 
          color={isActive ? 'green' : 'red'}
        >
          {isActive ? 'פעיל' : 'פג תוקף'}
        </Badge>
      </Tooltip>
      <Text size="sm" c="dimmed">(סה"כ {subscriptions.length} מנויים)</Text>
    </Box>
  );
}; 

// Local utility functions

/**
 * Filters an array of subscriptions to return only expired ones
 */
const getExpiredSubscriptions = (subscriptions?: Subscription[]): Subscription[] => {
	if (!subscriptions || subscriptions.length === 0) {
	  return [];
	}
	
	const currentDate = new Date();
	return subscriptions.filter(
	  subscription => new Date(subscription.expiresAt) < currentDate
	);
  };
  
  /**
   * Filters an array of subscriptions to return only active ones
   */
  const getActiveSubscriptions = (subscriptions?: Subscription[]): Subscription[] => {
	if (!subscriptions || subscriptions.length === 0) {
	  return [];
	}
	
	const currentDate = new Date();
	return subscriptions.filter(
	  subscription => new Date(subscription.expiresAt) >= currentDate
	);
  };
  
  /**
   * Checks if a user has any active subscriptions
   */
  const hasActiveSubscription = (subscriptions?: Subscription[]): boolean => {
	return getActiveSubscriptions(subscriptions).length > 0;
  };