const express = require("express")
// const fs = require("node:fs/promises")
// const path = require("node:path")
const app = express()
const port = 8000

app.get("/", (req, res) => {
  res.send("hello world!")
  //   fs.mkdir("./test/project/", { recursive: true }, () => {
  //     console.log("s")
  //   })
  //     .then((value) => console.log({ value }))
  //     .catch((err) => console.log(err))
})

app.listen(port, () => {
  console.log(`Listening at PORT: ${port}`)
})
