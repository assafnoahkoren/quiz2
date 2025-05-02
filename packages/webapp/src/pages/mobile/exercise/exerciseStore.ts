import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import { SubjectTreeItem } from '../../../api/types'; // Adjust import path again

// Define Exercise Phase Type
export type ExercisePhase = "pickingSubjects" | "exercising" | "done";

// Helper function (can be kept here or moved to utils)
const getAllDescendantIds = (subject: SubjectTreeItem, map: Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }>): string[] => {
  let ids = [subject.id];
  const nodeInfo = map.get(subject.id);
  if (nodeInfo && nodeInfo.childrenIds.length > 0) {
    nodeInfo.childrenIds.forEach(childId => {
      const childNodeInfo = map.get(childId);
      if (childNodeInfo) {
         ids = ids.concat(getAllDescendantIds(childNodeInfo.subject, map));
      }
    });
  }
  return ids;
};


// Export the class for type usage
export class ExerciseStore {
  selectedSubjectIds = new Set<string>();
  subjectMap = new Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }>();
  allSubjectsFlatMap = new Map<string, SubjectTreeItem>(); // For easy question count lookup
  shouldSelectAllOnLoad = false; // Flag to trigger selection after load
  currentPhase: ExercisePhase = "pickingSubjects"; // Track exercise phase
  skipAnswered: boolean = true;

  constructor() {
    makeAutoObservable(this);
    // Initialize state properties here
  }

  setSubjectData(subjects: SubjectTreeItem[]) {
    this.subjectMap = this.buildSubjectMap(subjects);
    this.allSubjectsFlatMap = this.buildAllSubjectsFlatMap(subjects);
  }

  private buildSubjectMap(subjects: SubjectTreeItem[], parentId: string | null = null): Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }> {
    const map = new Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }>();
    subjects.forEach(subject => {
      const childrenIds = subject.children ? subject.children.map((child: SubjectTreeItem) => child.id) : []; // Add type annotation
      map.set(subject.id, { subject, parentId, childrenIds });
      if (subject.children) {
        const childMap = this.buildSubjectMap(subject.children, subject.id);
        childMap.forEach((value, key) => map.set(key, value));
      }
    });
    return map;
  }

   private buildAllSubjectsFlatMap(subjects: SubjectTreeItem[]): Map<string, SubjectTreeItem> {
    const result = new Map<string, SubjectTreeItem>();
    const processSubject = (subject: SubjectTreeItem) => {
        result.set(subject.id, subject);
        if (subject.children && subject.children.length > 0) {
        subject.children.forEach(processSubject);
        }
    };
    subjects.forEach(processSubject);
    return result;
   }


  toggleSubjectSelection(subjectId: string) {
    const nodeInfo = this.subjectMap.get(subjectId);
    if (!nodeInfo) return;

    const { subject } = nodeInfo;
    const isCurrentlySelected = this.selectedSubjectIds.has(subjectId);
    const descendantIds = getAllDescendantIds(subject, this.subjectMap); // Pass map

    const newSelectedIds = new Set(this.selectedSubjectIds);

    // Select/deselect descendants
    descendantIds.forEach(id => {
      if (!isCurrentlySelected) { // If selecting
        newSelectedIds.add(id);
      } else { // If deselecting
        newSelectedIds.delete(id);
      }
    });

    // Update ancestors
    let currentParentId = nodeInfo.parentId;
    while (currentParentId) {
      const parentInfo = this.subjectMap.get(currentParentId);
      if (!parentInfo) break;

      const allChildrenSelected = parentInfo.childrenIds.every(childId => newSelectedIds.has(childId));

      if (!isCurrentlySelected) { // If selecting
        // If checking a node, ensure parent is checked if all siblings are now checked
        if (allChildrenSelected) {
          newSelectedIds.add(currentParentId);
        }
      } else { // If deselecting
        // If unchecking a node, always uncheck the parent
        newSelectedIds.delete(currentParentId);
      }
      currentParentId = parentInfo.parentId; // Move up the tree
    }
    
    this.selectedSubjectIds = newSelectedIds; // MobX handles the update
  }

  prepareSelectAllOnLoad() {
    this.shouldSelectAllOnLoad = true;
  }

  resetSelectAllOnLoad() {
    this.shouldSelectAllOnLoad = false;
  }

  selectAllSubjects() {
      // Get all subject IDs from the flat map
      const allIds = Array.from(this.allSubjectsFlatMap.keys());
      // Create a new Set with all IDs and update the observable
      this.selectedSubjectIds = new Set(allIds);
      // Note: Starting exercise immediately after selectAll might require phase change here or elsewhere
  }

  deselectAll() {
      // Clear the selection by assigning a new empty Set
      this.selectedSubjectIds = new Set<string>();
      this.resetSelectAllOnLoad(); // Also reset the flag
      this.resetPhase(); // Reset phase when deselecting all
  }

  startExercising() {
      if (this.selectedSubjectIds.size > 0) {
          this.currentPhase = "exercising";
      }
  }

  finishExercise() {
      this.currentPhase = "done";
  }

  resetPhase() {
      this.currentPhase = "pickingSubjects";
  }

  // Method to set skipAnswered
  setSkipAnswered(value: boolean) {
    this.skipAnswered = value;
  }
  

  // Computed property for selected count
  get selectedSubjectsCount(): number {
      return this.selectedSubjectIds.size;
  }

  // Computed property for total questions (optional, might need refinement if data dependency is complex)
  // get totalSelectedQuestions(): number {
  //    let questionSum = 0;
  //    this.selectedSubjectIds.forEach(id => {
  //        const subject = this.allSubjectsFlatMap.get(id);
  //        if (subject && subject.questionCount) {
  //            questionSum += subject.questionCount;
  //        }
  //    });
  //    return questionSum;
  // }

  // Add other store methods and properties here
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