import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import * as d3 from 'd3';

//NOTE:

/*On the plot you will see certain months, according to D3 doc...
it automatically figures out the month related to the date/time specific month,
*/

// Determine the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the frames.json
const rawData = JSON.parse(fs.readFileSync('../frames.json', 'utf-8'));

// Convert and process the data
const processedData = Object.entries(rawData).map(([time, objects]) => ({
    date: new Date(time),
    count: Object.values(objects).reduce((acc, curr) => acc + (Number(curr) || 0), 0)
    
}));



//console.log(processedData);  // to view the invalid data format, fixed now with line 23. 

// Dimensions and Margins
const width = 928;
const height = 500;
const marginTop = 20;
const marginRight = 30;
const marginBottom = 30;
const marginLeft = 40;

// Create an SVG in a virtual DOM environment using JSDOM
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
let body = d3.select(dom.window.document.body);

const svg = body.append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

//scaling
const x = d3.scaleUtc()
    .domain(d3.extent(processedData, d => d.date))
    .range([marginLeft, width - marginRight]);

const y = d3.scaleLinear()
    .domain([0, 29])
    .range([height - marginBottom, marginTop]);

// Line generator
const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.count));

// Plotting the line
svg.append("path")
    .datum(processedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

// Adding data point labels
svg.selectAll(".label")
    .data(processedData)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => x(d.date))
    .attr("y", d => y(d.count) - 10)  // 10 places the data label point right above
    .attr("text-anchor", "middle")
    .text(d => d.count);

// X-axis
svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

// Y-axis
svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    //.call(d3.axisLeft(y).tickValues(d3.ticks(y.domain()[0], y.domain()[1], 10))) // Here, 10 is the desired number of ticks
    //.call(d3.axisLeft(y).tickValues([0, 5, 10, 15, 20, 25, 29]))  // even tried this tick count, cuz 29 is the max y value count.
    .call(d3.axisLeft(y).tickValues(d3.ticks(y.domain()[0], y.domain()[1], 5)))  // Reduce from 10 to 5
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Object count"));
       // console.log(y.domain()); // this was to find out the max y value array = [0, 29]

       //NOTE: there is just one thing i cant seem to figure out, ive looked everywhere;
       // theres that extra y axis numbers and google and gpt both said to reduce number of ticks, which i did from 10-5 but
       // it just wont go away. 


// Prepare the directory and save the file
const outputDir = path.resolve(__dirname, '../graphs');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const outputGraphsPath = path.resolve(__dirname, '../graphs/timeSeriesGraph.html');
fs.writeFileSync(outputGraphsPath, dom.serialize());

console.log('Time series graph has been generated!');