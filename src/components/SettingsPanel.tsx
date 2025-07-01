
import React, { useState } from 'react';
import { X, User, LogOut, Palette, Bell, Shield, Zap, Download, Trash, Moon, Sun, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  onClose: () => void;
  darkMode?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, darkMode = true }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('devloom-notifications') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('devloom-sound') === 'true';
  });
  const [customInstructions, setCustomInstructions] = useState(() => {
    return localStorage.getItem('devloom-instructions') || '';
  });

  const handleSignOut = async () => {
    await signOut();
    onClose();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const handleExportData = () => {
    const chatSessions = localStorage.getItem('chat-sessions');
    if (chatSessions) {
      const blob = new Blob([chatSessions], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devloom-chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your chat history has been exported successfully.",
      });
    } else {
      toast({
        title: "No Data",
        description: "No chat history found to export.",
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = () => {
    localStorage.removeItem('chat-sessions');
    window.location.reload();
    toast({
      title: "Data Cleared",
      description: "All chat history has been cleared successfully.",
    });
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('devloom-notifications', enabled.toString());
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    toast({
      title: enabled ? "Notifications Enabled" : "Notifications Disabled",
      description: `Notifications have been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('devloom-sound', enabled.toString());
    if (enabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    }
    toast({
      title: enabled ? "Sound Enabled" : "Sound Disabled",
      description: `Sound notifications have been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleInstructionsSave = () => {
    localStorage.setItem('devloom-instructions', customInstructions);
    toast({
      title: "Instructions Saved",
      description: "Your custom instructions have been saved successfully.",
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'advanced', label: 'Advanced', icon: Shield },
  ];

  return (
    <div className={`w-96 border-l ${darkMode ? 'bg-[#171717] border-gray-800' : 'bg-white border-gray-200'} flex flex-col h-full`}>
      <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
        <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-black'} text-xl`}>Settings</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className={`${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} rounded-lg w-8 h-8 p-0`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} overflow-x-auto`}>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-3 rounded-none border-b-2 transition-colors ${
              activeTab === tab.id
                ? `${darkMode ? 'border-[#22C55E] text-[#22C55E] bg-[#22C55E]/5' : 'border-green-500 text-green-600 bg-green-50'}`
                : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{tab.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'general' && (
          <>
            {/* User Profile */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-sm flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                  <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">Account</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>Manage your profile</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className={`p-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Email Address</p>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'} font-medium`}>{user?.email}</p>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className={`w-full ${darkMode ? 'text-gray-300 border-gray-600 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400' : 'text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600'}`}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Instructions */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-sm flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">Custom Instructions</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>Personalize AI responses</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Tell the AI how you'd like it to respond. For example: 'Always provide code examples' or 'Focus on React development'..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className={`${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} min-h-20`}
                  />
                  <Button
                    onClick={handleInstructionsSave}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Instructions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'appearance' && (
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-sm flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold">Appearance</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>Customize your experience</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'} font-medium`}>Dark Mode</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Optimized for coding</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={() => {}} />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-sm flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold">Notifications</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>Manage alerts</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg`}>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'} font-medium`}>Response Alerts</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get notified when AI responds</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={handleNotificationToggle} />
                </div>
                <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg`}>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'} font-medium`}>Sound Effects</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Play sounds for interactions</p>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'data' && (
          <Card className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:scale-105 transform rounded-2xl`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-sm flex items-center gap-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center ring-2 ring-yellow-500/20">
                  <Download className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="font-bold">Data Management</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>Export and manage your data</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  size="sm"
                  className={`w-full ${darkMode ? 'text-gray-300 border-white/20 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400' : 'text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'} transition-all duration-300 rounded-2xl h-10 group`}
                >
                  <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Export Chat History
                </Button>
                <Button
                  onClick={handleClearAllData}
                  variant="outline"
                  size="sm"
                  className={`w-full ${darkMode ? 'text-gray-300 border-white/20 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400' : 'text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600'} transition-all duration-300 rounded-2xl h-10 group`}
                >
                  <Trash className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'advanced' && (
          <Card className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:scale-105 transform rounded-2xl`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-sm flex items-center gap-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center ring-2 ring-orange-500/20">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="font-bold">Security</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>Privacy and protection</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`p-4 ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-2xl border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse"></div>
                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'} font-medium`}>End-to-End Encryption</p>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your conversations are encrypted and secure</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* App Info */}
        <div className={`p-6 ${darkMode ? 'bg-gradient-to-r from-white/5 to-transparent' : 'bg-gradient-to-r from-gray-100 to-transparent'} rounded-2xl border ${darkMode ? 'border-white/10' : 'border-gray-200'} backdrop-blur-sm`}>
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
              alt="DevLoom AI" 
              className="w-8 h-8 rounded-xl shadow-lg ring-2 ring-[#22C55E]/20"
            />
            <div>
              <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>DevLoom AI</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Version 2.1.0</p>
            </div>
          </div>
          <div className={`space-y-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
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
