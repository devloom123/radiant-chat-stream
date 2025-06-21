
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchApiKey();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching API key:', error);
      } else if (data) {
        setApiKey(data.api_key);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (newApiKey: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          api_key: newApiKey,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving API key:', error);
        return { error: error.message };
      }

      setApiKey(newApiKey);
      return { error: null };
    } catch (error) {
      console.error('Error saving API key:', error);
      return { error: 'Failed to save API key' };
    }
  };

  return {
    apiKey,
    loading,
    saveApiKey,
    refetch: fetchApiKey
  };
};
