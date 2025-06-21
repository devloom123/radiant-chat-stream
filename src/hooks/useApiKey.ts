
import { useState, useEffect } from 'react';

export const useApiKey = () => {
  // Use the system API key directly
  const [apiKey] = useState<string>('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');
  const [loading] = useState(false);

  const saveApiKey = async (newApiKey: string) => {
    // No longer needed - using system key
    return { error: null };
  };

  const fetchApiKey = async () => {
    // No longer needed - using system key
  };

  return {
    apiKey,
    loading,
    saveApiKey,
    refetch: fetchApiKey
  };
};
