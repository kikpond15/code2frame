let qrcode;
let div;
let img;

function setup() {
    createCanvas(800, 800);

    div = createDiv("");
    div.id("qrcode");

    div.style("width", "256px");
    div.style("height", "256px");
    div.style("padding", "2px");
    div.style("background-color", "grey");
    div.position(10, 10);
    div.style("display", "none");

    qrcode = new QRCode("qrcode");


}

function draw() {
    //  background(255,0,0);
    if (img) {
        image(img, 0, 0, 100, 100);
    }
}

function makeCode() {
    let url = "www.naver.com";
    qrcode.makeCode(url);
    const qrCodeContainer = document.getElementById('qrcode');
    new QRCode(qrCodeContainer, url);
    const onGeneratedQrImage = function() {
        const qrCodeImage = qrCodeContainer.children[1];
        const base64 = qrCodeImage.getAttribute('src');
        if (base64 === null) {
            setTimeout(onGeneratedQrImage, 100);
        } else {
            console.log(qrCodeImage);
            console.log(base64);
            img = loadImage(base64);
        }
    };
    // console.log(qrChildren);
    // console.log(qrCodeImage);
    // console.log(base64);

}


function keyPressed() {

    if (key == '0') {

        div.remove();

        div = createDiv("");
        div.id("qrcode");

        div.position(0, 0);

        qrcode = new QRCode("qrcode");
    } else if (key == '1') {
        makeCode();
    } else if (key == '2') {


    }
}