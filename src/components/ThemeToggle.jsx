import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="
        relative w-14 h-7 rounded-full
        bg-surface-200 dark:bg-surface-700
        transition-colors duration-300
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-surface-900
      "
      aria-label={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
    >
      <div
        className={`
          absolute top-0.5 w-6 h-6 rounded-full
          bg-white dark:bg-surface-900
          shadow-md
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${theme === 'dark' ? 'left-[30px]' : 'left-0.5'}
        `}
      >
        {theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-primary-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-warn-500" />
        )}
      </div>
    </button>
  );
}
