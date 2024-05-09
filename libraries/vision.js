const vision = require("@google-cloud/vision");

const CREDENTIALS = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key,
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
};

const client = new vision.ImageAnnotatorClient({
  credentials: {
    ...CREDENTIALS,
  },
});

exports.extractTextFromImage = async (file) => {
  try {
    const imageTextResponse = await client.textDetection(file);
    const transcribedText = imageTextResponse[0].fullTextAnnotation.text.replace(
      /\n/g,
      " "
    );
    return transcribedText;
  } catch (error) {
    return "";
  }
};
