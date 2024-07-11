<template>
      <div class="progress-card">
        <div class="progress-bar-container">
          <div 
            class="progress-bar"
            :style="{ width: `${progressPercentage}%` }"
          >
            <div class="progress-bar__pulse"></div>
          </div>
          <div 
            class="progress-bar__glow"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <p class="progress-text">
          Local LLM Upload Progress: {{ progressPercentage.toFixed(0) }}%
        </p>
      </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  
  const progress = ref(0)
  const progressPercentage = computed(() => progress.value * 100)
  
  let timer
  onMounted(() => {
    timer = setInterval(() => {
      progress.value += 0.01
      if (progress.value > 1) {
        progress.value = 0
      }
    }, 100)
  })
  
  onUnmounted(() => {
    clearInterval(timer)
  })
  </script>
  
  <style lang="scss" scoped>
  // Variables
  $bg-color-dark: #1a202c;
  $bg-color-card: hsl(218, 23%, 23%);
  $text-color: #1a202c;
  $progress-bg: #e2e8f0;
  $progress-gradient: linear-gradient(to right, #212121, #fab700, white);
  
  // Mixins
  @mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @mixin full-size {
    width: 100%;
    height: 100%;
  }
  
  // Keyframes
  @keyframes pulse {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 0.5; }
  }
  
  // Styles
  .progress-container {
    @include flex-center;
    min-height: 100vh;
    background-color: $bg-color-dark;
  }
  
  .progress-title {
    font-size: 1.275rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-align: center;
    color: $text-color;
  }
  
  .progress-bar-container {
    position: relative;
    width: 100%;
    height: 1rem;
    background-color: $progress-bg;
    border-radius: 9999px;
    overflow: hidden;
  }
  
  .progress-bar {
    @include full-size;
    background: $progress-gradient;
    border-radius: 9999px;
    transition: width 300ms ease-out;
    box-shadow: 
    inset 0 2px 4px rgba(255,255,255,0.1),
    inset 0 -2px 4px rgba(0,0,0,0.2),
    0 2px 4px rgba(0,0,0,0.2);
  
    &__pulse {
      @include full-size;
      background-color: $text-color;
      border-radius: 9999px;
      opacity: 0.25;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  
    &__glow {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: $progress-gradient;
      border-radius: 9999px;
      transition: width 300ms ease-out;
      filter: blur(4px);
      opacity: 0.5;
    }
  }
  
  .progress-text {
    font-size: 0.6rem;
    margin-top: 1rem;
    text-align: center;
    font-weight: 600;
    color: $text-color;
  }
  </style>