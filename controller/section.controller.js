const section = require("../models/section.model");
const { catchAsync } = require("./errorController");

exports.createSection = catchAsync(async (req, res, next) => {
  const { bookId, chapterId, number, name } = req.body;
  if (!bookId || !chapterId || !number || !name)
    return res.status(400).json({
      message: "Please provide complete data ",
    });

  const newSection = new section({
    bookId: bookId,
    chapterId: chapterId,
    number: number,
    name: name,
  });

  const savedSection = await newSection();

  if (!savedSection)
    return res.status(400).json({ message: "Couldn't save the section" });
  
    return res.status(200).json({
        data:savedSection,
        message:'Section saved'
    })
});
