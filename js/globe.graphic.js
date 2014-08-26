globe.graphic = function() {

	globe.graphic.clusters = _.sortBy(globe.graphic.clusters, 'RANK');

	var master = $('#gf');

	var graphicMobile;
	
	// if we're on touch, add the mobile template
	if (Modernizr.touch) {
		$('.main-hed').html('Dunkin\' Donuts vs. Starbucks');
		graphicMobile = globe.graphicMobile($('.content', master), $('.subtitle, .source-and-credit', master));

		if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)) {
			$('html').addClass('ipad ios7');
		}
	}

	var noStreetsLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v4/gabriel-florit.jb33660i/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
		minZoom: 4,
		maxZoom: 10
	});



	var streetsLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v4/gabriel-florit.jb33660i/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
		minZoom: 4,
		maxZoom: 10
	});

	// create the map
	var initialBounds = [38.586552, -97.075195];
	var initialZoom = 4; 
	var map = L.map($('.content', master).get(0), {
		center: initialBounds,
		minZoom: 4,
		maxZoom: 10,
		zoom: initialZoom,
		attributionControl: false,
		layers: [noStreetsLayer, streetsLayer],
		pan: {
			animate: true
		}
	});

	var clusterOutline;

	$('.buttons', master).show();

	var hotspotIndex = 0;

	var fsm = StateMachine.create({
		"initial": "splash",
		"events": [
			{
				"name": "clickHotspot",
				"from": [
					"splash",
					"explore"
				],
				"to": "hotspot"
			},
			{
				"name": "clickExplore",
				"from": [
					"splash",
					"hotspot"
				],
				"to": "explore"
			}
		],
		"callbacks": {
			onhotspot:  function(event, from, to, msg) {

				if (graphicMobile) {
					graphicMobile.collapseDrawer();					
				}

				// are we coming from splash?
				// if so, reposition the buttons
				if (from === 'splash') {
					$('.buttons', master).removeClass('center').addClass('topright');
				}

				// hide this button
				$('.hotspots.button', master).hide();

				// show other button
				$('.explore.button', master).show();

				// populate hotspot details
				populateDetails(hotspotIndex++);

				// show detail
				$('.details', master).show();
			},
			onexplore:  function(event, from, to, msg) {

				if (graphicMobile) {
					graphicMobile.collapseDrawer();					
				}

				// are we coming from splash?
				// if so, reposition the buttons
				if (from === 'splash') {
					$('.buttons', master).removeClass('center').addClass('topright');
				}

				// hide this button
				$('.explore.button', master).hide();

				// show other button
				$('.hotspots.button', master).show();

				// reset map view
				map.setView(initialBounds, initialZoom);

				// hide detail
				$('.details', master).hide();

				// hide cluster outline
				if (clusterOutline) {
					map.removeLayer(clusterOutline);
				}
			}
		}
	});

	$('.hotspots.button', master).click(function(e) {
		e.preventDefault();
		fsm.clickHotspot();
	});

	$('.explore.button', master).click(function(e) {
		e.preventDefault();
		fsm.clickExplore();
	});

	$('.details', master).on('click', '.next', function() {
		populateDetails(hotspotIndex++);
	});

	function populateDetails(index) {

		var modulo = index % globe.graphic.clusters.length;

		var datum = globe.graphic.clusters[modulo];

		$('.details').html(window.JST['hotspot.template']({
			town: datum.TOWNS,
			text: datum.text,
			next: (globe.graphic.clusters.length - modulo) != 1 ? 'Next' : 'Start over'
		}));

		var bounds = [
			[datum.bounds[1], datum.bounds[0]],
			[datum.bounds[3], datum.bounds[2]]
		];

		if (clusterOutline) {

			clusterOutline.setBounds(bounds);

		} else {

			clusterOutline = L.rectangle(bounds, {
				color: '#FFFFFF',
				fill: false
			});

		}

		if (!map.hasLayer(clusterOutline)) {
			map.addLayer(clusterOutline);
		}

		map.fitBounds(bounds);
	}

	// if (!Modernizr.touch) {
	// 	fsm.clickHotspot();
	// }

};
