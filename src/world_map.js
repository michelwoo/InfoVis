$(document).ready(function()	{

	// setup country code dictionary for country selection
	countryNames = {}
	d3.csv("../data/data.csv", function(error, data){
		for (var i = 0; i < data.length; i++) {
		    const code = data[i]["Three_Letter_Country_Code"];
		    const name = data[i]["Country Name"];
			countryNames[code] = name
		}
		updateWorldChart()
	})

	// margin
	const margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 40
	};
	const fullWidth = 1000
	const fullHeight = 525
	const width = fullWidth - margin.left - margin.right;
	const height = fullHeight - margin.top - margin.bottom;

	var rotation = 0

    var initX;
    var scale = 1;
    var mouseClicked = false;

    const projection = d3.geo.mercator()
        .scale(150)
        .translate([width/2, height/1.5])
        .rotate([rotation, 0, 0]);

	const zoom = d3.behavior.zoom()
		.scaleExtent([1, 20])
		.on("zoom", zoomed);

	const svg = d3.select("#world")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		//track where user clicked down
		.on("mousedown", function() {
			d3.event.preventDefault();
			if (scale !== 1) {
				return;
			}
			initX = d3.mouse(this)[0];
			mouseClicked = true;
		})
		.on("mouseup", function() {
			if (scale !== 1) {
				return;
			}
			rotation = rotation + ((d3.mouse(this)[0] - initX) * 360 / (scale * width));
			mouseClicked = false;
		})
		.call(zoom);

	function rotateMap(endX) {
		projection.rotate([rotation + (endX - initX) * 360 / (scale * width), 0, 0])
		g.selectAll('path')
			.attr('d', path);
	}

	//for tooltip
	const offsetL = document.getElementById('world').offsetLeft + 10;
	const offsetT = document.getElementById('world').offsetTop + 10;

	const path = d3.geo.path()
		.projection(projection);

	// tooltip for country
	var tooltip = d3.select("body").append("div")
    	.attr("class", "tooltip")
		.style("opacity", 0);

	//need this for correct panning
	const g = svg.append("g");

    //det json data and draw it
    d3.json("../data/countries.json", function(error, world) {
		if (error) return console.error(error);

		//countries
		g.append("g")
			.attr("class", "boundary")
			.selectAll("boundary")
				.data(topojson.feature(world, world.objects.countries1).features)
				.enter().append("path")
				.classed("country", true)
				.attr("name", function(d) {return d.properties.name;})
				.attr("id", function(d) { return d.id;})
				.on('click', selected)
				.on("mousemove", showTooltip)
				.on("mouseout",  function(d,i) {
					tooltip.transition()
						.duration(50)
						.style("opacity", 0)
				})
				.attr("d", path);
	});

    function showTooltip(d) {
		label = d.properties.name;

		var mouse = d3.mouse(svg.node())
			.map( function(d) { return parseInt(d); } );

		tooltip.html(label)
			.style("left", `${mouse[0] + offsetL}px`)
			.style("top", `${mouse[1] + offsetT}px`)
			.transition()
			.duration(50)
			.style("opacity", 1)
    }

    function selected(d) {
		const codes = Object.keys(countryNames)
		const code = d.id

		if (!codes.includes(code)) {
			return;
		}

		const isSelected = d3.select(this).classed('selected')
		d3.select(this).classed('selected', !isSelected);

		var selectedCountries = []
		d3.selectAll('path.selected')
			.each(function(d) {
				selectedCountries.push(countryNames[d.id])
			})

		$(`#menu[name=country-picker]`).val(selectedCountries);
		$('#menu').selectpicker('refresh')
		updatePointChart()
		updateLineChart()

	}

    function zoomed() {
		var t = d3.event.translate;
		scale = d3.event.scale;
		var h = 0;

		t[0] = Math.min(
			(width/height)  * (scale - 1),
			Math.max( width * (1 - scale), t[0] )
		);

		t[1] = Math.min(
			h * (scale - 1) + h * scale,
			Math.max(height  * (1 - scale) - h * scale, t[1])
		);

		zoom.translate(t);

		if (scale === 1 && mouseClicked) {
			rotateMap(d3.mouse(this)[0])
			return;
		}

		g.attr("transform", `translate(${t})scale(${scale})`);

		//adjust the stroke width based on zoom level
		d3.selectAll(".boundary")
			.style("stroke-width", 1 / scale);
	}

	updateWorldChart = function() {
		// use select menu to update selected countries
		const options = $("#menu")[0].options
		for (var i = 0; i < options.length; i++) {
			d3.select(`#${countryCodes[options[i].value]}`)
				.classed("selected", options[i].selected)
		}

		const codes = Object.keys(countryNames)
		const countries = d3.selectAll(".country")[0]
		for (var i = 0; i < countries.length; i++) {
			const country = $(countries[i])
			const code = country[0]["id"]

			if (codes.includes(code)) {
				country.removeClass("disabledCountry")
			} else {
				country.addClass("disabledCountry")
			}
		}
	}

})
