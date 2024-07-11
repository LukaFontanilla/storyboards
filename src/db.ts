/**
 * This file contains the IndexedDB logic for storing and retrieving chat messages for explore assistant
 */

let request: IDBOpenDBRequest
let db: IDBDatabase
let version = 1

export enum Stores {
  Chat = 'storyboards',
}

/**
 * Initializes the database connection.
 * @returns A promise that resolves to a boolean indicating whether the database connection was successfully established.
 */
export const initDB = () => {
  return new Promise((resolve) => {
    // open the connection
    request = indexedDB.open('myDB', 1)

    request.onupgradeneeded = (e) => {
      db = e.target?.result

      // if the data object store doesn't exist, create it
      if (!db.objectStoreNames.contains(Stores.Chat)) {
        db.createObjectStore(Stores.Chat, { autoIncrement: true })
      }
    }

    request.onsuccess = () => {
      db = request.result
      version = db.version
      resolve(true)
    }

    request.onerror = () => {
      resolve(false)
    }
  })
}

/**
 * Adds data to the specified store in IndexedDB.
 * @param storeName - The name of the store to add data to.
 * @param data - The data to be added to the store.
 * @returns A promise that resolves with the added data or an error message.
 */
export const addData = (storeName: string, data: any, key: string) => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB', version)

    request.onsuccess = () => {
      db = request.result
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      store.add(data,key)
      resolve(data)
    }

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error)
      } else {
        resolve('Unknown error')
      }
    }
  })
}

/**
 * Retrieves data from the specified object store in the indexedDB.
 * @param storeName - The name of the object store to retrieve data from.
 * @returns A promise that resolves with the retrieved data.
 */
export const getStoreData = (storeName: string) => {
  return new Promise((resolve, reject) => {
    request = indexedDB.open('myDB')

    request.onsuccess = () => {
      db = request.result
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName).getAllKeys()
      store.onsuccess = (event) => {
        const keys = event?.target?.result
        if (keys?.length) {
          // Start a new transaction for final result
          const valuesTr = db.transaction(storeName)
          const objStore = valuesTr.objectStore(storeName)
    
          const result: { key: string, value: any}[] = [] // { key, value }[]
    
          // Iterate over keys
          keys.forEach(key => {
            const tr = objStore.get(key)
            tr.onsuccess = e => {
              result.push({
                key,
                value: e.target.result
              })
            }
          })
          // Resolve `getAll` with final { key, value }[] result
          valuesTr.oncomplete = (event) => {
            resolve(result)
          }
          valuesTr.onerror = (event) => {
            reject(event)
          }
        }
        else
          resolve([])
      }
    }
  })
}

/**
 * Retrieves data from the specified object store and key in the indexedDB.
 * @param storeName - The name of the object store to retrieve data from.
 * @param key - The key of the row to fetch data from
 * @returns A promise that resolves with the retrieved data.
 */
export const getData = (storeName: string, key: string) => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB')

    request.onsuccess = () => {
      db = request.result
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const res = store.get(key)
      res.onsuccess = () => {
        resolve(res.result)
      }
    }
  })
}


/**
 * Updates data from the specified object store at a given key in the indexedDB.
 * @param storeName - The name of the object store to retrieve data from.
 * @param key - The key to update data at.
 * @param value - The value to update at the given key.
 * @returns A promise that resolves with the successful update.
 */
export const updateData = (storeName: string, key:string, value: any) => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB')

    request.onsuccess = () => {
      db = request.result
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const res = store.put(value,key)
      res.onsuccess = () => {
        resolve(res)
      }
    }
  })
}