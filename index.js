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
app.get('/info', (request, response) => {
    response.send(`<h2>Phonebook has info for ${persons.length} people</h2><h2>${new Date()}</h2>`)
})

// Display specific person details
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const requiredPerson = persons.find( (person) => person.id === id)
    if(requiredPerson) {
        response.status(200).json(requiredPerson)
    }
    else {
        response.status(400).json({
            "error" : `Person with id ${id} not found`
        })
    }
})

// Delete specific person details
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter( (person) => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
    return persons.length > 0 ? Math.max(...persons.map( (person) => person.id)) + 1 : 0
}

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

const PORT = process.env.PORT

app.listen(PORT,  () => {
    console.log(`Server running on port ${PORT}`)
})