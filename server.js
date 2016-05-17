var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.text());

port = 1500; //use ports between 1025 and 1999 on math server
poseData = {}

poseData.port = port;
poseData.x = 0;
poseData.y = 0;
poseData.h = 0; //heading in degrees
poseData.counter = 0;
poseData.timestamp = Date.now();
poseData.vL = 0;
poseData.vR = 0;
poseData.d = 130;
poseData.omega = 0; //Rotational Velocity
poseData.V = 0; //Speed vector, tangent to circle.
poseData.vX = 0; //
poseData.vY = 0; //
poseData.deltaTime = 0; //

function getPose() {
    poseData.counter++;
    poseData.deltaTime = deltaTime = (Date.now() - poseData.timestamp) / 1000;
    omegaR = omega(poseData.vR, poseData.vL, poseData.d); //Omega in Radians
    poseData.h = omegaR * deltaTime;
    poseData.h = poseData.h % 360;
    poseData.h = Math.round(poseData.h % 360);
    poseData.V = V = (poseData.vL + poseData.vR) / 2;
    poseData.vX = vX = V * Math.cos(omegaR * deltaTime);
    poseData.vY = vY = V * Math.sin(omegaR * deltaTime);
    poseData.deltaX = vX / omegaR;
    poseData.vY = -1 * vY / omegaR + V / omegaR;
    return JSON.stringify(poseData);
}

app.all('/getpose', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(getPose());
});

app.all('/setpose', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(JSON.parse(req.body));
    poseData.x = JSON.parse(req.body).x;
    poseData.y = JSON.parse(req.body).y;
    poseData.h = JSON.parse(req.body).h;
    res.send(getPose());
});

function radiansToDegrees(rad) { //convert degrees to radians
    return rad * 180 / Math.PI;
}

function omega(vR, vL, d) { //rotation rate
    return ((vR - vL) / d);
}
app.all('/setwheels', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(JSON.parse(req.body));
    getPose();
    //poseData.x = poseData.x + poseData.deltaX;
    //poseData.y = poseData.y + poseData.deltaY;
    poseData.timestamp = Date.now();
    poseData.vL = JSON.parse(req.body).vL;
    poseData.vR = JSON.parse(req.body).vR;
    omegaR = omega(poseData.vR, poseData.vL, poseData.d);
    // console.log(poseData.omega);
    poseData.omega = radiansToDegrees(omegaR);
    // console.log(poseData.omega);

    res.send(getPose());
});
app.listen(port, function() {
    console.log('listening on port', port);
});
