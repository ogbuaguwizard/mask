
window.addEventListener('load', eventWindowLoaded, false);
function eventWindowLoaded() {
    lunch();
}
function lunch(){
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext('2d');

    // let img = document.getElementById("img");
    let imgFile = document.getElementById("imgFile");
    let setRes = document.getElementById("setRes");
    let original = document.getElementById("original");

    //positioning
    canvas.width = innerWidth;
    canvas.height =innerHeight;

    window.addEventListener("click", clickHandler, false);
    function clickHandler(e){
        if(e.target == document.getElementById("choose") && imgs){ //when reselecting clear all previously selected
            imgs.forEach(img=>{
                document.getElementById("imgContainer").removeChild(img)
            });
            document.getElementById("imgProp").innerHTML = "";
            document.getElementById("setDialog").innerHTML = "";
        }

        if(e.target == document.getElementById("gen")){
            generate();
        }
        if (setRes.checked == true) {
            document.getElementById("setDialog").style.display = "block";
            document.getElementById("imgProp").style.display = "none";
            if(!files){
                setRes.checked = false;
                original.checked = true;
            }
        }
        else{
            document.getElementById("setDialog").style.display = "none";
            document.getElementById("imgProp").style.display = "block";
        }

        if(document.getElementById("setAll") && document.getElementById("setAll").checked == true){
            let setWidthValue;
            let setHeightValue;
            Array.from(document.getElementsByClassName("setWidth")).forEach((element,index) =>{
                if(index == 0){ //the first elem carries the set all
                    setWidthValue = element.value;
                } 
                element.value = setWidthValue;
                element.disabled = true;
            });
            Array.from(document.getElementsByClassName("setHeight")).forEach((element,index) =>{
                if(index == 0){
                    setHeightValue = element.value;
                } 
                element.value = setHeightValue;
                element.disabled = true;
            });
        }
        else{
            Array.from(document.getElementsByClassName("setWidth")).forEach((element,index) =>{
                element.disabled = false;
            });
            Array.from(document.getElementsByClassName("setHeight")).forEach((element,index) =>{
                element.disabled = false;
            });
        }
    }

    let files;
    let imgs;
    imgFile.onchange = function handler(){
        files = Array.from(imgFile.files);
        imgs = []
        console.log(files)
        if(files){
            let firstImgLoaded = false;
            files.forEach((file,index) => {
                let img = document.createElement("img");
                let = fileName = file.name.replace(/\.[^/.]+$/, "");
                img.setAttribute("name", `${fileName}`);
                document.getElementById("imgContainer").prepend(img);
                img.src = window.URL.createObjectURL(file);
                imgs.push(img);
                //console.log(img)
                img.width = 100;
                img.onload = function(){
                    document.getElementById("imgProp").innerHTML += `<img src="${img.src}" width="30px"> 
                                                                    <span style="font-size:0.6rem">
                                                                        width: ${img.naturalWidth} height: ${img.naturalHeight}
                                                                    </span>`;
                    document.getElementById("setDialog").innerHTML += `<p>
                                                                    <img src="${img.src}" width="30px">
                                                                    <label class="label" style="font-size:0.9rem">
                                                                        Width:
                                                                        <input type="number" class="setWidth" id="setWidth${index}" value="32">
                                                                    </label>
                                                                    <label class="label" style="font-size:0.9rem">
                                                                        Height:
                                                                        <input type="number" class="setHeight" id="setHeight${index}" value="32">
                                                                    </label>
                                                                    ${All = (firstImgLoaded == false && files.length > 1) ? "<input type='checkbox' id='setAll'> Apply to All" : ""} </p>`;
                    firstImgLoaded = true;
                }
            });
        }
    }

    // let imageData;
    let mask;
    function generate(){
        if(files){
            
            imgs.forEach((img,index)=>{
                mask = [];
                let imgWidth = (setRes.checked == true) ?  document.getElementById(`setWidth${index}`).value: img.naturalWidth;
                let imgHeight = (setRes.checked == true) ? document.getElementById(`setHeight${index}`).value: img.naturalHeight;
                // console.log(img.naturalWidth,img.naturalHeight)
                context.drawImage(img,0,0,imgWidth,imgHeight);
                let imageData = context.getImageData(0,0,imgWidth,imgHeight);
                context.clearRect(0,0,canvas.width,canvas.height);

                // document.getElementById("container").style.display = "none";

                for ( let i = 0; i < imgHeight; i++ ) {
                    mask[i] = [];
                    for ( let j = 0; j < imgWidth; j++ ) {
                        let currentPixel = (j + (i * imgWidth) )*4 + 3 ;
                        if ( imageData.data [currentPixel] !== 0 ){
                            mask[i][j] = 1;
                        } 
                        else{
                            mask[i][j] = 0;
                        } 
                    }
                }
                //console.log(mask);
                saveFile(img);
            });
        }  
    }

    function saveFile(img){
        //console.log(img.name)
        let map = JSON.stringify(mask);
        for (let i = 0; i < map.length; i++) {
            if(map[i] == "["  && map[i-1] == ","){
                map = map.slice(0,i) + "\n" + map.slice(i); //insert newline at index
            }  
        }

        let a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([map],{type: "text/plain"}))
        a.setAttribute("download", `${img.name}.txt`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        URL.revokeObjectURL(img.src);
    }
}