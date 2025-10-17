import { useTheme, ThemeMode } from '../hooks/useTheme';

const themes: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

export const ThemeToggle = () => {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex gap-1 bg-base-200 rounded-lg p-1">
      {themes.map((theme) => (
        <button
          key={theme.value}
          className={`px-3 py-1.5 rounded-md text-base transition-colors ${
            mode === theme.value
              ? 'bg-primary text-primary-content'
              : 'hover:bg-base-300'
          }`}
          onClick={() => setMode(theme.value)}
          aria-label={theme.label}
          title={theme.label}
        >
          {theme.icon}
        </button>
      ))}
    </div>
  );
};
