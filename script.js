async function extractTextFromPDFPage(pageNum) {
  if (!pdfDoc) return;
  
  const page = await pdfDoc.getPage(pageNum);
  const textContent = await page.getTextContent();
  
  const items = textContent.items;
  let lines = [];
  let currentLine = { y: null, x: 0, text: "" };
  
  // -------- Smart Chunk Logic -------- //
  items.forEach((item, i) => {
    const x = item.transform[4];
    const y = item.transform[5];
    const str = item.str.trim();
    if (!str) return;
    
    if (currentLine.y === null) {
      currentLine = { y, x, text: str };
    } else {
      const yDiff = Math.abs(currentLine.y - y);
      
      // If vertical gap or many spaces => new line
      if (yDiff > 8 || str.match(/^\s{3,}/)) {
        lines.push(currentLine);
        currentLine = { y, x, text: str };
      } else {
        currentLine.text += (currentLine.text.endsWith(" ") ? "" : " ") + str;
      }
    }
    
    // Push last line if it's the end of items
    if (i === items.length - 1 && currentLine.text) {
      lines.push(currentLine);
    }
  });
  
  // -------- Sort lines top-to-bottom -------- //
  lines.sort((a, b) => b.y - a.y); // PDF y increases upward
  
  // -------- Format each line -------- //
  let formattedText = "";
  lines.forEach((line) => {
    const centered = line.x > 200 && line.x < 300;
    const right = line.x >= 300;
    
    if (centered) {
      formattedText += `<div style="text-align:center;">${line.text}</div>\n`;
    } else if (right) {
      formattedText += `<div style="text-align:right;">${line.text}</div>\n`;
    } else {
      formattedText += `<div style="text-align:left;">${line.text}</div>\n`;
    }
  });
  
  // -------- Display result -------- //
  const output = document.getElementById("outputText");
  if (!output) return;
  
  if (output.tagName === "TEXTAREA" || output.tagName === "INPUT") {
    const plain = formattedText
      .replace(/<div[^>]*>/g, "")
      .replace(/<\/div>/g, "")
      .replace(/\n{2,}/g, "\n");
    output.value = plain.trim();
  } else {
    output.innerHTML = formattedText;
  }
  }
