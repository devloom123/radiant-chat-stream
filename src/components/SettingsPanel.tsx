
import React from 'react';
import { X, User, LogOut, Palette, Bell, Shield, Zap } from 'lucide-react';
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
    <div className="w-96 border-l bg-gradient-to-b from-[#1A1F2E]/95 to-[#0F1419]/95 border-white/10 backdrop-blur-xl animate-slide-in-right">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-bold text-white text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Settings
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl w-10 h-10 p-0 transition-all duration-300 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="p-6 space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto">
        {/* User Profile */}
        <Card className="bg-gradient-to-r from-[#22C55E]/10 to-[#16A34A]/10 border-[#22C55E]/20 backdrop-blur-sm hover:border-[#22C55E]/40 transition-all duration-300 hover:shadow-lg hover:scale-105 transform rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-[#22C55E]/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Account</div>
                <div className="text-xs text-gray-400 font-normal">Manage your profile</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <p className="text-sm text-gray-300 mb-2 font-medium">Email Address</p>
                <p className="text-sm text-white font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {user?.email}
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="w-full text-gray-300 border-white/20 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 rounded-2xl h-12 group"
              >
                <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Sign Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:scale-105 transform rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center ring-2 ring-purple-500/20">
                <Palette className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-bold">Appearance</div>
                <div className="text-xs text-gray-400 font-normal">Customize your experience</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div>
                  <p className="text-sm text-white font-medium">Dark Mode</p>
                  <p className="text-xs text-gray-400">Optimized for coding sessions</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:scale-105 transform rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center ring-2 ring-blue-500/20">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-bold">Notifications</div>
                <div className="text-xs text-gray-400 font-normal">Manage alerts and updates</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div>
                  <p className="text-sm text-white font-medium">Response Alerts</p>
                  <p className="text-xs text-gray-400">Get notified when AI responds</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:scale-105 transform rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center ring-2 ring-orange-500/20">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="font-bold">Security</div>
                <div className="text-xs text-gray-400 font-normal">Privacy and protection</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse"></div>
                <p className="text-sm text-white font-medium">End-to-End Encryption</p>
              </div>
              <p className="text-xs text-gray-400">Your conversations are encrypted and secure</p>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="p-6 bg-gradient-to-r from-white/5 to-transparent rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
              alt="DevLoom AI" 
              className="w-8 h-8 rounded-xl shadow-lg ring-2 ring-[#22C55E]/20"
            />
            <div>
              <p className="font-bold text-gray-200">DevLoom AI</p>
              <p className="text-xs text-gray-400">Version 2.0.0</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#22C55E]" />
              <span>Powered by advanced AI technology</span>
            </div>
            <p>Your conversations are secure and encrypted.</p>
            <p>Built with modern web technologies for optimal performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
