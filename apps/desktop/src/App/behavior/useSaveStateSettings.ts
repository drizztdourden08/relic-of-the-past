import { useState, useCallback } from 'react';

const useSaveStateSettings = () => {
  const [enhancedSaveSlot, setEnhancedSaveSlot] = useState(true);
  const [saveHoldDuration, setSaveHoldDuration] = useState(2);

  const handleSaveSlotSettingsChange = useCallback((enhanced: boolean, holdDuration: number) => {
    setEnhancedSaveSlot(enhanced);
    setSaveHoldDuration(holdDuration);
  }, []);

  const initFromSettings = useCallback((enhanced: boolean, holdDuration: number) => {
    setEnhancedSaveSlot(enhanced);
    setSaveHoldDuration(holdDuration);
  }, []);

  return {
    enhancedSaveSlot,
    saveHoldDuration,
    handleSaveSlotSettingsChange,
    initFromSettings,
  };
};

export { useSaveStateSettings };
