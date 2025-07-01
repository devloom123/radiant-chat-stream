
import React from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from './FileUpload';
import { PromptImprover } from './PromptImprover';
import { VoiceActivityIndicator } from './VoiceActivityIndicator';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  isLoading: boolean;
  isListening: boolean;
  speechSupported: boolean;
  darkMode: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  startListening: () => void;
  stopListening: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  selectedFiles,
  setSelectedFiles,
  isLoading,
  isListening,
  speechSupported,
  darkMode,
  onSendMessage,
  onKeyPress,
  startListening,
  stopListening,
}) => {
  return (
    <>
      {/* Voice Activity Indicator */}
      {isListening && (
        <div className="px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <VoiceActivityIndicator isActive={isListening} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-[#171717]' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`relative flex items-end gap-3 p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-2xl border focus-within:border-gray-600`}>
            <FileUpload
              onFileSelect={(files) => setSelectedFiles(prev => [...prev, ...files])}
              selectedFiles={selectedFiles}
              onRemoveFile={(index) => {
                setSelectedFiles(prev => prev.filter((_, i) => i !== index));
              }}
              darkMode={darkMode}
            />
            
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Message DevLoom AI..."
                disabled={isLoading}
                className={`border-0 bg-transparent ${darkMode ? 'text-white placeholder-gray-400' : 'text-black placeholder-gray-500'} focus:ring-0 p-0 text-base resize-none`}
                style={{ boxShadow: 'none' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <PromptImprover
                originalPrompt={inputValue}
                onImprovedPrompt={setInputValue}
                darkMode={darkMode}
              />

              {speechSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                    isListening 
                      ? 'text-red-400 bg-red-400/10' 
                      : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}

              <Button
                onClick={onSendMessage}
                disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
                className={`${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} disabled:opacity-50 h-8 w-8 p-0 rounded-lg transition-colors duration-200`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
