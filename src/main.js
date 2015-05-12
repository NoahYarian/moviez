var OMDB_URL = "http://www.omdbapi.com/?";
var TMDB_URL = "https://api.themoviedb.org/3/search/movie?api_key=eccd2504f86260d8315b3dbf909e2c1e"
var TMDB_IMG_URL = "http://image.tmdb.org/t/p/w500/"
var FIRE_URL = "https://search4moviez.firebaseio.com/movies.json";
var $searchInput = $(".search input");
var $searchResults = $(".searchResults");
var $watchlist = $(".watchlist");

$.get(FIRE_URL, function (data) {
  Object.keys(data).forEach(function (id) {
    addMovie(data[id], id);
  });
});

$(".search button").click(function () {
  var searchURL = OMDB_URL + "t=?" + $searchInput.val() + "&plot=full";
  $.get(searchURL, showSearchResults);
});

function showSearchResults(data) {
  var html = "<h1>" + data.Title + " (" + data.Year + ")</h1>";
  html += "<img class='poster' src='" + data.Poster + "'></img>";
  html += "<p>" + data.Plot + "</p>";
  html += "<button>Add to Watchlist</button>";
  $searchResults.empty();
  $searchResults.append(html);
}

$searchResults.on("click", "button", (function() {
  var searchURL = OMDB_URL + "t=?" + $searchInput.val();
  var $addButton = $(this).closest("button");
  $.get(searchURL, function (data) {
    $.post(FIRE_URL, JSON.stringify(data), function (response) {
      addMovie(data, response.name);
    });
  });
}));

function addMovie (data, id) {
  var html = "<div data-id=" + id + " class='movie col-lg-6'><div><img src='" + data.Poster + "' alt='" + data.Title + "'></img></div>";
  html += "<div>" + data.Title + "</div>";
  html += "<div>" + data.Year + "</div>";
  html += "<div><div class='imdbLogo'>" + data.imdbRating + "</div>(" + data.imdbVotes + " Votes)</div>";
  html += "<div>Metascore " + data.Metascore + "/100</div>";
  html += "<div><button>Remove</button></div></div>";
  $watchlist.append(html);
}

$watchlist.on("click", "button", function() {
  var $movie = $(this).closest(".movie");
  var id = $movie.attr('data-id');
  $movie.remove();
  var deleteUrl = FIRE_URL.slice(0, -5) + '/' + id + '.json';

  $.ajax({
    url: deleteUrl,
    type: 'DELETE'
  });

});
