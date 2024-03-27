"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyBibleVerse = void 0;
const randomNumber_1 = require("./randomNumber");
function generateDailyBibleVerse(data) {
    const random = (0, randomNumber_1.getRandomIntInclusive)(0, data.length - 1);
    const bookData = data[random];
    const chapters = bookData.chapters;
    const chapterIndex = (0, randomNumber_1.getRandomIntInclusive)(0, chapters.length - 1);
    const chapter = chapterIndex + 1;
    const verse = (0, randomNumber_1.getRandomIntInclusive)(1, chapters[chapterIndex]);
    return { bookData, chapter, verse };
}
exports.generateDailyBibleVerse = generateDailyBibleVerse;
