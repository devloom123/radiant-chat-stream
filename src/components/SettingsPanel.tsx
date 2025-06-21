
import React from 'react';
import { X, User, LogOut, Palette, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="w-80 border-l bg-gradient-to-b from-[#161B22] to-[#0D1117] border-gray-800/50 backdrop-blur-sm">
      <div className="p-6 border-b border-gray-800/50 flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Settings</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-6 space-y-6">
        {/* User Profile */}
        <Card className="bg-gradient-to-r from-[#238636]/10 to-[#2ea043]/10 border-[#238636]/20 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">Account</div>
                <div className="text-xs text-gray-400 font-normal">Manage your profile</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-300 mb-1">Email</p>
                <p className="text-sm text-white font-medium">{user?.email}</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="w-full text-gray-300 border-gray-700/50 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-gray-800/20 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="font-medium">Appearance</div>
                <div className="text-xs text-gray-400 font-normal">Customize your experience</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Dark Mode</p>
                  <p className="text-xs text-gray-400">Always enabled for optimal coding</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-gray-800/20 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-xs text-gray-400 font-normal">Manage alerts and updates</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Response Alerts</p>
                  <p className="text-xs text-gray-400">Get notified when AI responds</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-2 p-4 bg-gray-800/10 rounded-lg border border-gray-700/30">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
              alt="DevLoom AI" 
              className="w-5 h-5 rounded"
            />
            <p className="font-medium text-gray-300">DevLoom AI</p>
          </div>
          <p>Powered by advanced AI technology for seamless development assistance.</p>
          <p>Your conversations are secure and encrypted.</p>
        </div>
      </div>
    </div>
  );
};
