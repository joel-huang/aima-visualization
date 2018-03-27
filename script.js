var NUM_POINTS = 2000;
var data = [];
updateData(data);

var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    width = 500 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var line = d3.line()
    .x(function(d) {
        return x(d.q);
    })
    .y(function(d) {
        return y(d.p);
    });

var svg = d3.select("#visualization").append("svg")
    .attr("id", "hill")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .on("click", function() {
        var coord = d3.mouse(this); // coord of click on the SVG plane
        var xcoord = x.invert(coord[0]), ycoord;
        // search for ycoord
        for (var i = 0; i < data.length; i++) {
            if(data[i].q >= xcoord) {
                ycoord = data[i].p;
                break;
            }
        }
        drawCircle(coord[0], dataToPixelsY(ycoord));
    });

var ball = svg.append("circle")
    .attr("id", "climber")
    .attr("cx", 50)
    .attr("cy", 100)
    .style("fill", "#ff6156")
    .attr("r", 7);

x.domain(d3.extent(data, function(d) {
    return d.q;
}));
y.domain(d3.extent(data, function(d) {
    return d.p;
}));

var path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

function updateData(data) {
    // generate two random means and sigmas
    // that still look nice
    mean1 = -1 + 0.3*Math.random();
    mean2 = 1 - 0.3*Math.random();
    sigma1 = 0.5 - 0.2*Math.random();
    sigma2 = 0.5 - 0.2*Math.random();

    for (var i = 0; i < NUM_POINTS; i++) {
        q = normal() // calc random draw from normal dist
        p = gaussian(q, mean1, sigma1) + gaussian(q, mean2, sigma2)
        el = {
            "q": q,
            "p": p
        }
        data.push(el)
    }
    data.sort(function(x, y) {
        return x.q - y.q;
    }); 
}

// Sample from a normal distribution with mean 0, sigma 1.
function normal() {
    var x = 0,
        y = 0,
        rds, c;
    do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        rds = x * x + y * y;
    } while (rds == 0 || rds > 1);
    c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
    return x * c; // throw away extra sample y * c
}

function gaussian(x, mean, sigma) {
    var gaussianConstant = 1 / Math.sqrt(2 * Math.PI);
    x = (x - mean) / sigma;
    return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
}    

function sleep() {
  return new Promise(resolve => setTimeout(resolve, 20));
}

async function hillClimb() {
    document.getElementById("newhills").disabled = true;
    document.getElementById("start").disabled = true;
    var ballAt = pixelsToDataX(ball.attr("cx")); // the x-value the ball is at
    var current; // var for the index of the data of the x-value the ball is at
    // search away
    for (var i = 0; i < data.length; i++) {
        if (data[i].q >= ballAt) {
            current = i;
            break;
        }
    }
    var neighbor;
    highlightCode(1);
    await sleep();
    while (true) {
        // set the highest of the two neighbors to
        // the desired neighbor
        highlightCode(2);
        await sleep();
        neighbor = current-1;
        if (data[current+1].p >= data[current-1].p) {
            neighbor = current+1
        }
        highlightCode(3);
        await sleep();
        highlightCode(4);
        await sleep();
        if (data[neighbor].p <= data[current].p) {
            console.log("Peak found at " + current + " with peak value " + data[current].p);
            highlightCode(5);
            await sleep();
            document.getElementById("newhills").disabled = false;
            document.getElementById("start").disabled = false;
            return;
        }
        current = neighbor;
        drawCircle(dataToPixelsX(data[current].q), dataToPixelsY(data[current].p));
        highlightCode(6);
        await sleep()
    }
}

function newHill() {
    var newData = [];
    updateData(newData); // get new data points
    //select existing svg and transition to new one
    var svg = d3.select("#visualization").transition();

    // Make the changes
    svg.select(".line")   // change the line
        .duration(200)
        .attr("d", line(newData));

    data = newData;
    // search for ycoord
    for (var i = 0; i < data.length; i++) {
        if(data[i].q >= x.invert(ball.attr("cx"))) {
            ycoord = data[i].p;
            break;
        }
    }
    drawCircle(ball.attr("cx"), dataToPixelsY(ycoord));
}

function dataToPixelsX(xcoord) {
    return (xcoord - x.domain()[0]) / (x.domain()[1]-x.domain()[0]) * 500;
}

function dataToPixelsY(ycoord) {
    return 100+(y.domain()[0] - ycoord) / (y.domain()[1]-y.domain()[0]) * 100;
}

function pixelsToDataX(xpixels) {
    return (xpixels/500* (x.domain()[1]-x.domain()[0])) + x.domain()[0];
}

function pixelsToDataY(ypixels) {
    return -(((ypixels-100)/100*(y.domain()[1]-y.domain()[0])) - y.domain()[0]);
}

// renders the cicle at the coordinate.
function drawCircle(x, y) {
    ball.transition()
        .duration(200)
        .attr("cx", x)
        .attr("cy", y);
}

function highlightCode(lineNumber) {
        c = document.getElementsByTagName("pre");
        for (i = 0; i < c.length; i++) {
            c[i].setAttribute("style", "background-color: #ffdb5b;");
        }
    document.getElementById("line" + lineNumber).setAttribute("style", "background-color: #ffbf0f;");
}