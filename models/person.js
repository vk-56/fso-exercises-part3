const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then( () => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


function numberValidator (number) {
  const phoneNumberPattern = /^(?:\d{2,3}-\d+)$/
  return phoneNumberPattern.test(number)
}

const customValidate = [numberValidator, 'Invalid phone number! Phone numbers must have 2 or 3 digits in the start, followed by a hyphen and any number of digits']

const personSchema = new mongoose.Schema({
  name: {
    minLength: 3,
    type: String
  },
  number: {
    validate: customValidate,
    type: String
  }
})

// Convert _id of mongodb to string and store in id
// Also dont return __v in returned objects
// toJSON is automatically called when formatting response
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)