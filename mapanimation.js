var map;
	var markers = [];

	// load map
	function init() {
		var myOptions = {
			zoom: 14,
			center: { lat: 42.353350, lng: -71.091525 },
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var element = document.getElementById('map');
		map = new google.maps.Map(element, myOptions);
		addMarkers();
	}

	// Add bus markers to map
	async function addMarkers() {
		// get bus data
		var locations = await getBusLocations();

		// loop through data, add bus markers
		locations.forEach(function (bus) {
			var marker = getMarker(bus.id);
			if (marker) {
				moveMarker(marker, bus);
			}
			else {
				addMarker(bus);
			}
		});

		// timer
		console.log(new Date());
		setTimeout(addMarkers, 15000);
	}

	// Request bus data from MBTA
	async function getBusLocations() {
		var url = 'https://api-v3.mbta.com/vehicles?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[route]=1&include=trip';
		var response = await fetch(url);
		var json = await response.json();
		return json.data;
	}

	function addMarker(bus) {
		var icon = getIcon(bus);
		var marker = new google.maps.Marker({
			// animate marker drop 
			animation: google.maps.Animation.DROP,
			position: {
				lat: bus.attributes.latitude,
				lng: bus.attributes.longitude
			},
			map: map,
			icon: icon,
			id: bus.id
		});
		markers.push(marker);

		//*** popup .InfoWindow ***//
		
		var label = bus.attributes.label
		var capacity = bus.attributes.occupancy_status;
		// check for null
		if (capacity === null) { capacity = 'EMPTY' };
		// clean up string
		capacity = capacity.replace(/_/g, " ")
		capacity = capacity.toLowerCase();
		var infowindow = new google.maps.InfoWindow({
			content: `<b>Bus Number:</b> ${label} <br><p><b>Occupancy</b><br> 
			<span style="text-transform: capitalize;">${capacity}</span></p>`
		});
		marker.addListener('click', function () {
			infowindow.open(map, marker);
		});
	}


	function getIcon(bus) {
		// select icon based on bus direction
		if (bus.attributes.direction_id === 0) {
			return 'red.png';
		}
		return 'blue.png';
	}

	function moveMarker(marker, bus) {
		// change icon if bus has changed direction
		var icon = getIcon(bus);
		marker.setIcon(icon);

		// move icon to new lat/lon
		marker.setPosition({
			lat: bus.attributes.latitude,
			lng: bus.attributes.longitude
		});
	}

	function getMarker(id) {
		var marker = markers.find(function (item) {
			return item.id === id;
		});
		return marker;
	}


	window.onload = init;
