import { reactive } from "vue";

export const store = reactive({
    status: {
        message: '',
        progress: 0
    },
    theme: "default"
})