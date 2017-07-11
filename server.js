'use strict';

const bodyParser = require('body-parser')
const env = require('node-env-file')
const express = require('express')
const fetch = require('node-fetch')
const swaggerJSDoc = require('swagger-jsdoc')

const options = {
  swaggerDefinition: {
    info: {
      title: 'luis-server',
      version: '1.0.0'
    },
    basePath: '/luis-server'
  },
  apis: ['./server.js']
}

const swaggerSpec = swaggerJSDoc(options)

env(__dirname + '/.env')
const PORT = 8080
const DEFAULT_URL = process.env.LUIS_SERVER_URL
const DEFAULT_APP_ID = process.env.LUIS_APP_ID
const DEFAULT_APP_KEY = process.env.LUIS_APP_KEY

let baseURL = DEFAULT_URL
let appId = DEFAULT_APP_ID
let appKey = DEFAULT_APP_KEY
let versionId = '0.1'

const app = express()
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.disable('etag')
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.get('/', function (req, res) {
  res.send('LUIS Proxy Server v1.0')
})
app.get('/api-docs.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

/**
 * @swagger
 * definitions:
 *   HierarchicalModel:
 *     type: object
 *     properties:
 *       Name:
 *         type: string
 *       Children:
 *         type: array
 *         items:
 *           type: string
 *
 *   Setting:
 *     type: object
 *     properties:
 *       Name:
 *         type: string
 *       Value:
 *         type: string
 *
 *   Channel:
 *     type: object
 *     properties:
 *       Settings:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/Setting'
 *       Name:
 *         type: string
 *       Method:
 *         type: string
 *
 *   JSONActionParam:
 *     type: object
 *     properties:
 *       phraseListFeatureName:
 *         type: string
 *       parameterName:
 *         type: string
 *       entityName:
 *         type: string
 *       required:
 *         type: boolean
 *       question:
 *         type: string

 *
 *   JSONAction:
 *     type: object
 *     properties:
 *       actionName:
 *         type: string
 *       actionParameters:
 *         type: array
 *         $ref: '#/definitions/JSONActionParam'
 *       intentName:
 *         type: string
 *       channel:
 *         type: object
 *         $ref: '#/definitions/Channel'
 *
 *   JSONSubClosedList:
 *     type: object
 *     properties:
 *       CanonicalForm:
 *         type: string
 *       List:
 *         type: array
 *         items:
 *           type: string
 *
 *   JSONClosedList:
 *     type: object
 *     properties:
 *       Name:
 *         type: string
 *       SubLists:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/JSONSubClosedList'
 *
 *   JSONRegexFeature:
 *     type: object
 *     properties:
 *       pattern:
 *         type: string
 *       activated:
 *         type: boolean
 *       name:
 *         type: string
 *
 *   JSONModelFeature:
 *     type: object
 *     properties:
 *       activated:
 *         type: boolean
 *       name:
 *         type: string
 *       words:
 *         type: string
 *       mode:
 *         type: boolean
 *
 *   JSONEntity:
 *     type: object
 *     properties:
 *       startPos:
 *         type: string
 *       endPos:
 *         type: string
 *       entity:
 *         type: string
 *
 *   JSONUtterance:
 *     type: object
 *     properties:
 *       text:
 *         type: string
 *       intent:
 *         type: string
 *       entities:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/JSONEntity'
 *
 *   JSONApp:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       versionId:
 *         type: string
 *       desc:
 *         type: string
 *       culture:
 *         type: string
 *       intents:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/HierarchicalModel'
 *       entities:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/HierarchicalModel'
 *       bing_entities:
 *         type: array
 *         items:
 *           type: string
 *       actions:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/JSONAction'
 *       closedLists:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/JSONClosedList'
 *       composites:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/HierarchicalModel'
 *       regex_features:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/JSONRegexFeature'
 *       model_features:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/JSONModelFeature'
 *       utterances:
 *         type: array
 *         items:
 *           type: object
 *           $ref: '#/definitions/JSONUtterance'
 *
 * /apps:
 *   post:
 *     description: Imports an application to LUIS.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: appName
 *         in: query
 *         description: The imported application name.
 *         type: string
 *       - name: dataObject
 *         in: body
 *         description: A JSON document representing the LUIS application structure.
 *         schema:
 *           $ref: '#/definitions/JSONApp'
 *     responses:
 *       201:
 *         description: The ID of the imported application.
 */
app.post('/apps/:appName', function (req, res) {
  //console.log('received body:\n', req.body)
  const appName = req.params.appName
  const url = baseURL + '/import?appName=' + appName
  console.log('Calling endpoint:', url)
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': appKey
    },
    body: JSON.stringify(req.body)
  })
    .then((resp) => {
      if (resp.ok) {
        return resp.text()
      }
      throw resp.statusText
    })
    .then((text) => {
      res.send(text)
    })
    .catch((err) => {
      console.error('Error importing workspace;', err)
      res.status(500).send({
        status: 500,
        message: 'Error importing workspace'
      })
    })
})

/**
 * @swagger
 * definitions:
 *   Entity:
 *     type: object
 *     required:
 *       - startCharIndex
 *       - endCharIndex
 *       - entityName
 *     properties:
 *       startCharIndex:
 *         type: integer
 *         description: The start index of the entity substring in the text
 *       endCharIndex:
 *         type: integer
 *         description: The end index of the entity substring in the text
 *       entityName:
 *         type: string
 *         description: The entity name and value
 *
 *   Example:
 *     type: object
 *     required:
 *       - text
 *       - intentName
 *       - entityLabels
 *     properties:
 *       text:
 *         type: string
 *         description: The utterance to parse.
 *       intentName:
 *         type: string
 *         description: The intent of the utterance.
 *       entityLabels:
 *         type: array
 *         description: The list of entities extracted from the utterance.
 *         items:
 *           $ref: '#/definitions/Entity'
 *
 * /examples:
 *   post:
 *     description: Deploy training examples to LUIS.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: dataObject
 *         description: Training payload
 *         in: body
 *         required: true
 *         type: array
 *         items:
 *           $ref: '#/definitions/Example'
 *     responses:
 *       200:
 *         description: Successful request
 *       500:
 *         description: Error posting training examples to LUIS
 */
app.post('/examples', function (req, res) {
  console.log('received body:\n', req.body)
  const url = baseURL + `/${appId}/versions/1.0/examples`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': appKey
    },
    body: JSON.stringify(req.body)
  })
    .then((resp) => resp.json())
    .then((json) => {
      res.send(json)
    })
    .catch((err) => {
      console.error('Error posting training data;', err)
      res.status(500).send({
        status: 500,
        message: 'Error posting training data'
      })
    })
})

/**
 * @swagger
 * /train:
 *   post:
 *     description: Sends a training request for the models of the specified application version.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful request
 *       500:
 *         description: Error posting train command to LUIS
 */
app.post('/train/:appId', function (req, res) {
  const appid = req.params.appId
  const url = baseURL + `/${appid}/versions/${versionId}/train`
  console.log('Calling endpoint:', url)
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': appKey
    },
  })
    .then((resp) => resp.json())
    .then((json) => {
      res.send(json)
    })
    .catch((err) => {
      console.error('Error posting train command;', err)
      res.status(500).send({
        status: 500,
        message: 'Error posting train command'
      })
    })
})

/**
 * @swagger
 * /train:
 *   get:
 *     description: Gets the training status of all models for the specified application.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful request
 *       500:
 *         description: Error getting training status from LUIS
 */
app.get('/train/:appId', function (req, res) {
  const appid = req.params.appId
  const url = baseURL + `/${appid}/versions/${versionId}/train`
  console.log('Calling endpoint:', url)
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': appKey
    },
  })
    .then((resp) => resp.json())
    .then((json) => {
      res.send(json)
    })
    .catch((err) => {
      console.error('Error getting training status;', err)
      res.status(500).send({
        status: 500,
        message: 'Error getting training status'
      })
    })
})

/**
 * @swagger
 * /publish:
 *   post:
 *     description: Publishes a specific version of the application.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful request
 *       500:
 *         description: Error publishing workspace to LUIS
 */
app.post('/publish/:appId', function (req, res) {
  const appid = req.params.appId
  console.log('received body:\n', req.body)
  const url = baseURL + `/${appid}/publish`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': appKey
    },
    body: JSON.stringify(req.body)
  })
    .then((resp) => resp.json())
    .then((json) => {
      res.send(json)
    })
    .catch((err) => {
      console.error('Error publishing workspace;', err)
      res.status(500).send({
        status: 500,
        message: 'Error publishing workspace'
      })
    })
})

/**
 * @swagger
 * /assignedkey:
 *   post:
 *     description: Assigns a subscription key to the given application version.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful request
 *       500:
 *         description: Error publishing workspace to LUIS
 */
app.post('/assignedkey/:appId', function (req, res) {
  const appid = req.params.appId
  const url = baseURL + `/${appid}/versions/${versionId}/assignedkey`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': appKey
    },
    body: JSON.stringify(appKey)
  })
    .then((resp) => {
      if (resp.ok) {
        res.send()
      } else {
        throw resp.statusText
      }
    })
    .catch((err) => {
      console.error('Error assigning key;', err)
      res.status(500).send({
        status: 500,
        message: 'Error assigning key'
      })
    })
})

/**
 * @swagger
 * definitions:
 *   Message:
 *     type: object
 *     required:
 *       - q
 *     properties:
 *       q:
 *         type: string
 *         description: The utterance to parse.
 *
 *   Entity:
 *     type: object
 *     properties:
 *       start:
 *         type: integer
 *         description: The start index of the entity substring in the text
 *       end:
 *         type: integer
 *         description: The end index of the entity substring in the text
 *       value:
 *         type: string
 *         description: The entity instance or synonym
 *       entity:
 *         type: string
 *         description: The entity name
 *
 *   Intent:
 *     type: object
 *     properties:
 *       confidence:
 *         type: double
 *         description: A decimal percentage that represents RASA's confidence in the intent.
 *       name:
 *         type: string
 *         description: The name of the intent.
 *
 *   ParseResponse:
 *     type: object
 *     properties:
 *       text:
 *         type: string
 *         description: The parsed utterance.
 *       entities:
 *         type: array
 *         description: The list of extracted entities.
 *         items:
 *           $ref: '#/definitions/Entity'
 *       intent:
 *         type: object
 *         description: The top scoring intent.
 *         schema:
 *           $ref: '#/definitions/Intent'
 *       intent_ranking:
 *         type: array
 *         description: The list of all matching intents.
 *         items:
 *           $ref: '#/definitions/Intent'
 *
 * /parse:
 *   post:
 *     description: Send a message to RASA.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: message
 *         description: message payload
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Message'
 *     responses:
 *       200:
 *         description: Successful request
 *         schema:
 *           $ref: '#/definitions/ParseResponse'
 *       500:
 *         description: Invalid request
 */
app.post('/parse', function (req, res) {
  console.log('received body:\n', req.body)
  const url = baseURL + '/parse'
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(req.body)
  })
    .then((resp) => resp.json())
    .then((json) => {
      res.send(json)
    })
    .catch((err) => {
      console.error('Error posting query;', err)
      res.status(500).send({
        status: 500,
        message: 'Error posting query'
      })
    })
})

/**
 * @swagger
 * definitions:
 *   Config:
 *     type: object
 *     properties:
 *       url:
 *         type: string
 *       appId:
 *         type: string
 *       appKey:
 *         type: string
 *
 * /config:
 *   post:
 *     description: Update the configuration of this proxy.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: configObject
 *         description: configuration object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Config'
 *     responses:
 *       200:
 *         description: Successful request
 *       500:
 *         description: Error updating config
 */
app.post('/config', function (req, res) {
  console.log('received config:\n', req.body)
  const body = req.body
  baseURL = body.url || DEFAULT_URL
  appId = body.appId || DEFAULT_APP_ID
  appKey = body.appKey || DEFAULT_APP_KEY
  res.send({ status: 'OK' })
})

app.listen(PORT)
console.log('LUIS proxy server running on port:' + PORT)
