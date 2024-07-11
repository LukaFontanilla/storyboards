<script setup>
import ProgressBar from './components/ProgressBar.vue'
import SvgFlower from './components/SvgFlower.vue'
import ThemeSelector from './components/ThemeSelector.vue';
import { LLM } from './llm';
import { onMounted,ref, computed, watchEffect } from 'vue';
import { initDB, addData, getStoreData } from './db'
import { store } from './store.js'

const model = ref()
const message = ref('')
const storyboard = ref('')
const response = ref('')
const responseHistory = ref([])
const initialData = ref([])
const status = computed(()=>store.status.value)

onMounted(() => {
  if(status) {
    model.value = new LLM()
    initDB().then(async (res) => {
      const data = await getStoreData('storyboards')
      initialData.value = data
    })
  }
})

const streamText = (text) => {
  responseHistory.value[responseHistory.value.length - 1] += text
}

const addMessage = () => {
  responseHistory.value.push('')
}

const loadStoryboard = (index) => {
  message.value = ''
  storyboard.value = ''
  responseHistory.value = initialData.value[index].value.ideas
}

const saveStoryboard = () => {
  initialData.value.push({
    key: storyboard.value,
    value: {
      title: "",
      description: "", 
      ideas: JSON.parse(JSON.stringify(responseHistory.value)) 
    }
  })
  addData(
    'storyboards',
    { 
      title: "",
      description: "", 
      ideas: JSON.parse(JSON.stringify(responseHistory.value)) 
    },
    storyboard.value
  )
}

watchEffect(() => console.log(store.status.value))

</script>

<template>
  <div class="row">
    <div class="app__title">
      a Storyboard <span style="font-size: 0.8rem;">by Lukapuka</span>
    </div>
    <ThemeSelector />
    <div class="full-height storyboards">
      <div class="storyboard-container" v-for="(i,index) in initialData" @click="loadStoryboard(index)">
        <SvgFlower 
        :flower-index="i" 
        petalFillColor="white"
        petalStrokeColor="black"
        :blurColor="store.theme.accentColor"
        />
        <span class="storyboard-title">{{ i.key }}</span>
      </div>
    </div>
    <div class="column full-height">
      <div class="svg-sizing">
        <SvgFlower />
      </div>
      <div v-if="status" class="column options-sizing card">
        <div v-if="status.progress < 1">
          <span>{{ status.message }}</span>
          <ProgressBar />
        </div>
        <div style="width:100%;" v-else>
          <div class="container">
            <span class="input__title">Create your Storyboard</span>
            <label class="input">
              <input v-model="message" class="input__field" type="text" placeholder=" " />
              <span class="input__label">Prompt Me</span>
            </label>
            <button @click="model.chat(message,streamText,addMessage)">Click Me</button>
          </div>
          <div class="container">
            <span class="input__title">Name & Save your Storyboard</span>
            <label class="input">
              <input v-model="storyboard" class="input__field" type="text" placeholder=" " />
              <span class="input__label">Storyboard Name</span>
            </label>
            <button @click="saveStoryboard()">Save</button>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="transcript card" v-if="response.length > 0">
      <span>{{ response }}</span>
    </div> -->
    <div class="transcript-grid">
      <div class="transcript card" v-for="resp in responseHistory">
        <span>{{ resp }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

.app__title {
    position: absolute;
    top: 2rem;
    left:2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
  }
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding-bottom:2rem;
}
.storyboards {
  width: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
}
.transcript-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: min-content;
  gap: 20px;
  width: 50%
}
.svg-sizing {
  width: 20rem;
  height: 40%;
}
/* input {
  width:100%;
} */
button {
  width: 100%;
}

.options-sizing {
  height: 60%;
  width: 20rem;
}

.storyboard-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: center;
  cursor: pointer;
  height: 7rem;
}

.row {
  width: 90%;
  height:80%;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 4rem;
  padding-bottom: 4rem; 
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.full-height {
  height: 100%;
}
.column {
  width: 60%;
  display:flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  align-content: center;
}
.transcript {
  width: auto;
  max-height: 20rem;
  overflow-y: scroll;
  height: auto;
  padding: 2rem;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
