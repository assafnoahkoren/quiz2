import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';

// Export the class for type usage
export class ExerciseStore {
  constructor() {
    makeAutoObservable(this);
    // Initialize state properties here
  }

  // Add store methods and properties here
}

// Create an instance of the store
const exerciseStoreInstance = new ExerciseStore();

// Create the context
const ExerciseContext = createContext<ExerciseStore | undefined>(undefined);

// Context Provider component (optional, but good practice)
// You would wrap parts of your app with this if you weren't providing it in ExerciseComponent
// export const ExerciseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <ExerciseContext.Provider value={exerciseStoreInstance}>
//     {children}
//   </ExerciseContext.Provider>
// );

// Hook to use the store context
export const useExerciseStore = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExerciseStore must be used within an ExerciseProvider or context value must be provided');
  }
  return context;
};

// Export the context itself if needed for direct use
export { ExerciseContext };

// Export the instance as default (or named, depending on preference)
export default exerciseStoreInstance; 