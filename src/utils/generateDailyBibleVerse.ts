import type { BibleProps } from "../types/BibleProps"
import { getRandomIntInclusive } from "./randomNumber"

function generateDailyBibleVerse(data: BibleProps[]) {
  const random = getRandomIntInclusive(0, data.length - 1)
  const bookData = data[random]
  const chapters = bookData.chapters
  const chapterIndex = getRandomIntInclusive(0, chapters.length - 1)
  const chapter = chapterIndex + 1
  const verse = getRandomIntInclusive(1, chapters[chapterIndex])
  return { bookData, chapter, verse }
}

export { generateDailyBibleVerse }
