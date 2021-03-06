const express = require("express")


module.exports = (middlewares = null) => {
  const app = express()

  if (middlewares)
    app.use(middlewares)
  
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile)

  app.get("/api/v1/test/:id", (req, res) => {
    setTimeout(() =>
      res.send({ msg: "ok" })
    , Math.random() * 1000)
  })
  
  
  app.get("/api/v1/test/:id/sendStatus", (req, res) => {
    res.sendStatus(204)
  })

  app.get("/api/v1/test/:id/send", (req, res) => {
    res.send("ok")
  })


  app.get("/api/v1/test/:id/json", (req, res) => {
    res.json({ msg: "ok" })
  })

  app.get("/api/v1/test/:id/redirect", (req, res) => {
    res.redirect("http://google.com")
  })

  app.get("/api/v1/test/:id/render", (req, res) => {
    res.render("index.html")
  })


  app.get("/api/v1/test/:id/sendFile", (req, res) => {
    res.sendFile(`${__dirname}/Logo3.jpg`)
  })

  app.get("/api/v1/test/:id/download", (req, res) => {
    res.download(`${__dirname}/Logo3.jpg`)
  })


  app.put("/api/v1/test/:id", (req, res) => {
    setTimeout(() =>
      res.send({ msg: "ok" })
    , Math.random() * 3000)
  })
  
  app.delete("/api/v1/test/:id", (req, res) => {
  
    setTimeout(() =>
      res.send({ msg: "ok" })
    , Math.random() * 3000)
  })

  return app
}