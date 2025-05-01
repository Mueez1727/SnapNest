// theme.js
// Load the theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    applyTheme(savedTheme);
  }

  // Find the theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (!themeToggleBtn) {
    console.warn('Theme toggle button not found!');
    return;
  }

  // Attach the click event listener
  themeToggleBtn.addEventListener('click', toggleTheme);
});

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark-theme');
  document.documentElement.classList.toggle('light-theme', !isDark);

  const selectedTheme = isDark ? 'dark' : 'light';

  // Save to localStorage
  localStorage.setItem('theme', selectedTheme);

  // OPTIONAL: Send to server if needed
  fetch('php/theme_setting.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ theme: selectedTheme })
  });
  updateThemeIcon(selectedTheme); 
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  }
  updateThemeIcon(theme); // <-- Add this line
}

function updateThemeIcon(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === 'dark' ? '🌞' : '🌙';
  }
}
