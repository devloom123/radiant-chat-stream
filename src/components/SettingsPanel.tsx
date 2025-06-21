
import React, { useState } from 'react';
import { X, Key, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiKey } from '@/hooks/useApiKey';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { apiKey, saveApiKey, loading } = useApiKey();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleSaveApiKey = async () => {
    setSaving(true);
    const { error } = await saveApiKey(tempApiKey);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "API key saved successfully!",
      });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (loading) {
    return (
      <div className="w-80 border-l bg-[#161B22] border-gray-800 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-[#161B22] border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-white">Settings</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-6">
        {/* User Info */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <User className="w-4 h-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-sm text-gray-300">{user?.email}</p>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="w-full text-gray-300 border-gray-700 hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Key Section */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Key className="w-4 h-4" />
              OpenRouter API Key
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Your API key is stored securely in the database
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Enter your OpenRouter API key"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="text-sm bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
              />
              <Button
                onClick={handleSaveApiKey}
                disabled={saving || tempApiKey === apiKey}
                size="sm"
                className="w-full bg-[#238636] hover:bg-[#2ea043] text-white"
              >
                {saving ? 'Saving...' : 'Save API Key'}
              </Button>
              <p className="text-xs text-gray-500">
                Get your API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#238636] hover:underline"
                >
                  openrouter.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            <strong>OpenRouter</strong> provides access to multiple AI models through a single API.
          </p>
          <p>
            Your API key is encrypted and stored securely in our database.
          </p>
        </div>
      </div>
    </div>
  );
};
