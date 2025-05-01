// theme.js
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark-theme');
  document.documentElement.classList.toggle('light-theme', !isDark);

  fetch('php/theme_setting.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ theme: isDark ? 'dark' : 'light' })
  });
}
