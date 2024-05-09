const dbMigrations = require("../utils/dbMigrations");
const { catchAsync } = require("./errorController");

exports.importAll = catchAsync(async (req, res, next) => {
  console.log("IMPORTING CATEGORY");
  await dbMigrations.importCategory();
  console.log("UPDATING CATEGORY");
  await dbMigrations.updateImportedCategoryParent();
  console.log("IMPORTING BOOKS");
  await dbMigrations.importBooks();
  console.log("IMPORTING Questions");
  await dbMigrations.importQuestions();
  res.status(200).json({
    message: "imported successfully",
  });
});

exports.importSolutions = catchAsync(async (req, res, next) => {
  console.log("Importing Solutions");
  await dbMigrations.importQuestions();
  return res.status(200).json({
    message: "Solutions Imported succesfully",
  });
});

exports.importBooks = catchAsync(async (req, res, next) => {
  console.log("Importing Books");
  await dbMigrations.importBooks();
  return res.status(200).json({
    message: "Books imported successfully",
  });
});

exports.importCategories = catchAsync(async (req, res, next) => {
  console.log("Importing Categoires");
  await dbMigrations.importCategory();
  console.log("Handling Parent Catgories");
  await dbMigrations.updateImportedCategoryParent();
  return res.status(200).json({
    message: "Categories imported successfully",
  });
});
