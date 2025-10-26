let pdfDoc = null;
let pageNum = 1;

// Canvas elements
const pdfCanvas = document.getElementById("pdfCanvas");
const pdfLogo = document.getElementById("pdfLogo");
const ctxCanvas = pdfCanvas.getContext("2d");
const ctxLogo = pdfLogo.getContext("2d");

// 🔹 Load PDF and render both preview & full page
function loadPdf(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
      pdfDoc = pdf;
      pageNum = 1;

      // Render first page preview
      renderFirstPagePreview();

      // Render first page & text
      pdfRender(pageNum);
      extractTextFromPDFPage(pageNum);
    }).catch((err) => {
      console.error("PDF load error:", err);
      alert("Failed to load PDF.");
    });
  };
  reader.readAsArrayBuffer(file);
}

// 🔸 Render small preview in logo
function renderFirstPagePreview() {
  pdfDoc.getPage(1).then((page) => {
    const viewport = page.getViewport({ scale: 0.25 });
    pdfLogo.height = viewport.height;
    pdfLogo.width = viewport.width;

    const renderCtx = {
      canvasContext: ctxLogo,
      viewport: viewport,
    };

    ctxLogo.clearRect(0, 0, pdfLogo.width, pdfLogo.height);
    page.render(renderCtx);
  });
}

// 🔹 Render a full-size page in main canvas

    function pdfRender(num) {
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    const renderCtx = {
      canvasContext: ctxCanvas,
      viewport: viewport,
    };
    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;

    const renderTask = page.render(renderCtx);
    renderTask.promise.then(() => {
      // ✅ extract text *after* render done
      extractTextFromPDFPage(num);
    });
  });
}
// 🔸 File input event
document.getElementById("file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    loadPdf(file);
  } else {
    alert("Please select a valid PDF file.");
  }
});

// 🔹 Navigation buttons — now update both canvas + text
document.getElementById("next").addEventListener("click", () => {
  if (pdfDoc && pageNum < pdfDoc.numPages) {
    pageNum++;
    pdfRender(pageNum);
    extractTextFromPDFPage(pageNum);
  }
});

document.getElementById("prev").addEventListener("click", () => {
  if (pdfDoc && pageNum > 1) {
    pageNum--;
    pdfRender(pageNum);
    extractTextFromPDFPage(pageNum);
  }
});

function clean() {
  // Clear global variables
  pdfDoc = null;
  currentPage = 1;

  // Clear text output
  const output = document.getElementById("outputText");
  if (output) {
    if (output.tagName === "TEXTAREA" || output.tagName === "INPUT") {
      output.value = "";
    } else {
      output.innerHTML = "";
    }
  }

  // Clear PDF preview or canvas if it exists
  const canvas = document.getElementById("pdfCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Optionally clear file input
  const fileInput = document.getElementById("file");
  if (fileInput) {
    fileInput.value = "";
  }

  console.log("🧹 PDF data cleaned successfully");
}

window.addEventListener("beforeunload", clean);
      
