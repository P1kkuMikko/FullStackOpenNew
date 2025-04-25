const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to', url);
mongoose
    .connect(url)
    .then(() => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message);
    });

const personSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, index: true, minlength: 3 },
    number: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{2,3}-\d{5,}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number! It must be in the format XX-XXXXX or XXX-XXXXX.`,
        },
    },
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model('Person', personSchema);
