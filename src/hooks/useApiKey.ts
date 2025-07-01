
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useApiKey = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchApiKey = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First try to get from localStorage for immediate use
      const localKey = localStorage.getItem('openrouter-api-key');
      if (localKey) {
        setApiKey(localKey);
      }

      // Then try to get from Supabase
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setApiKey(data.api_key);
        localStorage.setItem('openrouter-api-key', data.api_key);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (newApiKey: string) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          api_key: newApiKey,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setApiKey(newApiKey);
        localStorage.setItem('openrouter-api-key', newApiKey);
      }

      return { error };
    } catch (error) {
      console.error('Error saving API key:', error);
      return { error: 'Failed to save API key' };
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, [user]);

  return {
    apiKey,
    loading,
    saveApiKey,
    refetch: fetchApiKey
  };
};
