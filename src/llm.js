import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { store } from "./store.js";

export class LLM {
    selectedModel = "Llama-3-8B-Instruct-q4f32_1-MLC"
    messages = [
        { 
            role: "system", 
            content: "You are a whimsical poet. You receive sentences, phrases, words and turn them into brief poems related to the given input. You will only respond in poems." },
    ]

    constructor(args) {
        this.model = this.initialize(store.status)
    }

    async initialize(status) {
        const initProgressCallback = (report) => {
                if (report.text.includes("Fetching param cache")) {
                    // console.log({message: "Loading local LLM", progress: report.progress})
                    status.value = {message: "Loading local LLM", progress: report.progress}
                } else if(report.text.includes("Loading model from cache")) {
                    const cacheProgress = this.parseNumbersInBrackets(report.text)
                    // console.log({message: "Fetching LLM from cache", progress: cacheProgress[0]/cacheProgress[1]})
                    status.value = {message: "Fetching LLM from cache", progress: cacheProgress[0]/cacheProgress[1]}
                }
        };
        return await CreateWebWorkerMLCEngine(
            new Worker(
              new URL("./worker.ts", import.meta.url), 
              {
                type: "module",
              }
            ),
            this.selectedModel,
            { initProgressCallback }, // engineConfig
        );
    }

    parseNumbersInBrackets(text) {
        // Use regular expression to find numbers within square brackets
        const match = text.match(/\[(\d+)\/(\d+)\]/);
        
        // If a match is found, return the numbers as integers
        if (match) {
          return [parseInt(match[1], 10), parseInt(match[2], 10)];
        }
        
        // If no match is found, return an empty array
        return [];
      }

    async chat (
        message,
        func,
        addMessage
    ) {
        
        // append new message
        addMessage()
        const userMessage = { role: "user", content: message}
        this.messages.push(userMessage)
        const history = [...this.messages]
        const engine = await this.model
        const reply = await engine.chat.completions.create(
            {
                stream: true,
                stream_options: { include_usage: true },
                temperature: 0.8,
                max_tokens: 2500,
                // response_format: { type: "json_object" },
                messages: JSON.parse(JSON.stringify(history)),
            }
        );
        
        for await (const chunk of reply) {
            // console.log(chunk.choices[0].delta.content)
            if(!chunk.choices[0].delta.content){
                return undefined
            }
            func(chunk.choices[0].delta.content)

        }
        
        const fullReply = await engine.getMessage()
        this.messages.push({ role: "assistant",content: fullReply})
    }
}