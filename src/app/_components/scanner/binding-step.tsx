// _components/scanner/binding-step.tsx

import React from 'react';
import { BindingStepProps } from './types';

export const BindingStep: React.FC<BindingStepProps> = ({ deviceTypeName, packageName }) => {
  return (
    <div className="py-8 flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-blue-500 font-medium">Binding {deviceTypeName}...</p>
      <p className="text-sm text-gray-500 text-center">
        Please wait while we bind package {packageName} to your account
      </p>
    </div>
  );
};