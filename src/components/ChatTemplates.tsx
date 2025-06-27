
import React, { useState } from 'react';
import { MessageSquare, Code, Lightbulb, Bug, Book, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ChatTemplatesProps {
  onSelectTemplate: (template: string) => void;
}

export const ChatTemplates: React.FC<ChatTemplatesProps> = ({ onSelectTemplate }) => {
  const templates = [
    {
      icon: Code,
      title: 'Code Review',
      description: 'Get feedback on your code',
      template: 'Please review this code and provide suggestions for improvement:\n\n```\n// Paste your code here\n```',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      icon: Bug,
      title: 'Debug Help',
      description: 'Find and fix bugs',
      template: 'I\'m encountering an error in my code. Here\'s the error message and relevant code:\n\nError: \nCode:\n```\n// Paste your code here\n```',
      color: 'text-red-400',
      bg: 'bg-red-400/10'
    },
    {
      icon: Lightbulb,
      title: 'Feature Ideas',
      description: 'Brainstorm new features',
      template: 'I\'m working on a project and need ideas for new features. Here\'s what my project does:\n\nProject description: \nTarget audience: \nCurrent features: ',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10'
    },
    {
      icon: Book,
      title: 'Explain Concept',
      description: 'Learn something new',
      template: 'Can you explain this concept in simple terms with examples?\n\nConcept: ',
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      icon: Zap,
      title: 'Quick Fix',
      description: 'Fast solutions',
      template: 'I need a quick solution for this problem:\n\nProblem: \nContext: \nExpected outcome: ',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
      {templates.map((template, index) => (
        <Card
          key={index}
          className={`${template.bg} border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer hover:scale-105 transform`}
          onClick={() => onSelectTemplate(template.template)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${template.bg} border border-gray-600`}>
                <template.icon className={`w-4 h-4 ${template.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">{template.title}</h3>
                <p className="text-xs text-gray-400">{template.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
