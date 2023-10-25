import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import * as d3 from 'd3';

// i had to install brew pixman
// and
// brew install pkg-config 


/*In this structure, the visualizations are still in SVG format because that's how D3 works. 
But the output file is an HTML containing all these SVG plots. 
The HTML can also include additional elements, styles, or even JavaScript, 
allowing you to further enhance the visualizations or make them interactive. (this is what gpt said)*/


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const framesDataPath = path.join(__dirname, '../frames.json');
const outputGraphsPath = path.resolve(__dirname, '../graphs/graph.html');

async function generateGraphs() {
    const rawData = fs.readFileSync(framesDataPath, 'utf8');
    const data = JSON.parse(rawData);

    const objectCounts = {};

    data.forEach(frame => {
        frame.objects.forEach(obj => {
            objectCounts[obj.name] = (objectCounts[obj.name] || 0) + 1;
        });
    });

    // Convert objectCounts to a sorted array of entries
    const sortedEntries = Object.entries(objectCounts).sort((a, b) => b[1] - a[1]);

    const canvas = new JSDOM(`<!DOCTYPE html><body></body></html>`);
    const body = d3.select(canvas.window.document.body);

    const width = 400;
    const height = 400;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = body.append('svg').attr('width', width).attr('height', height);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sortedEntries.map(entry => entry[0]))  // Using the sorted object names
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, Math.max(...Object.values(objectCounts))]);

    svg.selectAll('.bar')
        .data(sortedEntries)  // Use the sortedEntries for data
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d[0]))
        .attr('y', d => yScale(d[1]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(d[1]))
        .attr('fill', 'steelblue')
        .on('mouseover', function(event, d) {
            tooltip.style('visibility', 'visible');
            tooltip.text(d[0] + ': ' + d[1]);
        })
        .on('mousemove', function(event) {
            tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('visibility', 'hidden');
        });

    svg.selectAll('.label')
        .data(sortedEntries)  // Use the sortedEntries for data
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d[0]) + xScale.bandwidth() / 2)  // Center the text
        .attr('y', d => yScale(d[1]) - 5)  // Shift the text up a bit
        .attr('text-anchor', 'middle')  // Center the text
        .text(d => d[1]);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0));

    svg.append('g')
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(yScale).ticks(height / 40))
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

    const tooltip = body.append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', '#eee')
        .style('border', '1px solid #000')
        .style('padding', '5px');

    const outputDir = path.resolve(__dirname, '../graphs');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    fs.writeFileSync(outputGraphsPath, body.html());

    console.log('Graph has been generated!');
}

generateGraphs();


