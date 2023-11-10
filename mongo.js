const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log("Give password as argument")
    process.exit(1)
}

const password = process.argv[2]

const url = 
    `mongodb+srv://vishanto95:${password}@cluster0.0gn3i9z.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if(process.argv[3] && process.argv[4]) {
    // Create and save new entry
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then( response => {
        console.log(`added ${response.name} number ${response.number} to phonebook`)
        mongoose.connection.close()
    })
}
else {
    // Display all entries
    Person.find({}).then( response => {
        console.log('phonebook:')
        response.forEach( person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })

}