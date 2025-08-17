const convertHtml = (txt) => {
  let _txt = txt.replace(/\n/g, "<br />");
  return _txt;
};
const convertText = (text) => {
  console.log("text", text);
  return text.replace(/<br[^>]*>/gi, "\n");
};

export { convertHtml, convertText };
