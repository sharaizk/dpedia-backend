const chapter = require("../models/chapter.model");
const section = require("../models/section.model");
const { catchAsync } = require("./errorController");

exports.createChapter = catchAsync(async (req, res, next) => {
  const { bookId, chapterTitle, chapterNumber, sections = [] } = req?.body;
  if (!bookId || !chapterTitle || !chapterNumber) {
    return res.status(400).json({
      message: "Please provide complete data",
    });
  }

  const newChapter = await chapter.create({
    bookId: bookId,
    chapterTitle: chapterTitle,
    chapterNumber: chapterNumber,
  });

  if (!newChapter)
    return res.status(404).json({
      message: "Couldn't save the chapter",
    });

  for (let i = 0; i < section.length; i++) {
    const newSection = await section.createNewSection(
      bookId,
      newChapter._id,
      sections[i]?.number,
      sections[i]?.name
    );
  }

  return res.status(200).json({
    message: "Chapter Saved successfully",
    data: newChapter?._id,
  });
});
