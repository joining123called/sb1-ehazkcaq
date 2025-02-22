import React from 'react';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-purple-500/10 p-8 rounded-2xl backdrop-blur-xl">
        <Construction className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          {description || "We're working hard to bring you this feature. Stay tuned for updates!"}
        </p>
      </div>
    </div>
  );
}