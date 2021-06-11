//VIDEO FREEZES june 10

//https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-input-to-the-p5-js-ide/#Program_thenbspMicrocontroller

let serial; // hold instance of the serialport library
let portName = "/dev/tty.usbserial-02145696";
let inData; // incoming serial data

let mask;
let vid;
let sound;
let bg;

let noiseVal = 0.5;
let noiseScale = 0.01;

//SENSOR VALUES
let xTem, yHum; //sensor values for TEMP and HUM
let xPos, yPos; //mapped senosr values
let lowHum, highHum, lowTem, highTem;
let avgTem = 0;
let avgHum = 0;
let tempArr = [];
let humArr = [];
let index = 0;

function preload() {
  mask = loadImage("hole3.png");
  vid = createVideo("butoh2sm.mov");
  sound = loadSound("TRACK1_tunnel.mp3");
  bg = loadImage("teeth_copy.png");   
}

//BAUDRATE
let options = {
  baudrate: 9600,
};

function setup() {
  //SERIAL
  serial = new p5.SerialPort('10.18.135.113'); // make a new instance of the serialport library
  serial.on("list", printList);
  serial.on("connected", serverConnected); // callback for connecting to the server (p5 serial control and browser)
  serial.on("open", portOpen); // callback for the port opening
  serial.on("data", serialEvent); // callback for when new data arrives
  serial.on("error", serialError); // callback for errors
  serial.on("close", portClose); // callback for the port closing
  serial.open(portName, options); // open a serial port

  createCanvas(windowWidth, windowHeight);
  vid.loop();
  vid.hide();
  //sound.loop();
  //image(bg, 0, 0);
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i]);
  }
}

function serverConnected() {
  console.log("connected to server.");
}

function portOpen() {
  console.log("the serial port opened.");
}

function draw() {
  noiseVal = noise((xPos + width / 2.2) * noiseScale, (10) * noiseScale); 

  xPos = map(avgTem, lowTem, highTem, 0, width/2);
  yPos = map(avgHum, lowHum, highHum, 0, height/2);

  image(vid, xPos*noiseVal*1.4, yPos*noiseVal); // NOISE not needed???
  //image(vid, xPos, yPos);
  
  //console.log("xPos= "+xPos+ "  yPos= "+yPos);
  
  image(mask, 0, 0, windowWidth, windowHeight);
  image(mask, noiseVal*30, 0, windowWidth, windowHeight);
}

function serialEvent() {
  let inData = serial.readLine();
  if (inData.length > 0) {
    //console.log(inData);
    let sensors = split(inData, ","); // splits the inData string on the commas
    if (sensors.length > 1) {
      xTem = sensors[0];
      yHum = sensors[1];
      
      console.log("xTem= " + xTem + " yHum= " + yHum);

      tempArr[index] = xTem;
      humArr[index] = yHum;
      index++;
      if (index >20) {
        index = 0;
      }
      lowTem = min(tempArr); //p5 function
      highTem = max(tempArr);
      lowHum = min(humArr);
      highHum = max(humArr);

      let temSum = 0;
      let humSum = 0;
      for (let i = 0; i < tempArr.length; i++) {
        //console.log(tempArr[i]);
        temSum = temSum + parseFloat(tempArr[i]); //turn string to floating point number
        humSum = humSum + parseFloat(humArr[i]);
      }

      avgTem = temSum / tempArr.length;
      avgHum = humSum / humArr.length;

      //console.log(temSum);
      //console.log(humSum);
    }
  }
}

function serialError(err) {
  console.log("Something went wrong with the serial port. " + err);
}

function portClose() {
  console.log("The serial port closed.");
}

