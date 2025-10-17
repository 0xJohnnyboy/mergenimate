import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center mb-8">
    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-light text-transparent bg-clip-text">
      Mergenimate
    </h1>
    <p className="mt-2 text-lg text-gray-400">Upload, reorder, and blend images to generate a self-contained animation script.</p>
  </header>
);
