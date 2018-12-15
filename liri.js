require("dotenv").config();
var Spotify = require('node-spotify-api')
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var request = require("request");
var moment = require("moment");
var fs = require("fs");

function askLiri(action, value) {
switch (action) {
    case "concert-this":
        searchBandsAPI(value);
        break;

    case "spotify-this-song":
        searchSpotifyAPI(value);
        break;

    case "movie-this":
        searchOmdbAPI(value);
        break;

    case "do-what-it-says":
        searchTextFile(value);
        break;

    default:
    console.log("To use this app, use the following commands:\n concert-this --Seach for concerts by bandname\n spotify-this-song --Display information about song title\n movie-this -- return information regarding specified movie\n do-what-it-says -- run commands from a text file. Please specify FILENAME.EXT")
        break;
}
fs.writeFile("log.txt", action + "," + value, function(err) {
    if (err) {
      return console.log(err);
    }
      console.log("log.txt was updated!");
  });
}

askLiri(process.argv[2], process.argv[3])

function searchBandsAPI(bandName) {
    request("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var objectBody = JSON.parse(body);
            for (i = 0; i < objectBody.length; i++) {
                console.log("Venue: " + objectBody[i].venue.name);
                console.log("City: " + objectBody[i].venue.city + ", " + objectBody[i].venue.country);
                console.log(moment(objectBody[i].datetime).format("MM/DD/YY"));
            }
        } else {
            console.log(error);
        }
    });
}

function searchSpotifyAPI(songName) {
    if (songName == undefined) {
        songName = "The Sign"
        searchSpotifyAPI(songName);
    } else {
    spotify.search({ type: 'track', query: songName })
  .then(function(response) {
    var songInfo = ""
    songInfo += "\n"; 
    songInfo += "Song: " + response.tracks.items[0].name + "\n";
    songInfo += "Artist: " + response.tracks.items[0].artists.map(artist => artist.name).join(", ") + "\n";
    songInfo += "URL: " + response.tracks.items[0].album.external_urls.spotify + "\n";
    songInfo += "Album: " + response.tracks.items[0].album.name;
    console.log(songInfo)
  })
  .catch(function(err) {
    console.log(err);
  });
}
}

function searchOmdbAPI(movieName) {
    request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy", function(error, response, body) {
  if (!error && response.statusCode === 200 && movieName != undefined) {
    
    console.log("Title: " + JSON.parse(body).Title);
    console.log("Year Released: " + JSON.parse(body).Year);
    console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
    console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].value);
    console.log("Country: " + JSON.parse(body).Country);
    console.log("Language: " + JSON.parse(body).Language);
    console.log("Plot Summary: " + JSON.parse(body).Plot);
    console.log("Actors: " + JSON.parse(body).Actors);
  } else {
      movieName = "Mr. Nobody"
    searchOmdbAPI(movieName);
}
});
}

function searchTextFile(fileName) {
    fs.readFile(fileName, "utf8", function(error, data) {
        if (error) { if (error === "ERR_INVALID_ARG_TYPE"){
            console.log("Please specify a file " + error);
        }
          return console.log(error);
        }
        console.log(data);
        var dataArr = data.split(",");
        console.log(dataArr);
        askLiri(dataArr[0], dataArr[1]);        
      });
}