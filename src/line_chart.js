$(document).ready(function()	{
    
	// margin
	const margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 40
	};
	const fullWidth = 800
	const fullHeight = 400
	const width = fullWidth - margin.left - margin.right;
	const height = fullHeight - margin.top - margin.bottom;

	// specify x, y and body
	var x = d3.scale.linear()
		.range([0, width]);
	
	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickSize(-height)
		.tickPadding(15)

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickSize(-width)
		.tickPadding(10)

	// specify graph
	var svgLine = d3.select("#lineChart")
		.append("svg")
			.attr("class", "chart")
			.attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
			.attr("width", fullWidth)
			.attr("height", fullHeight)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// colour for each continent
	var colour_dict = {
		"Asia":"red",
		"Europe": "green",
		"Africa" : "yellow",
		"Oceania": "blue",
		"North America": "grey",
		"South America": "purple"
	}

	// Add Legend
	var legend_Y = 20, 
    legend_X = fullWidth - 200;

    // Append text for legend
    svgLine.append("text")
        .attr("class", "label")
        .attr("x", legend_X )
        .attr("y", legend_Y)
        .text("Continent")
        .style("font-weight", "bold");

    // Append rectangle and text for legend
    for (i = 0; i < Object.keys(colour_dict).length; i++) {
        continent = Object.keys(colour_dict)[i]
        svgLine.append("rect")
            .attr("x", legend_X)
            .attr("y", legend_Y + (i+1) * 20)
            .attr("width", 18)
            .attr("height", 18)
            .style({
                fill : colour_dict[continent], 
                opacity : 0.5
            });

        // draw legend text
        svgLine.append("text")
            .attr("x", legend_X + 120)
            .attr("y", legend_Y + (i+1) * 20 +10)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(continent)
    }
		        
    const line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return x(d.x) })
        .y(function(d) { return y(d.y) })
        .defined(function(d) { 
            return !isNaN(d.x) && !isNaN(d.y) && d.x > 0 && d.y > 0
        })


	d3.csv("../data/data.csv", function(error, data){
		// add boundary of x and y
		x.domain([0, 140000]).nice();
		y.domain([0, 90]).nice();		

		// x axis
		svgLine.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", width)
				.attr("y", -6)
                .attr("pointer-events", "none")
				.style("text-anchor", "end")
				.text("GDP per Capita (in US dollar)");

		// y axis
		svgLine.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", -45)
				.attr("dy", ".71em")
                .attr("pointer-events", "none")
				.style("text-anchor", "end")
				.text("Life Expectancy (in years)")

        // draw lines
        svgLine.selectAll(".line")
            .data(data)
            .enter().append("g")
            .attr("class", "line")
            .append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(dataToAllValues(d)); })
            .attr("opacity", 0)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        // draw circles 
        svgLine.selectAll(".line-dot")
            .attr("clip-path", "url(#clip)")
            .data(data)
            .enter()
            .append("circle")
                .attr("class", "line-dot")
                .attr("cx", dataToXValue)
                .attr("cy", dataToYValue)
                .attr("r", 0)
                .style("fill", selectColour)
	})

	// update function
	updateLineChart = function() {		
        var selectedCountries = $('#menu').val()	

        // update lines
		d3.selectAll(".line")
			.each(function(d) {			
				if(selectedCountries.includes(d["Country Name"]) ) {
					d3.select(this)
						.transition()
						.duration(500)
						.attr("opacity", 0.7)
                        .attr("pointer-events", "all")
				} else {
					d3.select(this)
						.transition()
						.duration(500)
                        .attr("opacity", 0)
                        .attr("pointer-events", "none")
				}
            })
        
        // update circles for current year only
        d3.selectAll(".line-dot")
            .each(function(d) {			
                if((d[`${year}_gdp`] != 0.0 && d[`${year}_life`] != 0.0 && d[`${year - 1}_gdp`] != 0.0 && d[`${year - 1}_life`] != 0.0)
                && selectedCountries.includes(d["Country Name"]) ) {
                    d3.select(this)
                        .transition()
                        .duration(500)
						.attr("cx", dataToXValue)
						.attr("cy", dataToYValue)
                        .attr("r", dataToRadius)
                        .attr("pointer-events", "all")
                } else {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr("r", 0)
                        .attr("pointer-events", "none")
                }
            })
    };
    
	// convert data entry to the x value of a dot
	const dataToXValue = function(d) {
		year = $("#slider").val()
		gdp = year + "_gdp"
		return x(d[gdp])
	}

	// convert data entry to the y value of a dot
	const dataToYValue = function(d) {
		year = $("#slider").val()
		life = year + "_life"
		return y(d[life])
	}

	// convert data entry to the radius of a dot
	const dataToRadius = function(d) {
		year = $("#slider").val()
		if(d[`${year}_gdp`] == 0.0 || d[`${year}_life`] == 0.0) {
			return 0;
		} else {
			return 3;
		}
	}
    
    const dataToAllValues = function(d) {
        var values = []
        for (i = 1960; i <= 2016; i++) {
            const entry = {
                x: parseFloat(d[i + "_gdp"]),
                y: parseFloat(d[i + "_life"])
            }
            values.push(entry)
        }
        return values;
    }

	const selectColour = function(d){
		continent_name = d["Continent_Name"]	
		return colour_dict[continent_name]
	}

	// tooltip for country
	var tooltip = d3.select("body").append("div")
    	.attr("class", "tooltip")
    	.style("opacity", 0);

	const dataToTooltipHtml = function(d) {
		return `<b>${d["Country Name"]}</b> <br/> 
			${roundDecimals(d[life], 2)} years <br/> 
			$${Math.round(d[gdp])} GDP per Capita`
    }
    
    // action if mouseOver datapoint
	const handleMouseOver = function(d, i) {
        const selectedCountries = $('#menu').val()	
		if (!selectedCountries.includes(d["Country Name"])) {
			return;
		}

        d3.select(this)
            .transition()
			.duration(200)
            .style("opacity", 1)
            .style("z-index", 999999)
            .style("stroke", "red")
		
		year = $("#slider").val()
		life = year + "_life"
		gdp = year + "_gdp"
		tooltip.transition()
			.duration(200)
			.style("opacity", 0.9);
		tooltip.html(dataToTooltipHtml(d))
			.style("left", (d3.event.pageX + 5) + "px")
			.style("top", (d3.event.pageY - 28) + "px")
    }
	
	// action if mouse moved away from the data point
	const handleMouseOut = function(d, i) {
        const selectedCountries = $('#menu').val()	
		if (!selectedCountries.includes(d["Country Name"])) {
			return;
		}

		tooltip.transition()
			.duration(500)
			.style("opacity", 0)

		d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 0.7)
            .style("z-index", 0)
            .style("stroke", "black");
	}

	const roundDecimals = (val, decimals) => {
		multiplyFactor = 10 ** decimals
		return Math.round(val * multiplyFactor) / multiplyFactor
	}
})