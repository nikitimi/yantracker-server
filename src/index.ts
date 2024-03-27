import dotenv from "dotenv"
import express, { Express } from "express"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { BibleProps } from "./types/BibleProps"
import { generateDailyBibleVerse } from "./utils/generateDailyBibleVerse"

type DailyVerseProps = {
  date: Date
  bookName: BibleProps["name"]
  chapter: number
  verse: number
}

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 8000

const dailyVerseJson = `${path.resolve(__dirname)}/verseOfTheDay.json`
const verseRecordTracker = `${path.resolve(__dirname)}/verseRecordTracker.json`
const bibleDataPath = `${path.resolve(__dirname)}/../../public/bible.json`

async function typedBibleData() {
  try {
    const bibleString = readFileSync(bibleDataPath)
    const { data } = JSON.parse(bibleString.toString()) as {
      data: BibleProps[]
    }
    let DATA_CAPPED = 0

    data.forEach(({ chapters }) => {
      chapters.forEach((value) => {
        DATA_CAPPED += value
      })
    })

    function loopRandomizer() {
      const { bookData, chapter, verse } = generateDailyBibleVerse(data)
      let randomizedVerse = `${bookData.name} ${chapter}:${verse}`

      if (existsSync(verseRecordTracker)) {
        const { records } = JSON.parse(
          readFileSync(verseRecordTracker).toString()
        ) as { records: string[] }

        if (records.length >= DATA_CAPPED) {
          console.log("resetting tracker")
          writeFileSync(
            verseRecordTracker,
            JSON.stringify({ records: [randomizedVerse] })
          )

          return { bookData, chapter, verse }
        }

        while (records.includes(randomizedVerse)) {
          const generateNew = generateDailyBibleVerse(data)
          randomizedVerse = `${generateNew.bookData.name} ${generateNew.chapter}:${generateNew.verse}`
          console.log(randomizedVerse)
        }

        writeFileSync(
          verseRecordTracker,
          JSON.stringify({ records: [randomizedVerse, ...records] })
        )

        return { bookData, chapter, verse }
      }
      writeFileSync(
        verseRecordTracker,
        JSON.stringify({ records: [randomizedVerse] })
      )
      return { bookData, chapter, verse }
    }

    return loopRandomizer()
  } catch (err) {
    console.log(err)
    return undefined
  }
}

app.get("/getDailyBibleVerse", async (req, res) => {
  const date = new Date()

  const serverYear = date.getFullYear()
  const serverMonth = date.getMonth()
  const serverDate = date.getDate()

  async function writeInVerOfTheDayJson(successMessage: string) {
    const bibleData = await typedBibleData()

    if (bibleData === undefined) return res.status(400).send("Bible Data error")

    const { bookData, ...rest } = bibleData
    const dailyVerseRecord: DailyVerseProps = {
      date,
      bookName: bookData.name,
      ...rest,
    }
    res
      .status(200)
      .send(`Daily Verse: ${bookData.name} ${rest.chapter}:${rest.verse}`)
    const write = writeFile(dailyVerseJson, JSON.stringify(dailyVerseRecord))

    write
      .then(() => console.log(successMessage))
      .catch((err) => res.status(400).send(String(err)))
  }

  try {
    const read = await readFile(dailyVerseJson)
    const parsedData = JSON.parse(read.toString()) as DailyVerseProps
    const cachedDateRef = new Date(parsedData.date)

    const cachedYear = cachedDateRef.getFullYear()
    const cachedMonth = cachedDateRef.getMonth()
    const cachedDate = cachedDateRef.getDate()

    if (serverYear > cachedYear)
      return writeInVerOfTheDayJson(
        "Year is higher, overwriting verseOfTheDay.json"
      )
    if (serverMonth > cachedMonth)
      return writeInVerOfTheDayJson(
        "Month is higher, overwriting verseOfTheDay.json"
      )
    if (serverDate > cachedDate)
      return writeInVerOfTheDayJson(
        "Date is higher, overwriting verseOfTheDay.json"
      )

    res
      .status(200)
      .send(
        `Daily Verse: ${parsedData.bookName} ${parsedData.chapter}:${parsedData.verse}`
      )
  } catch (err) {
    writeInVerOfTheDayJson("Initializing Write success!")
  }
})

app.listen(PORT, async () => {
  console.log(`Listening at PORT: ${PORT}\n`)
  console.log("Initialize daily verse")
})
