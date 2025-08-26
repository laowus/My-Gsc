const convertHtml = (txt) => {
  let _txt = txt.replace(/\n/g, "<br />");
  return _txt;
};
const convertText = (text) => {
  return text.replace(/<br[^>]*>/gi, "\n");
};

const convertTypeidToArray = (typeidStr) => {
  if (!typeidStr) return [1];
  return typeidStr.split(",").map(Number);
};

export { convertHtml, convertText, convertTypeidToArray };
