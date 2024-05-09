const mammoth = require("mammoth");
const { uploadBase64 } = require("../libraries/multer");
const { extractTextFromImage } = require("../libraries/vision");

const getImages = async (fileTitle, string, imageIndex) => {
  const imgRex = /<img.*?src="(.*?)"[^>]+>/g;
  let htmlString = string;
  let img;
  let transcribedText;
  while ((img = imgRex.exec(string))) {
    const s3Response = await uploadBase64(fileTitle, img[1], imageIndex);
    htmlString = htmlString.replace(`${img[1]}`, s3Response.Location);
    transcribedText += await extractTextFromImage(s3Response.Location);
    imageIndex++;
  }
  return {
    html: htmlString,
    imageIndex: imageIndex,
    transcribedText: transcribedText,
  };
};

exports.readFile = async (fileTitle) => {
  try {
    let imageIndex = 0;
    const data = await mammoth.convertToHtml({
      path: `${__dirname}/../samples/sample_files/${fileTitle}`,
    });
    const question = data.value
      .split("<p><strong>Question:</strong></p>")[1]
      .split("<p><strong>Answer:</strong>")[0];
    const answer = data.value.split("<strong>Answer:</strong>")[1];
    const {
      html: uploadedQuestion,
      imageIndex: index,
      transcribedText: questionTranscribed,
    } = await getImages(fileTitle, question, imageIndex);

    imageIndex = index;

    const {
      html: uploadedAnswer,
      transcribedText: answerTranscribed,
    } = await getImages(fileTitle, answer, imageIndex);

    const transcribed = questionTranscribed + answerTranscribed;
    
    return {
      answer: uploadedAnswer,
      question: uploadedQuestion,
      transcribedText: transcribed,
    };
  } catch (error) {
    return { answer: "Answer is not available, please contact support" };
  }
};
