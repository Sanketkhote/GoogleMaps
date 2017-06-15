//Function to populate the InfoWindow on the marker
function showMe(address,lives){
	var contentString = "";
	contentString += ("<div><h4>"+address+"</h4>");
	for(var x = 0;x<lives.length;x++){
		contentString += ("<a href='#' onclick='lifeInfo("+lives[x].id+")'>"+lives[x].info+"</a><br>");
	}
	contentString += ("</div>");
	return contentString;
}

//Function called after user clicks on link of any of the life played.
function lifeInfo(x){
	alert(x);
}
	
//Div in which MAP is loaded		
var element = document.getElementById("map");

//MAP Theme
var stylez = [{
	featureType: "all",
	stylers: [
	  { hue: "#0023ff" },
	  { saturation: 10 }
	]
  },
];
styledMapType = new google.maps.StyledMapType(stylez, {name: "Edited"});

//Create the MAP
var map = new google.maps.Map(element, {
	mapTypeControlOptions: {
		mapTypeIds: [google.maps.MapTypeId.ROADMAP, "Edited"] 
	},
	minZoom: 2,
	zoom: 2,
	mapTypeControl: false,
	center: new google.maps.LatLng(0, 0),
	mapTypeControl: false,
	streetViewControl: false,
	
});
map.mapTypes.set("Edited", styledMapType);
map.setMapTypeId('Edited');

//Place the markers and infowindows
/*
	'livesJsonInfo' is a variable passed to this script that contains info from the database.
	It should be structured as :
		[
			{
				address:'address',
				lives:[
					{id:lifeId, info:lifeInfo},
					...
				]
			},
			...
		]
		
		i.e Array of JSON objects:
				Each JSON contains:
					Address of the place.
					Array of JSON Objects:
						Each JSON contains:
							Life ID
							Life Info
				
*/
var livesJsonInfo = [{address:"Pune",lives:[{id:0,info:"Life 1 Pune"},{id:1,info:"Life 2 Pune"}]},{address:"Washington",lives:[{id:0,info:"Life 1 Washington"},{id:1,info:"Life 2 Washington"}]}];

var infowindows = [];
for(var i=0;i<livesJsonInfo.length;i++){
	//Synchronous design of Google Geocoder
	//Get Lat and Lon of address
	var xmlHttp = new XMLHttpRequest();
	var latlng;
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			var callbackans = JSON.parse(xmlHttp.responseText);
			var results = callbackans.results;
			var status = callbackans.status;
			if(status == google.maps.GeocoderStatus.OK){
				newAddress = results[0].geometry.location;
				latlng = new google.maps.LatLng(parseFloat(newAddress.lat),parseFloat(newAddress.lng));
			}
		}
	}
	xmlHttp.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?address="+livesJsonInfo[i].address, false);  
	xmlHttp.send();	

	//Create the marker
	var marker = new google.maps.Marker({
		position: latlng,
		animation: google.maps.Animation.DROP,
		map: map,
	});
	
	
	//Add onclick listener to the marker
	marker.addListener('click', function(x) {
		return function(){
			map.setZoom(8);
			map.setCenter(x.getPosition());
		}
	}(marker));
	
	//Add mouseover listener to the marker
	marker.addListener('mouseover', function(city,lmap,lmarker,x){
		return function(){	
			if(infowindows[x]==null){
				infowindows[x] = new google.maps.InfoWindow({
					content: showMe(city.address,city.lives)
				});
				infowindows[x].open(lmap, lmarker);
				infowindows[x].addListener('closeclick',function(j){
					return function(){
						infowindows[j] = null;
					}
				}(x));
			}
		};
	}(livesJsonInfo[i],map,marker,i));
}
			