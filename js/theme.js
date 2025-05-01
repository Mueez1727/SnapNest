// theme.js

// Load the theme on page load
document.addEventListener('DOMContentLoaded', () => {
  // OPTIONAL: Replace this with a fetch call to your PHP script if it returns saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
});

function toggleTheme() {
  console.log('button is pressed!');
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
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  }
}
