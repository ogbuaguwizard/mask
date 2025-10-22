window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const imgFile = document.getElementById("imgFile");
  const chooseBtn = document.getElementById("chooseBtn");
  const generateBtn = document.getElementById("generateBtn");
  const setRes = document.getElementById("setRes");
  const original = document.getElementById("original");
  const imgPreview = document.getElementById("imgPreview");
  const setDialog = document.getElementById("setDialog");

  let files = [];
  let imgs = [];

  // ============ FILE SELECTION ============
  chooseBtn.addEventListener("click", () => imgFile.click());

  imgFile.addEventListener("change", async () => {
    imgPreview.innerHTML = "";
    setDialog.innerHTML = "";
    files = Array.from(imgFile.files);
    imgs = [];

    if (!files.length) return;

    for (let [i, file] of files.entries()) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      img.dataset.index = i;
      imgPreview.appendChild(img);

      await new Promise((res) => (img.onload = res));
      imgs.push(img);

      setDialog.innerHTML += `
        <div>
          <img src="${img.src}" width="30">
          <label>Width: <input type="number" id="width${i}" value="${img.naturalWidth}" min="1"></label>
          <label>Height: <input type="number" id="height${i}" value="${img.naturalHeight}" min="1"></label>
        </div>
      `;
    }
  });

  // ============ RESOLUTION TOGGLE ============
  [setRes, original].forEach((input) =>
    input.addEventListener("change", () => {
      setDialog.style.display = setRes.checked ? "block" : "none";
    })
  );

  // ============ GENERATE MASKS ============
  generateBtn.addEventListener("click", async () => {
    if (!imgs.length) {
      alert("Please choose at least one image.");
      return;
    }

    for (let [i, img] of imgs.entries()) {
      const w = setRes.checked
        ? parseInt(document.getElementById(`width${i}`).value)
        : img.naturalWidth;
      const h = setRes.checked
        ? parseInt(document.getElementById(`height${i}`).value)
        : img.naturalHeight;

      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const data = ctx.getImageData(0, 0, w, h).data;
      const mask = [];

      for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
          const alpha = data[(y * w + x) * 4 + 3];
          row.push(alpha > 0 ? 1 : 0);
        }
        mask.push(row);
      }

      const mapText = JSON.stringify(mask, null, 1);
      const blob = new Blob([mapText], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${img.alt.replace(/\.[^/.]+$/, "")}_mask.txt`;
      a.click();

      URL.revokeObjectURL(a.href);
    }

    alert("✅ Mask files generated successfully!");
  });
});
