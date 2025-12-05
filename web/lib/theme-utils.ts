type Theme = 'light' | 'dark' | 'system';

// Function to get the current theme safely (works on both client and server)
export function getTheme(): Theme {
  // Default to 'system' for server-side rendering
  if (typeof window === 'undefined') return 'system';
  
  // Check localStorage
  const storedTheme = localStorage.getItem('theme') as Theme | null;
  if (storedTheme) return storedTheme;
  
  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Default to light
  return 'light';
}

// Provider for safe client-side theme handling
export function initializeTheme() {
  if (typeof window === 'undefined') return;
  
  // Apply theme to document
  const theme = getTheme();
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
