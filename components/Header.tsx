import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => (
  <header className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <div className="flex-1"></div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text text-center">
        Mergenimate
      </h1>
      <div className="flex-1 flex justify-end">
        <ThemeToggle />
      </div>
    </div>
    <p className="mt-2 text-lg text-center opacity-70">Upload, reorder, and blend images to generate a self-contained animation script.</p>
  </header>
);
