const xml2js = require('xml2js');

// xmlparser instances
const XMLparser = new xml2js.Parser();
const XMLbuilder = new xml2js.Builder();
// fix svg dimensions for templating
const fixSvgDimensions = svgString => {
  let parsed;
  XMLparser.parseString(svgString, (err, result) => {
    parsed = result;
  });

  const svg = parsed.svg.$;

  if (svg.width && svg.height && svg.viewBox === undefined) {
    svg.viewBox = `0 0 ${svg.width} ${svg.height}`;
  } else {
    if (svg.viewBox === undefined) {
      console.error('no available dimensions');
      return;
    }

    const viewBox = svg.viewBox.split(' ');
    svg.width = viewBox[2];
    svg.height = viewBox[3];
  }

  return XMLbuilder.buildObject(parsed);
};

module.exports = fixSvgDimensions;
