import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import { modals } from '@mantine/modals';
import { updateModalsData } from './updateModalsData';

class UpdateModalsStore {
  shownModalIds: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this);
  }

  showModal(modalId: string) {
    const modal = updateModalsData.find(m => m.id === modalId);
    if (!modal) {
      console.warn(`Modal with id "${modalId}" not found`);
      return;
    }

    modals.open({
      modalId,
      title: modal.title,
      children: modal.body,
      radius: 'lg',
      centered: true,
      onClose: () => {
        this.shownModalIds.add(modalId);
      },
    });
  }

  hasModalBeenShown(modalId: string): boolean {
    return this.shownModalIds.has(modalId);
  }

  resetShownModals() {
    this.shownModalIds.clear();
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