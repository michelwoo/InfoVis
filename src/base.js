$(document).ready(function(){

	countryCodes = {}

	// initialize all countries in country list
	d3.csv("../data/data.csv", function(error, data){
		for (var i = 0; i < data.length; i++) {
			var option = document.createElement("option");
			const name = data[i]["Country Name"]

			// Store country codes, used to select coutries on the map
			countryCodes[name] = data[i]["Three_Letter_Country_Code"]
			continent_name = data[i]["Continent_Name"]
	    option.value = name;
			option.text = name;
	    option.selected = false

			opt_group = "#" + continent_name.replace(/\s/g,'')

	    $(opt_group).append(option)
	    	.selectpicker("refresh")
    	}

			$('.selectpicker').selectpicker('refresh')

    	$("#menu").on("change", updateCharts)
	})

	function updateCharts(){
		updatePointChart()
		updateLineChart()
		updateWorldChart()
	}

	function selectAll() {
		$("#menu option").each(function () {
			$(this)[0].selected = true
		})
		updateCharts();
	}

	function deselectAll() {
		$("#menu option").each(function () {
			$(this)[0].selected = false
		})
		updateCharts();
	}

	// initialize variables for buttons
	var running = false;
	var timer;

	// once clicked on change
	$("#play").on("click", function() {
		var duration = 500;
		var maxYear = 2016;
		var minYear = 1960;

		if (running == true) {
			$("#play").html("Play");
			running = false;
			clearInterval(timer);
		} else {
			$("#play").html("Pause");

			sliderValue = $("#slider").val();

			// reset to start if user clicks play at end of slider
			if (sliderValue == maxYear) {
				sliderValue = minYear;
				$("#slider").val(sliderValue);
				$('#range').html(sliderValue);
			}

			timer = setInterval(function() {
				if (sliderValue < maxYear) {
					sliderValue++;
					$("#slider").val(sliderValue);
					$('#range').html(sliderValue);
				} else {
					running = false
					clearInterval(timer);
					$("#play").html("Play")
				}
				$("#slider").val(sliderValue);
				updateCharts();
			}, duration);

			running = true;
		}
	})

	$("#previousYear").on("click", function() {
		// stop animations if user clicks previous year
		running = false;
		clearInterval(timer);

		$("#slider").val(parseInt($("#slider").val()) - 1);
		$("#range").html($("#slider").val());
		$("#play").html("Play");
		updateCharts()

	})

	$("#nextYear").on("click", function() {
		// stop animations if user clicks next year
		running = false;
		clearInterval(timer);

		$("#slider").val(parseInt($("#slider").val()) + 1);
		$("#range").html($("#slider").val());
		$("#play").html("Play");
		updateCharts()
	})

	// change button
	$("#slider").on("change", function() {
		// stop animations if user clicks slider
		running = false;
		clearInterval(timer);

		// update to new year
		$("#range").html($("#slider").val());
		$("#play").html("Play");
		updateCharts();
	});

	// select continent in filter
	$(".continentButton").on("click", function() {
		continent_id = this.innerHTML.replace(/\s/g,'')

		var sel_count_ids = []
		$("#" + continent_id +' option').each(function () {
				sel_count_ids.push($(this)[0].value)
		})

		//unselect all other continents and select all our continents
		$("#menu option").each(function () {
			if (sel_count_ids.includes($(this)[0].value)){
				$(this)[0].selected = true
			} else {
				$(this)[0].selected = false
			}
		})

		$('.selectpicker').selectpicker('refresh')
		updateCharts()
	})

	$("#selectAllButton").on("click", function() {		
		selectAll();
	})

	$("#deselectAllButton").on("click", function() {		
		deselectAll();
	})
	


})
