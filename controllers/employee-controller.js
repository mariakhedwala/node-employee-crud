const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const Employee = require("../models/employee");

const getEmployees = async (req, res, next) => {
  let employees;
  try {
    employees = await Employee.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Fetching employee failed", 500);
    return next(error);
  }

  res.json({
    employees: employees.map((employee) =>
      employee.toObject({ getters: true })
    ),
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(req.body, "req,body");
  if (!errors.isEmpty()) {
    return next(new HttpError(`Invalid data, please try again`, 422));
  }
  const {
    emp_name,
    emp_email,
    emp_password,
    emp_designation,
    emp_role,
    emp_address,
  } = req.body;

  let existingEmp;
  try {
    existingEmp = await Employee.findOne({ emp_email: emp_email }); //this is an async task, so in try catch
  } catch (err) {
    const error = new HttpError("Signing up failed", 500);
    return next(error);
  }

  if (existingEmp) {
    const error = new HttpError("Employee already exists, try loggin in", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(emp_password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create employee, please try again",
      500
    );
    return next(error);
  }

  const createdEmp = new Employee({
    emp_name,
    emp_email,
    emp_password: hashedPassword,
    emp_designation,
    emp_role,
    emp_address,
  });

  try {
    await createdEmp.save(); //handles everything related to saving the data in db, returns a promise
  } catch (err) {
    const error = new HttpError("Creating employee failed", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { empId: createdEmp.id, email: createdEmp.emp_email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signup failed, try again later", 500);
    return next(error);
  }

  res.status(201).json({
    empId: createdEmp.id,
    name: createdEmp.emp_name,
    email: createdEmp.emp_email,
    designation: createdEmp.emp_designation,
    role: createdEmp.emp_role,
    address: createdEmp.emp_address,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { emp_email, emp_password } = req.body;

  let existingEmp;
  try {
    existingEmp = await Employee.findOne({ emp_email: emp_email }); //this is an async task, so in try catch
  } catch (err) {
    const error = new HttpError("Login in failed, email not registered", 500);
    return next(error);
  }

  if (!existingEmp) {
    const error = new HttpError("Invalid creds, Login failed", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(
      emp_password,
      existingEmp.emp_password
    );
  } catch (err) {
    const error = new HttpError("Login in failed, check your credentials", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Login in failed, check your credentials", 403);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        empId: existingEmp.id,
        emp_email: existingEmp.emp_email,
        emp_role: existingEmp.emp_role,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Login failed, try again later", 500);
    return next(error);
  }

  res.json({
    empId: existingEmp.id,
    email: existingEmp.emp_email,
    role: existingEmp.emp_role,
    token: token,
  });
};

const updateEmp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`Invalid data`, 422));
  }
  const { emp_name, emp_designation, emp_role, emp_address } = req.body; //data part of req body
  const empId = req.params.eid; //data part of params

  let employee;
  try {
    employee = await Employee.findById(empId);
  } catch (err) {
    const error = new HttpError(
      "something went wrong, could not update employee",
      500
    );
    return next(error);
  }

  if (req.empData.role !== "admin") {
    //checkk if the logged in user is admin, so the emp details can be changed
    const error = new HttpError("You are not allowed to edit", 401);
    return next(error);
  }

  //const stores the address of the obj and not the obj itself
  employee.emp_name = emp_name;
  employee.emp_designation = emp_designation;
  employee.emp_role = emp_role;
  employee.emp_address = emp_address;

  try {
    await employee.save();
  } catch (err) {
    const error = new HttpError("something went wrong", 500);
    return next(error);
  }

  res.status(200).json({ employee: employee.toObject({ getters: true }) });
};

const deleteEmp = async (req, res, next) => {
  const empId = req.params.eid;
  let emp;
  try {
    emp = await Employee.findById(empId);
  } catch (err) {
    const error = new HttpError("something went wrong", 500);
    return next(error);
  }

  if (!emp) {
    const error = new HttpError("could not find employee", 404);
    return next(error);
  }

  if (req.empData.role !== "admin") {
    const error = new HttpError("You are not allowed to edit", 401);
    return next(error);
  }

  try {
    await emp.deleteOne();
  } catch (err) {
    const error = new HttpError("Failed to delete", 500);
    return next(error);
  }

  res.status(200).json({ message: "Place Deleted!" });
};

exports.getEmployees = getEmployees;
exports.signup = signup;
exports.login = login;
exports.updateEmp = updateEmp;
exports.deleteEmp = deleteEmp;
