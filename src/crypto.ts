import { createDecipheriv, createHash } from "crypto"

import type { APIData } from "./types"

const hashPassword = "tombrady5rings" // Someone likes football...

const getHashComponents = (data: APIData) => {
  const cipherText = Buffer.from(data.ct, "base64")
  const initVector = Buffer.from(data.iv, "hex")
  const salt = Buffer.from(data.s, "hex")

  return { cipherText, initVector, salt }
}

// Credits to Davnit for the original algorithm:
// https://gist.github.com/Davnit/4d1ccdf6c674ce9172a251679cd0960a
export const decodeJson = (data: APIData) => {
  const { cipherText, initVector, salt } = getHashComponents(data)

  let hash = createHash("md5")
  let intermediateHash = null
  let key = Buffer.alloc(0)

  while (key.length < 32) {
    if (intermediateHash) hash.update(intermediateHash)

    hash.update(hashPassword)
    hash.update(salt)

    intermediateHash = hash.digest()
    hash = createHash("md5")
    key = Buffer.concat([key, intermediateHash])
  }

  const decipher = createDecipheriv("aes-256-cbc", key, initVector)

  let output = decipher.update(cipherText)
  output = Buffer.concat([output, decipher.final()])

  let result = output.toString().slice(1, -1)
  result = result.replaceAll(/\\"/g, '"')

  try {
    return JSON.parse(result)
  } catch (error) {
    console.error("Failed to parse JSON:", error)
  }
}
