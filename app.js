document.addEventListener("DOMContentLoaded", function() {
  const educationDataURL = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
  const countyDataURL = " https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
  const title = "United States Educational Attainment";
  const description = "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)";
  const source = "USDA Economic Research Service";
  const SourceLink = "https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx";
  const width = 1000;
  const height = 650;

  //svg setup
  let svg = d3.select("svg")
              .attr("width", width)
              .attr("height", height)
              .classed("svg", true);

  //add a title
  d3.select("#title")
      .classed("title", true)
    .text(title);

  d3.select("#description")
      .classed("description", true)
    .text(description);
  
d3.select("#source")
    .attr("transform", `translateY(-50)`)
  .append("p")
    .text("Source: ")
    .style("font-weight", "600")
  .append("a")
    .attr("href", SourceLink)
    .text(source)
    .style("text-decoration","none")
    .style("font-weight", "100")

  d3.queue()
    .defer(d3.json, countyDataURL)
    .defer(d3.json, educationDataURL)
    .await(function(error, mapData, educationData) {
      // convert map data in to valid geoJSON format using topojson.feature
      let geoData = topojson.feature(mapData, mapData.objects.counties).features;

      //add data to counties
      geoData.map(county => {
        let countyData = educationData.filter(c => c.fips === county.id);
        county["countyData"] = countyData[0];
      });

      let path = d3.geoPath();

      //setup color scales
      let minPoint = d3.min(geoData, d => d.countyData.bachelorsOrHigher)
      let maxPoint = d3.max(geoData, d => d.countyData.bachelorsOrHigher)
      let middlePoint = (maxPoint-minPoint)/8;
      let range = d3.range(minPoint, maxPoint, middlePoint);

      let colorScale = d3.scaleThreshold()
                         .domain(range)
                         .range(d3.schemeGreens[9]);

      //setup legend
      let legendXScale = d3.scaleLinear()
                           .domain([minPoint, maxPoint])
                           .range([0, width/3]);

      let legendXAxis = d3.axisBottom(legendXScale)
                          .tickSize(10, 0)
                          .tickValues(range)
                          .tickFormat(d => Math.round(d) + "%")
                          .tickSizeOuter(0);;

      let legend = svg.append("g")
                        .attr("id", "legend");
      
      legend.append("g")
              .attr("id", "legend-axis")
            .call(legendXAxis)
              .attr("transform", `translate(${width/2}, 30)`)
              .style("font-size", "14")

      //add legend
      legend
        .append("g")
        .selectAll("rect")
        .data(range)
        .enter()
        .append("rect")
        .classed("color-box", true)
          .attr("x", (d) => width/2 + legendXScale(d))
          .attr("y", 20)
          .attr("width", (width/3)/8)
          .attr("height", 10)
          .style("fill", d => colorScale(d))           

      // tooltip
      let tooltip = d3.select("body")                    
                      .append("div")
                        .attr("id", "tooltip")                        
                        .classed("tooltip", true);                         
      
      svg
        .append("g")
          .attr("id", "map")
        .selectAll(".county")
        .data(geoData)
        .enter()          
        .append("path")
          .attr("data-fips", d => d.countyData.fips)
          .attr("data-education", d => d.countyData.bachelorsOrHigher)
          .classed("county", true)
          .attr("d", path)
          .attr("fill", d => colorScale(d.countyData.bachelorsOrHigher))
        .on("mouseover", showTooltip)
        .on("touchstart", showTooltip)
        .on("mouseout", hideTooltip)    
        .on("touchend", hideTooltip);          

      function showTooltip(d) {
        let fips = d.countyData.fips;
        let education = d.countyData.bachelorsOrHigher;
        let state = d.countyData.state;
        let county = d.countyData.area_name;
          
        d3.select(this).classed("highlight", true);

        tooltip
          .attr("data-fips", fips)
          .attr("data-education", education)
          .style("opacity", 1)
          .style("left", `${d3.event.x - tooltip.node().offsetWidth/2}px`)
          .style("top", `${d3.event.y - 100}px`)
          .html(`
            <p>${county} - ${state}</p>
            <p>${education}</p>
          `);          
      }

      function hideTooltip() {
        d3.select(this).classed("highlight", false);
        tooltip
          .style("opacity", 0);
      }           
    });
});