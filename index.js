require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

// Models
const Person = require('./models/person')

// Custom token for data
morgan.token('res-data', function (response) {
    return JSON.stringify(response.body)
})


// Middleware
app.use(cors())
app.use(express.json())
// Make express show static content
// Line index.html and minified JS
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :res-data'))

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}  

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error)
} 

let persons = [
]

// Root route
app.get('/', (request, response) => {
    response.send('<h1>This is a phonebook application</h1>')
})

// Display all persons details
app.get('/api/persons', (request, response) => {
    Person.find({}).then( returnedPerson => {
        returnedPerson.forEach( person => {
            console.log(`${person.name} ${person.number}`)
        })
        response.json(returnedPerson)
    })
})

// Display data info
app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then( documentCount => {
            console.log(documentCount)
            response.send(`<h2>Phonebook has info for ${documentCount} people</h2><h2>${new Date()}</h2>`)   
        })
        .catch(error => next(error))
})

// Display specific person details
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then( returnedPerson => {
            console.log(returnedPerson)
            if(returnedPerson) {
                response.json(returnedPerson)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// Delete specific person details
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then( returnedPerson => {
            console.log(returnedPerson)
            response.status(204).end()
        })
        .catch(error => next(error))
})

// Create new person details
app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name) {
        return response.status(400).json({
            "error": "Name cannot be empty"
        })
    }

    if(!body.number) {
        return response.status(400).json({
            "error": "Number cannot be empty"
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then( savedPerson => {
            response.status(200).json(savedPerson)
        })
})

// Replace number with new number
app.put('/api/persons/:id', (request, response, next) => {
    const personObj = {
        name: request.body.name,
        number: request.body.number
    }

    Person.findByIdAndUpdate(request.params.id, personObj, { new: true})
        .then( updatedPerson => {
            console.log(updatedPerson)
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


// handler of requests with unknown endpoint
app.use(unknownEndpoint)    
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT,  () => {
    console.log(`Server running on port ${PORT}`)
})