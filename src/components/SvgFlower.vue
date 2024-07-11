<script setup>
import * as d3 from "d3";
import { onMounted, defineProps, computed, ref, watch } from "vue";

// Props with validation
const props = defineProps({
  flowerIndex: {
    type: Number,
    default: undefined
  },
  petalFillColor: {
    type: String,
    default: 'none'
  },
  petalStrokeColor: {
    type: String,
    default: 'rgba(0,0,0,1)'
  },
  blurColor: {
    type: String,
    default: undefined
  }
});

// Error state
const error = ref(null);

// Computed properties
const data = computed(() => {
  try {
    return props.flowerIndex !== undefined ? generateRandomArray() : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  } catch (err) {
    handleError(err);
    return [];
  }
});

const flowerIndexClass = computed(() => props.flowerIndex >= 0 ? `viz__${props.flowerIndex}` : 'viz');
const flowerIndexClasses = computed(() => props.flowerIndex >= 0 ? `viz__${props.flowerIndex} mini-height` : `viz full-height`);

// Computed property to determine if blur should be applied
const shouldApplyBlur = computed(() => props.flowerIndex !== undefined && props.blurColor !== undefined);

// Constants
const shapes = [
  `M2,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 2,0`,
  `M0 0,C50 25 50 75 0 100,C-50 75 -50 25 0 0`,
  `M0,0 C60,40 60,70 30,100 L0,85 L-30,100 C-60,70 -60,40 0,0`,
  `M0,0 Q50,50 0,100 Q-50,50 0,0`,
  `M0,0 C50,0 50,100 0,100 C-50,100 -50,0 0,0`
];

// Helper functions
function generateRandomArray() {
  const length = Math.floor(Math.random() * 21);
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
}

function calculateRotation(total, i) {
  if (typeof total !== 'number' || typeof i !== 'number') {
    throw new Error('calculateRotation: Invalid input types');
  }
  if (total === 0) {
    throw new Error('calculateRotation: Total cannot be zero');
  }
  return (360 / total) * i;
}

function generatePetalColor(i, total) {
  return d3.interpolateRainbow(i / total);
}

// Error handling function
function handleError(err) {
  console.error('An error occurred:', err);
  error.value = err.message;
}

// D3 drawing functions
let el = ref(null);

function drawData(startX, scale = 0.8, index) {
  if (!el.value) {
    handleError(new Error('SVG element not found'));
    return;
  }

  try {
    const viz = d3.select(el.value)
      .append("g")
      .classed(".flower", true)
      .style("transform", `translate(20, 20)`);

    // Add blur effect only if both flowerIndex and blurColor are provided
    if (shouldApplyBlur.value) {
      addBlurEffect();

      // Draw blur background
      viz.append("circle")
        .attr("r", "40")
        .attr("fill", props.blurColor)
        .style("filter", "url(#blurFilter)")
        .attr("transform", `translate(${startX}, 100)`);
    }

    // Randomly select a single petal shape for this flower
    const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];

    // Draw petals
    viz.selectAll("path")
      .data(data.value)
      .enter()
      .append("path")
      .attr("fill", (d, i) => props.petalFillColor === 'dynamic' ? generatePetalColor(i, data.value.length) : props.petalFillColor)
      .attr("stroke", (d, i) => props.petalStrokeColor === 'dynamic' ? generatePetalColor(i, data.value.length) : props.petalStrokeColor)
      .attr("stroke-width", "2")
      .attr("d", selectedShape)
      .attr("transform", (d, i) => {
        const rotation = calculateRotation(data.value.length, i);
        return `translate(${startX},100)rotate(${rotation})scale(${index * scale})`;
      });

    // Draw center circle
    viz.append("circle")
      .attr("r", "2")
      .attr("fill", props.petalStrokeColor)
      .attr("transform", `translate(${startX}, 100)`);
  } catch (err) {
    handleError(err);
  }
}

function addBlurEffect() {
  if (!el.value) {
    handleError(new Error('SVG element not found'));
    return;
  }

  try {
    const defs = d3.select(el.value).append("defs");
    const filter = defs.append("filter")
      .attr("id", "blurFilter");
    
    filter.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "10");
  } catch (err) {
    handleError(err);
  }
}

function drawRemainingPetals() {
  if (!el.value) {
    handleError(new Error('SVG element not found'));
    return;
  }

  try {
    const paths = d3.select(el.value).selectAll("path")._groups[0];
    paths.forEach((p, i) => {
      if (i !== 0) {
        d3.select(paths[i])
          .attr("stroke-dasharray", p.getTotalLength() + " " + p.getTotalLength())
          .attr("stroke-dashoffset", p.getTotalLength())
          .attr("stroke-dashoffset", 0);
      }
    });
  } catch (err) {
    handleError(err);
  }
}

// Lifecycle hooks
onMounted(() => {
  try {
    drawData(300, 0.6, 1);
    drawRemainingPetals();
  } catch (err) {
    handleError(err);
  }
});

// Watch for changes in props
watch([() => props.flowerIndex, () => props.petalFillColor, () => props.petalStrokeColor, () => props.blurColor], 
  ([newFlowerIndex, newFillColor, newStrokeColor, newBlurColor], 
   [oldFlowerIndex, oldFillColor, oldStrokeColor, oldBlurColor]) => {
  if (newFlowerIndex !== oldFlowerIndex || 
      newFillColor !== oldFillColor || 
      newStrokeColor !== oldStrokeColor || 
      newBlurColor !== oldBlurColor) {
    try {
      // Clear previous drawing
      if (el.value) {
        d3.select(el.value).selectAll("*").remove();
      }
      // Redraw with new data and colors
      drawData(300, 0.6, 1);
      drawRemainingPetals();
    } catch (err) {
      handleError(err);
    }
  }
});
</script>

<template>
  <div class="viz" :class="flowerIndexClasses">
    <svg 
      ref="el" 
      style="overflow: visible" 
      viewBox="215 0 160 200" 
      width="100%" 
      height="100%"
    >
    </svg>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.full-height {
  height: 100%;
}
.mini-height {
  height: 4rem;
}
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
</style>