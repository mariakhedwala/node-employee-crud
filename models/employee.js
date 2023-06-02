const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const empSchema = new Schema({
  emp_name: { type: String, required: true },
  emp_email: { type: String, required: true, unique: true },
  emp_password: { type: String, required: true, minlength: 6 },
  emp_designation: { type: String, required: true },
  emp_role: { type: String, required: true },
  emp_address: { type: String, required: true },
});

empSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Employee", empSchema);
