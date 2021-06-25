const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const leaderSchema = new Schema({
    name : {
        type: String,
        required:true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        require: true
    },
    abbr: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    featured: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

var Leaders = mongoose.model('Leader', leaderSchema);

module.exports= Leaders;