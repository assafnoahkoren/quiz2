import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import { modals } from '@mantine/modals';
import { updateModalsData } from './updateModalsData';
import { getCurrentUser, userKeys } from '../api/users';
import { User } from '../types/user';
import { queryClient } from '../main';

class UpdateModalsStore {
  private readonly STORAGE_PREFIX = 'modal_shown';

  constructor() {
    makeAutoObservable(this);
  }

  private getCurrentUserId(): string | number | null {
    // Try to get user from React Query cache first
    const cachedUser = queryClient.getQueryData<User>(userKeys.me());
    if (cachedUser) {
      return cachedUser.id;
    }
    return null;
  }

  private async fetchCurrentUser(): Promise<string | number | null> {
    try {
      // This will either get from cache or fetch if needed
      const user = await queryClient.fetchQuery({
        queryKey: userKeys.me(),
        queryFn: getCurrentUser,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      });
      return user.id;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }

  private getStorageKey(modalId: string, userId?: string | number): string {
    const id = userId || this.getCurrentUserId();
    if (!id) return `${this.STORAGE_PREFIX}_anonymous_${modalId}`;
    return `${this.STORAGE_PREFIX}_${id}_${modalId}`;
  }

  async showModal(modalId: string, userId?: string | number) {
    const modal = updateModalsData.find(m => m.id === modalId);
    if (!modal) {
      console.warn(`Modal with id "${modalId}" not found`);
      return;
    }

    const userIdToUse = userId || this.getCurrentUserId() || await this.fetchCurrentUser();

    modals.open({
      modalId,
      title: modal.title,
      children: modal.body,
      radius: 'lg',
      centered: true,
      onClose: () => {
        this.markModalAsShown(modalId, userIdToUse);
      },
    });
  }

  private markModalAsShown(modalId: string, userId?: string | number | null) {
    const key = this.getStorageKey(modalId, userId || undefined);
    localStorage.setItem(key, 'true');
  }

  hasModalBeenShown(modalId: string, userId?: string | number): boolean {
    const key = this.getStorageKey(modalId, userId);
    return localStorage.getItem(key) === 'true';
  }

  async showIfNeverSeen(modalId: string, userId?: string | number) {
    const userIdToUse = userId || this.getCurrentUserId() || await this.fetchCurrentUser();
    
    if (!this.hasModalBeenShown(modalId, userIdToUse || undefined)) {
      await this.showModal(modalId, userIdToUse || undefined);
    }
  }

  resetShownModals(userId?: string | number) {
    const id = userId || this.getCurrentUserId();
    if (!id) return;
    
    const prefix = `${this.STORAGE_PREFIX}_${id}_`;
    const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

const updateModalsStoreInstance = new UpdateModalsStore();

export const UpdateModalsContext = createContext<UpdateModalsStore | null>(null);

export const useUpdateModalsStore = (): UpdateModalsStore => {
  const store = useContext(UpdateModalsContext);
  if (!store) {
    throw new Error('useUpdateModalsStore must be used within UpdateModalsContext.Provider');
  }
  return store;
};

export { UpdateModalsStore };
export default updateModalsStoreInstance;