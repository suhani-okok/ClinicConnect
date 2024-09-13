const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    password: {
        type: String,
        reuired: true,
    },
});

//pre-save middleware to hash the password

userSchema.pre('save', async function(next){
    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };
  
module.exports = mongoose.model('User', userSchema);

