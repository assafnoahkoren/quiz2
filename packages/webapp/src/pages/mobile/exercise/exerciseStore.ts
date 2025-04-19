import { makeAutoObservable } from 'mobx';

class ExerciseStore {
  constructor() {
    makeAutoObservable(this);
  }
}

export default new ExerciseStore(); 