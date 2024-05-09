const Category = require("../models/category.model");
const generatePromise = require("./generatePromise");
const sql = require("./../config/sql");
const Book = require("../models/book.model");
const Solution = require("./../models/solution.model");
const { readFile } = require("./fileFunctions");

exports.importCategory = async () => {
  const results = await generatePromise(sql, "select * from category");
  for (let i = 0; i < results.length; i++) {
    console.log('category',i)
    const cat = new Category({
      old_id: results[i].id,
      name: results[i].name,
      description: results[i].description,
      level: +results[i].level,
      metaTitle: results[i].meta_title,
      metaDescription: results[i].meta_description,
      metaKeywords: results[i].meta_keywords,
      url: results[i].url,
    });
    await cat.save();
  }
};

exports.updateImportedCategoryParent = async () => {
  const results = await generatePromise(sql, "select * from category");
  for (let i = 0; i < results.length; i++) {
    console.log('category',i)
    let parentCategory = await Category.findOne({
      old_id: results[i].parent_id,
    });
    if (parentCategory) {
      let category = await Category.findOneAndUpdate(
        { old_id: results[i].id },
        { parentId: parentCategory._id }
      );
    }
  }
  return true;
};

exports.importBooks = async () => {
  const books = await generatePromise(sql, "select * from book");
  for (let i = 0; i < books.length; i++) {
    console.log('book',i)

    let book = new Book({
      old_id: books[i].id,
      title: books[i].name,
      description: books[i].description || "",
      authorName: books[i].author,
    });
    book.save();
  }
  return true;
};

exports.importQuestions = async () => {
  const questions = await generatePromise(sql, "select * from product");

  for (let i = 0; i < questions.length; i++) {
    console.log('solution',i)

    let category = await Category.findOne({ old_id: questions[i].category_id });
    let book = await Book.findOne({ old_id: questions[i].book_id });
    const solutionData = await readFile(questions[i].contract);
    console.log("Solution Number:", i);
    let solution = new Solution({
      book,
      category,
      old_id: questions[i].id,
      price: questions[i].price * 1,
      title: questions[i].title,
      question: solutionData?.question || questions[i].description,
      answer: solutionData?.answer,
      file: questions[i].contract,
      metaDescription: questions[i].meta_description,
      metaKeywords: questions[i].meta_keywords,
      views: questions[i].views,
      noOfOrders: questions[i].number_of_orders,
      noOfDownloads: questions[i].number_of_downloads,
      transcribedImageText: questions[i].transcribed_text,
      status: questions[i].status ? true : false,
    });
    await solution.save();
  }
  return true;
};
