document.addEventListener("DOMContentLoaded", function() {
  const educationDataURL = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
  const countyDataURL = " https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
  const width = "1000";
  const height = "700";
  const margin = { top: 20, left: 20, bottom: 20, right: 20 };

  //svg setup
  let svg = d3.select("svg")
              .attr("width", width)
              .attr("height", height)
              .classed("map", true);

  // let colorScale = d3.scaleTreshold()
  //                    .domain([])
  //                    .range([])

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
      
      svg
        .append("g")
        .selectAll(".county")
        .data(geoData)
        .enter()          
        .append("path")
          .attr("data-fips", d => d.countyData.fips)
          .attr("data-education", d => d.countyData.bachelorsOrHigher)
          .classed("county", true)
          .attr("d", path)
    });
});