$(document).ready(function() {

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
	var svgChart = d3.select("#chart")
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
	svgChart.append("text")
		.attr("class", "label")
		.attr("x", legend_X )
		.attr("y", legend_Y)
		.text("Continent")
		.style("font-weight", "bold");

	// Append rectangle and text for legend
	for (i = 0; i < Object.keys(colour_dict).length; i++) {
		continent = Object.keys(colour_dict)[i]
		svgChart.append("rect")
		    .attr("x", legend_X)
		    .attr("y", legend_Y + (i+1) * 20)
		    .attr("width", 18)
		    .attr("height", 18)
		    .style({
		    	fill : colour_dict[continent], 
		      	opacity : 0.5
		  	});

		// draw legend text
		svgChart.append("text")
			.attr("x", legend_X + 120)
			.attr("y", legend_Y + (i+1) * 20 +10)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(continent)
	}


	d3.csv("../data/data.csv", function(error, data){
		// add boundary of x and y
		x.domain([0, 140000]).nice();
		y.domain([0, 90]).nice();		

		// x axis
		svgChart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.text("GDP per Capita (in US dollar)")
				.attr("pointer-events", "none")

		// y axis
		svgChart.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", -45)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Life Expectancy (in years)")
				.attr("pointer-events", "none")
		
		// draw circles 
		svgChart.selectAll(".dot")
			.attr("clip-path", "url(#clip)")
			.data(data)
			.enter()
			.append("circle")
				.attr("class", "dot")
				.attr("cx", dataToXValue)
				.attr("cy", dataToYValue)
				.attr("r", dataToRadius)
				.style("fill", selectColour)
				.on("mouseover", handleMouseOver)
				.on("mouseout", handleMouseOut);
	})

	// update function
	updatePointChart = function() {		
		d3.selectAll(".dot")
			.each(function(d) {				
				if((d[`${year}_gdp`] != 0.0 && d[`${year}_life`] != 0.0 && d[`${year - 1}_gdp`] != 0.0 && d[`${year - 1}_life`] != 0.0)) {
					d3.select(this)
						.transition()
						.duration(500)
						.attr("cx", dataToXValue)
						.attr("cy", dataToYValue)
						.attr("r", dataToRadius)
				} else {
					d3.select(this)
						.transition()
						.duration(500)
						.attr("r", 0)
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

	const selectColour = function(d){
		continent_name = d["Continent_Name"]	
		return colour_dict[continent_name]
	}

    // action if mouseOver datapoint
	const handleMouseOver = function(d, i) {
		d3.select(this)
			.style({opacity: 0.9});
		
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
		tooltip.transition()
			.duration(500)
			.style("opacity", 0);

		d3.select(this)
			.style({opacity: 0.5});
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

	const roundDecimals = (val, decimals) => {
		multiplyFactor = 10 ** decimals
		return Math.round(val * multiplyFactor) / multiplyFactor
	}
})