const express = require("express");
const { check } = require("express-validator");

const employeeController = require("../controllers/employee-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", employeeController.getEmployees);

router.post(
  "/signup",
  [
    check("emp_name").not().isEmpty(),
    check("emp_email").normalizeEmail().isEmail(),
    check("emp_password").isLength({ min: 6 }),
    check("emp_designation").not().isEmpty(),
    check("emp_role").not().isEmpty(),
    check("emp_address").not().isEmpty(),
  ],
  employeeController.signup
);

router.post("/login", employeeController.login);

router.use(checkAuth); //all the below routes are protected and can only be reached with a valid token

router.patch(
  "/:eid",
  [
    check("emp_name").not().isEmpty(),
    check("emp_email").normalizeEmail().isEmail(),
  ],
  employeeController.updateEmp
);

router.delete("/:eid", employeeController.deleteEmp);

module.exports = router;
