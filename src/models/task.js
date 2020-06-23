const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});


taskSchema.pre('save', async function (next) {
    const task = this
    console.log('fired off before save')
    next()
})


const Task = mongoose.model('Task', taskSchema );

// const trip = new Task ({
//     description: '      Do dishes',
// });

// trip.save().then(() => {
//     console.log(trip)
// }).catch((error) => {
//     console.log(error)
// });

module.exports = Task