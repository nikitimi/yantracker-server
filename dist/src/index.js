"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const generateDailyBibleVerse_1 = require("./utils/generateDailyBibleVerse");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const dailyVerseJson = `${node_path_1.default.resolve(__dirname)}/verseOfTheDay.json`;
const verseRecordTracker = `${node_path_1.default.resolve(__dirname)}/verseRecordTracker.json`;
const bibleDataPath = `${node_path_1.default.resolve(__dirname)}/../../public/bible.json`;
function typedBibleData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bibleString = (0, node_fs_1.readFileSync)(bibleDataPath);
            const { data } = JSON.parse(bibleString.toString());
            let DATA_CAPPED = 0;
            data.forEach(({ chapters }) => {
                chapters.forEach((value) => {
                    DATA_CAPPED += value;
                });
            });
            function loopRandomizer() {
                const { bookData, chapter, verse } = (0, generateDailyBibleVerse_1.generateDailyBibleVerse)(data);
                let randomizedVerse = `${bookData.name} ${chapter}:${verse}`;
                if ((0, node_fs_1.existsSync)(verseRecordTracker)) {
                    const { records } = JSON.parse((0, node_fs_1.readFileSync)(verseRecordTracker).toString());
                    if (records.length >= DATA_CAPPED) {
                        console.log("resetting tracker");
                        (0, node_fs_1.writeFileSync)(verseRecordTracker, JSON.stringify({ records: [randomizedVerse] }));
                        return { bookData, chapter, verse };
                    }
                    while (records.includes(randomizedVerse)) {
                        const generateNew = (0, generateDailyBibleVerse_1.generateDailyBibleVerse)(data);
                        randomizedVerse = `${generateNew.bookData.name} ${generateNew.chapter}:${generateNew.verse}`;
                        console.log(randomizedVerse);
                    }
                    (0, node_fs_1.writeFileSync)(verseRecordTracker, JSON.stringify({ records: [randomizedVerse, ...records] }));
                    return { bookData, chapter, verse };
                }
                (0, node_fs_1.writeFileSync)(verseRecordTracker, JSON.stringify({ records: [randomizedVerse] }));
                return { bookData, chapter, verse };
            }
            return loopRandomizer();
        }
        catch (err) {
            console.log(err);
            return undefined;
        }
    });
}
app.get("/getDailyBibleVerse", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    const serverYear = date.getFullYear();
    const serverMonth = date.getMonth();
    const serverDate = date.getDate();
    function writeInVerOfTheDayJson(successMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const bibleData = yield typedBibleData();
            if (bibleData === undefined)
                return res.status(400).send("Bible Data error");
            const { bookData } = bibleData, rest = __rest(bibleData, ["bookData"]);
            const dailyVerseRecord = Object.assign({ date, bookName: bookData.name }, rest);
            res
                .status(200)
                .send(`Daily Verse: ${bookData.name} ${rest.chapter}:${rest.verse}`);
            const write = (0, promises_1.writeFile)(dailyVerseJson, JSON.stringify(dailyVerseRecord));
            write
                .then(() => console.log(successMessage))
                .catch((err) => res.status(400).send(String(err)));
        });
    }
    try {
        const read = yield (0, promises_1.readFile)(dailyVerseJson);
        const parsedData = JSON.parse(read.toString());
        const cachedDateRef = new Date(parsedData.date);
        const cachedYear = cachedDateRef.getFullYear();
        const cachedMonth = cachedDateRef.getMonth();
        const cachedDate = cachedDateRef.getDate();
        if (serverYear > cachedYear)
            return writeInVerOfTheDayJson("Year is higher, overwriting verseOfTheDay.json");
        if (serverMonth > cachedMonth)
            return writeInVerOfTheDayJson("Month is higher, overwriting verseOfTheDay.json");
        if (serverDate > cachedDate)
            return writeInVerOfTheDayJson("Date is higher, overwriting verseOfTheDay.json");
        res
            .status(200)
            .send(`Daily Verse: ${parsedData.bookName} ${parsedData.chapter}:${parsedData.verse}`);
    }
    catch (err) {
        writeInVerOfTheDayJson("Initializing Write success!");
    }
}));
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Listening at PORT: ${PORT}\n`);
    console.log("Initialize daily verse");
}));
