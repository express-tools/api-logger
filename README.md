
![rest.log](Logo3.jpg "logo")


Rest.log
===

Rest.log is a Express.js middleware what expose the request-response pair in a format of events for porpouse to log or detect
what happens in API, according with it API contract.


## Table of Contents

* [Install and Prerequisites](#install-and-prerequisites)
* [How use it](#how-use-it)
  - [Init middleware](#init-middleware)
  - [Event schema](#event-schema)
* [Examples](#examples)
  - [Detect creation of entity](#detect-creation-or-updates-of-an-entity)
  - [Save logs in Aws Athena](#save-logs-in-aws-athena)
* [Notes](#notes)
* [Roadmap](#roadmap)



## Install and Prerequisites

- node >= 6.x.x
- express >= 4

```shell
$ npm install restlog --save
```

## How use it

### Init middleware
```javascript
const app = require("express")()
const restlog = require("restlog")

app.use(restlog({

  // Array of reject patterns in url
  rejectPatterns: [ /.ico/ ],

  // extracts from request or response and add to Event
  extracts: {
    isBot: (req, res) => isBot(req.headers['user-agent'])
  },
  // Array with each output of log desired
  logIn: [
    // log in stdOut
    event => console.log(event),
  ]
}))
```
### Event Schema

JsonSchema

```javascript
{
  "url": "string",
  "resource": "string",
  "path": "string",
  "method": "string",
  "query": "object",
  "hostname": "string",
  "protocol": "string",
  "userAgent": "string",
  "isoDate": "string",
  "milliseconds": "number",
  "date": { 
    "day": "number", 
    "month": "number", 
    "year": "number", 
    "hour": "number", 
    "minute": "number", 
    "second": "number" 
  },
  "request": { 
    "params": "object",
    "query": "object",
    "method": "string",
    "headers": "object",
    "path": "string",
    "body": "object" | "string" | undefined
  },
  "response": {
    "query": "object",
    "headers": "object",
    "body": "object" | "string" | undefined,
  }
}

```
Example:
```json
{
  "url": "http://localhost:3000/api/v1/test/234",
  "resource": "GET /api/v1/test/:id",
  "path": "/api/v1/test/234",
  "method": "GET",
  "query": {},
  "hostname": "localhost",
  "protocol": "http",
  "userAgent": "axios/0.18.0",
  "isoDate": "2018-07-26T17:29:39.384Z",
  "milliseconds": 162,
  "date": { 
    "day": 26, 
    "month": 7, 
    "year": 2018, 
    "hour": 14, 
    "minute": 29, 
    "second": 39 
  },
  "request": { 
    "params": { "id": "234" },
    "query": {},
    "method": "GET",
    "headers": 
     { 
       "accept": "application/json, text/plain",
       "user-agent": "axios/0.18.0",
       "host": "localhost:3000",
       "connection": "close"
     },
    "path": "/api/v1/test/234",
    "body": "undefined" 
  },
  "response": { 
    "readers": { 
      "x-powered-by": 
      "Express" 
    },
    "status": 200,
    "body": null 
  }
}
```

## Examples
### Detect creation or updates of an entity

```javascript
app.use(restlog({

  // Array with each output of log desired
  logIn: [
    event => {
      const { resource, response, request } = event

      if(resource === "POST /api/v1/user/" && response.status === 201) {
        const { name, id, email } = response
        notifyUserCreationToOtherApi(id, { name, email })

      } else if (resource === "PUT /api/v1/user/:id" && response.status === 200)) {
        const { body: attrs, params } = request
        notifyUserUpdateToOtherApi(params.id, attrs)

      }
    }
  ]
}))
```

### Save logs in Aws Athena

```javascript

const restlog = require("restlog")
const app = require("express")()
const isBot = require("isbot")
const flat = require("flat")

const AWS = require("aws-sdk")
const firehose = new AWS.Firehose({ apiVersion: "2015-08-04", region: "us-east-1" })

app.use(restlog({

  // Array of reject patterns in url
  rejectPatterns: [ /.ico/ ],

  // extracts from request or response and add To eventLog
  extracts: {
    isBot: (req, res) => isBot(req.headers['user-agent'])
  },
  // Array with each output of log desired
  logIn: [
    // put in firehose
    event => {

      firehose.putRecord({
        DeliveryStreamName: 'test',
        Record: {
          Data: [ JSON."string"ify(flat(event)), "\n" ].join("")
        }
      }).promise()
      .then(res => console.log(res))
      .catch(console.error)
      
    },
    // log in stdOut
    event => console.log(event),
    event => /* ... saves on mongoDB etc*/
  ]
}))


app.get("/api/v1/test/:id", (req, res) => {
  setTimeout(() =>
    res.send({ msg: "ok" })
  , Math.random() * 1000)
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


setInterval(() => 
  axios.get("http://localhost:3000/api/v1/test/234")
, 200)


setInterval(() => 
  axios.put("http://localhost:3000/api/v1/test/123")
, 500)


setInterval(() => 
  axios.delete("http://localhost:3000/api/v1/test/123")
, 8000)

app.listen(3000, "localhost", () => {
  console.log("start !in port 3000")
})
```

Afetr query in Aws Athena...

![athena query](Screenshot3.png "athena show aggregation")

## Notes
* **Rest.log** was writen in 6.x.x node version and uses features available from this release.
* **Rest.log** was writen to work with expressjs.

## Roadmap
* Refac code in modules
* Test coverage in 70%
  - all http methods
  - ~~content empty~~
  - all express response methods
    * ~~res.json()~~
    * ~~res.sendFile()~~
    * ~~res.download()~~
    * ~~res.render()~~
    * ~~res.sendStatus()~~
    * ~~res.redirect()~~
  - ~~express errors 404~~
