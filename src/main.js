var OMDB_URL = "http://www.omdbapi.com/?";
var TMDB_URL = "https://api.themoviedb.org/3/search/movie?api_key=eccd2504f86260d8315b3dbf909e2c1e"
var TMDB_IMG_URL = "http://image.tmdb.org/t/p/w500/"
var FIRE_URL = "https://search4moviez.firebaseio.com/movies.json";
var $searchInput = $(".search input");
var $searchResults = $(".searchResults");
var $watchlist = $(".watchlist");

$.get(FIRE_URL, function (data) {
    //addHeaders();
  Object.keys(data).forEach(function (id) {
    addMovie(data[id], id);
  });
});

$(".search button").click(function () {
  var searchURL = OMDB_URL + "t=?" + $searchInput.val() + "&plot=full&tomatoes=true";
  $.get(searchURL, showSearchResults);
});

function showSearchResults(data) {
  var html = "<div class='col-lg-6 col-m-6 col-sm-6'><h2>" + data.Title + " (" + data.Year + ")</h2>";
  html += "<img class='poster' src='" + data.Poster + "'></div>";
  html += "<div class='col-lg-6 col-m-6 col-sm-6'><div class='ratings'>";
  if (data.tomatoImage === "certified") {
    html += "<div><img class='fresh' src='http://d3biamo577v4eu.cloudfront.net/static/images/icons/cf-lg.png'></div>";
  };
  html += "<div><div class='tomatoLogo'>" + data.tomatoMeter + "</div><div class='tomatoVotes'>" + numConvert(data.tomatoUserReviews) + "</div></div>";
  html += "<div class='imdb'><div class='imdbLogo'>" + data.imdbRating + "</div>";
  html += "<div class='imdbVotes'>" + numConvert(decomma(data.imdbVotes)) + "</div></div>";
  html += "<div class='meta'>" + data.Metascore + "</div></div><div><p>" + data.Plot + "</p></div>";
  html += "<div><button class='myButton'>Add to Watchlist</button></div></div>";
  $searchResults.empty();
  $searchResults.append(html);
  var $meta = $(".searchResults .meta")
  if (data.Metascore > 60) {
    $meta.addClass("high");
  } else if (data.Metascore >= 40) {
    $meta.addClass("med");
  } else if (data.Metascore < 40) {
    $meta.addClass("low");
  };
}

$searchResults.on("click", "button", (function() {
  var searchURL = OMDB_URL + "t=?" + $searchInput.val() + "&plot=full&tomatoes=true";
  var $addButton = $(this).closest("button");
  $.get(searchURL, function (data) {
    $.post(FIRE_URL, JSON.stringify(data), function (response) {
      addMovie(data, response.name);
    });
  });
}));

function decomma(str) {
  var num = "";
  str.split("").forEach(function(digit, i) {
    if (digit !== ",") {
      num += digit;
    };
    return num;
  });
  return num;
};

function numConvert(num) {
  if (num / 1000000 > 1) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num / 10000 > 1) {
    return (num / 1000).toFixed(0) + "K";
  } else {
    return num;
  }
};

function addMovie (data, id) {
  var html = "<div data-id=" + id + " class='movie'>";
  html += "<div><img src='" + data.Poster + "' alt='" + data.Title + "'></img></div>";
  html += "<div>" + data.Title + "</div>";
  html += "<div>" + data.Year + "</div>";
  if (data.tomatoImage === "certified") {
    html += "<div><img class='fresh' src='http://d3biamo577v4eu.cloudfront.net/static/images/icons/cf-lg.png'></div>";
  } else {
    html += "<div></div>";
  };
  html += "<div><div class='tomatoLogo'>" + data.tomatoMeter + "</div><div class='tomatoVotes'>" + numConvert(data.tomatoUserReviews) + "</div></div>";
  html += "<div class='imdb'><div class='imdbLogo'>" + data.imdbRating + "</div>";
  html += "<div class='imdbVotes'>" + numConvert(decomma(data.imdbVotes)) + "</div></div>";
  html += "<div class='meta'>" + data.Metascore + "</div>";
  html += "<div><button class='myButton2'>Remove</button></div></div>";
  $watchlist.append(html);
  var $meta = $(".movie:last-child .meta");
  if (data.Metascore > 60) {
    $meta.addClass("high");
  } else if (data.Metascore >= 40) {
    $meta.addClass("med");
  } else if (data.Metascore < 40) {
    $meta.addClass("low");
  };

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

//function addHeaders() {
  //var html = "<div class='movie header'>";
  //html += "<div>Poster</div>";
  //html += "<div>Title</div>";
  //html += "<div>Year</div>";
  //html += "<div>Tomatometer</div>";
  //html += "<div>Certified Fresh</div>";
  //html += "<div>IMDb Rating</div>";
  //html += "<div>IMDb Votes</div>";
  //html += "<div>Metascore</div>";
  //html += "<div>Remove</div>";
  //html += "</div>";
  //$watchlist.append(html);
//}
