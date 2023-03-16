var n = 6, 
    m = 13; 

var margin = {top: 20, right: 50, bottom: 100, left: 75},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("https://raw.githubusercontent.com/sherlkk/sherlkk/main/disasters.csv", function (data){
    
    var headers = ["Extreme temperature","Storms","Landslides","Earthquakes","Flood","Drought"];
    
    var layers = d3.layout.stack()(headers.map(function(priceRange) {
        return data.map(function(d) {
          return {x: d.Year, y: +d[priceRange]};
        });
    }));
    
    var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
    var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

    var xScale = d3.scale.ordinal()
        .domain(layers[0].map(function(d) { return d.x; }))
        .rangeRoundBands([25, width], .08);

    var y = d3.scale.linear()
        .domain([0, yStackMax])
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .domain(headers)
        .range(["#d63189", "#7dacdb", "#9d8ed1", "#644fab", "#68a397", "#d9d966"]);
      
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickSize(0)
        .tickPadding(6)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) { return color(i); });

    var rect = layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", height)
        .attr("width", xScale.rangeBand())
        .attr("height", 0);

    rect.transition()
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return y(d.y0 + d.y); })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

    //********** AXES ************
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .style("fill", "White")
        .selectAll("text").style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                  return "rotate(-45)" 
                });
    
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(20,0)")
        .call(yAxis)
        .style("fill", "White")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr({"x": -150, "y": -70})
        .attr("dy", ".75em")
        .style("text-anchor", "end")
        .text("Numver of Deaths");
        

    var legend = svg.selectAll(".legend")
        .data(headers.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .style("fill", "White")
        .attr("transform", function(d, i) { return "translate(-20," + i * 20 + ")"; });
            
       
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);
    
        legend.append("text")
              .attr("x", width - 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function(d) { return d;  });


    d3.selectAll("input").on("change", change);

    var timeout = setTimeout(function() {
      d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
    }, 2000);

    function change() {
      clearTimeout(timeout);
      if (this.value === "grouped") transitionGrouped();
      else transitionStacked();
    }

    function transitionGrouped() {
      y.domain([0, yGroupMax]);

    //declare y axis again so it updates
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));
    //find yAxis and update it
    svg.selectAll("g.y.axis")
    .call(yAxis);

      rect.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("x", function(d, i, j) { return xScale(d.x) + xScale.rangeBand() / n * j; })
          .attr("width", xScale.rangeBand() / n)
        .transition()
          .attr("y", function(d) { return y(d.y); })
          .attr("height", function(d) { return height - y(d.y); });
    };

    function transitionStacked() {
      y.domain([0, yStackMax]);

    //declare y axis again so it updates
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));
    //find yAxis and update it
    svg.selectAll("g.y.axis")
    .call(yAxis);

      rect.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("y", function(d) { return y(d.y0 + d.y); })
          .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
        .transition()
          .attr("x", function(d) { return xScale(d.x); })
          .attr("width", xScale.rangeBand());

    };
});

