var OMDB_URL = "http://www.omdbapi.com/?";
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

/////////////////////
/// Login madness ///
/////////////////////

var FIREBASE_URL = 'https://search4moviez.firebaseio.com';
var fb = new Firebase(FIREBASE_URL);

$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
    }
  });

  event.preventDefault();
})

$('.doResetPassword').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();

  fb.resetPassword({
    email: email
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
    }
  });
});

$('.doLogout').click(function () {
  fb.unauth();
})

$('.doRegister').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  fb.createUser({
    email: email,
    password: password
  }, function (err, userData) {
    if (err) {
      alert(err.toString());
    } else {
      doLogin(email, password);
    }
  });

  event.preventDefault();
});

$('.onLoggedOut form').submit(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  doLogin(email, password);
  event.preventDefault();
});

function clearLoginForm () {
  $('input[type="email"]').val('');
  $('input[type="password"]').val('');
}

function saveAuthData (authData) {
  $.ajax({
    method: 'PUT',
    url: `${FIREBASE_URL}/users/${authData.uid}/profile.json`,
    data: JSON.stringify(authData)
  });
}

function doLogin (email, password, cb) {
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else {
      saveAuthData(authData);
      typeof cb === 'function' && cb(authData);
    }
  });
}

fb.onAuth(function (authData) {
  var onLoggedOut = $('.onLoggedOut');
  var onLoggedIn = $('.onLoggedIn');
  var onTempPassword = $('.onTempPassword');

  if (authData && authData.password.isTemporaryPassword) {
    onTempPassword.removeClass('hidden');
    onLoggedIn.addClass('hidden');
    onLoggedOut.addClass('hidden');
  } else if (authData) {
    onLoggedIn.removeClass('hidden');
    onLoggedOut.addClass('hidden');
    onTempPassword.addClass('hidden');
    $('.onLoggedIn h1').text(`Hello ${authData.password.email}`);
  } else {
    onLoggedOut.removeClass('hidden');
    onLoggedIn.addClass('hidden');
    onTempPassword.addClass('hidden');
  }

  clearLoginForm();
});
