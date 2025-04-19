import React from 'react';
import { observer } from 'mobx-react-lite';
import exerciseStore from './exerciseStore';

const ExerciseComponent: React.FC = () => {
  return (
    <div>
      {/* Exercise component content will go here */}
    </div>
  );
};

export default observer(ExerciseComponent); 