const router = require("express").Router()
const migrationController = require("../controller/migration.controller")

// Path to import all data
router.post("/import-all", migrationController.importAll)
// Path to import all data of solutions
router.post("/import-solutions", migrationController.importSolutions)
// Path to import all data of books
router.post("/import-books", migrationController.importBooks)
// Path to import all data of categories
router.post("/import-categoires",migrationController.importCategories)

module.exports=router