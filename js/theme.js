// js/theme.js
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains("dark-theme") ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    body.classList.remove(`${currentTheme}-theme`);
    body.classList.add(`${newTheme}-theme`);
  
    // Save preference
    localStorage.setItem("theme", newTheme);
  }
  
  // On page load
  window.onload = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.add(`${savedTheme}-theme`);
  };
  