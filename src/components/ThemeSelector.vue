<template>
    <div class="theme-selector">
      <label for="theme-select">Theme:</label>
      <select id="theme-select" v-model="selectedTheme" @change="changeTheme">
        <option v-for="theme in themes" :key="theme.name" :value="theme.name">
          {{ theme.label }}
        </option>
      </select>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { store } from '../store.js';
  
  const selectedTheme = ref('default');
  
  const themes = [
    { name: 'default', label: 'Default', accentColor: '#007bff',backgroundColor: 'rgba(0,123,255,0.2)' },
    { name: 'dark', label: 'Dark', accentColor: '#6c757d',backgroundColor: 'rgba(108,117,125,0.2)' },
    { name: 'nature', label: 'Nature', accentColor: '#28a745',backgroundColor: 'rgba(40,167,69,0.2)' },
    { name: 'ocean', label: 'Ocean', accentColor: '#17a2b8',backgroundColor: 'rgba(23,162,184,0.2)' },
    { name: 'bold' , label: 'Bold', accentColor: 'rgba(250,183,0)', backgroundColor: 'rgba(250,183,0,0.2)' }
  ];
  
  const changeTheme = () => {
    const theme = themes.find(t => t.name === selectedTheme.value);
    if (theme) {
      document.documentElement.style.setProperty('--color-accent', theme.accentColor);
      document.documentElement.style.setProperty('--color-background', theme.backgroundColor);
      store.theme = theme;
    }
  };
  
  onMounted(() => {
    const savedTheme = store.theme;
    if (savedTheme && themes.some(t => t.name === savedTheme.name)) {
      selectedTheme.value = savedTheme.name;
      changeTheme();
    }
  });
  </script>
  
  <style scoped>
  .theme-selector {
    position: absolute;
    top: 2rem;
    right:2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  select {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--color-accent, #007bff);
  }
  </style>