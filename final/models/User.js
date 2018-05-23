const mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltySync(8), null);
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', UserSchema);
