function loadApp() {
  var canvas = $("#canvas");
  var viewport = $("#canvas .viewport");
  var flipbook = $("#canvas .flipbook");
  canvas.fadeIn(1000);

  // Check if the CSS was already loaded
  // if (flipbook.width() == 0 || flipbook.height() == 0) {
  //   setTimeout(loadApp, 10);
  //   return;
  // }

  // Create the flipbook
  flipbook.turn({
    // Magazine width
    width: 922,
    // Magazine height
    height: 600,
    // Duration in millisecond
    duration: 1000,
    // Hardware acceleration
    acceleration: !isChrome(),
    // Enables gradients
    gradients: true,
    // Auto center this flipbook
    // autoCenter: true,
    // Elevation from the edge of the flipbook when turning a page
    elevation: 50,
    // The number of pages
    pages: 120,
    // Events
    when: {
      turning: function(event, page, view) {
        var book = $(this),
          currentPage = book.turn("page"),
          pages = book.turn("pages");
        // Update the current URI
        Hash.go("page/" + page).update();
        // Show and hide navigation buttons
        disableControls(book, page);
        // $(".thumbnails .page-" + currentPage)
        //   .parent()
        //   .removeClass("current");
        // $(".thumbnails .page-" + page)
        //   .parent()
        //   .addClass("current");
      },
      turned: function(event, page, view) {
        var book = $(this);
        disableControls(book, page);
        // book.turn("center");
        if (page == 1) {
          book.turn("peel", "br");
        }
      },
      missing: function(event, pages) {
        // Add pages that aren't in the magazine
        for (var i = 0; i < pages.length; i++) addPage(pages[i], $(this));
      }
    }
  });

  // Using arrow keys to turn the page
  $(document).keydown(function(e) {
    var previous = 37,
      next = 39,
      esc = 27;
    switch (e.keyCode) {
      case previous:
        // left arrow
        flipbook.turn("previous");
        e.preventDefault();
        break;
      case next:
        //right arrow
        flipbook.turn("next");
        e.preventDefault();
        break;
      // case esc:
      //   viewport.zoom("zoomOut");
      //   e.preventDefault();
      //   break;
    }
  });
  // URIs - Format #/page/1
  Hash.on("^page/([0-9]*)$", {
    yep: function(path, parts) {
      var page = parts[1];
      if (page !== undefined) {
        if (flipbook.turn("is")) flipbook.turn("page", page);
      }
    },
    nop: function(path) {
      if (flipbook.turn("is")) flipbook.turn("page", 1);
    }
  });

  $(window)
    .resize(function() {
      resizeViewport(flipbook, viewport);
    })
    .bind("orientationchange", function() {
      resizeViewport(flipbook, viewport);
    });

  // Events for the next button
  $(".next-button")
    // .bind($.mouseEvents.over, function() {
    //   $(this).addClass("next-button-hover");
    // })
    // .bind($.mouseEvents.out, function() {
    //   $(this).removeClass("next-button-hover");
    // })
    // .bind($.mouseEvents.down, function() {
    //   $(this).addClass("next-button-down");
    // })
    // .bind($.mouseEvents.up, function() {
    //   $(this).removeClass("next-button-down");
    // })
    .click(function() {
      flipbook.turn("next");
    });
  // Events for the next button
  $(".previous-button")
    // .bind($.mouseEvents.over, function() {
    //   $(this).addClass("previous-button-hover");
    // })
    // .bind($.mouseEvents.out, function() {
    //   $(this).removeClass("previous-button-hover");
    // })
    // .bind($.mouseEvents.down, function() {
    //   $(this).addClass("previous-button-down");
    // })
    // .bind($.mouseEvents.up, function() {
    //   $(this).removeClass("previous-button-down");
    // })
    .click(function() {
      flipbook.turn("previous");
    });
  resizeViewport(flipbook, viewport);
  flipbook.addClass("animated");
}

// http://code.google.com/p/chromium/issues/detail?id=128488
function isChrome() {
  return navigator.userAgent.indexOf("Chrome") != -1;
}

function addPage(page, book) {
  var id,
    pages = book.turn("pages");
  // Create a new element for this page
  var element = $("<div />", {});
  // Add the page to the flipbook
  if (book.turn("addPage", element, page)) {
    // Add the initial HTML
    // It will contain a loader indicator and a gradient
    element.html('<div class="gradient"></div><div class="loader"></div>');
    // Load the page
    loadPage(page, element);
  }
}

function loadPage(page, pageElement) {
  // Create an image element
  var img = $("<img />");
  img.mousedown(function(e) {
    e.preventDefault();
  });
  img.load(function() {
    // Set the size
    $(this).css({ width: "100%", height: "100%" });
    // Add the image to the page after loaded
    $(this).appendTo(pageElement);
    // Remove the loader indicator
    pageElement.find(".loader").remove();
  });
  // Load the page
  img.attr("src", "pages/" + page + "-large.jpg");
  // loadRegions(page, pageElement);
}

function disableControls(book, page) {
  if (page == 1) $(".previous-button").hide();
  else $(".previous-button").show();
  if (page == book.turn("pages")) $(".next-button").hide();
  else $(".next-button").show();
}

function resizeViewport(book, viewport) {
  var width = $(window).width(),
    height = $(window).height(),
    options = book.turn("options");
  book.removeClass("animated");
  viewport.css({
    width: width,
    height: height
  });
  // .zoom("resize");
  if (book.turn("zoom") == 1) {
    var bound = calculateBound({
      width: options.width,
      height: options.height,
      boundWidth: Math.min(options.width, width),
      boundHeight: Math.min(options.height, height)
    });
    if (bound.width % 2 !== 0) bound.width -= 1;
    if (bound.width != book.width() || bound.height != book.height()) {
      book.turn("size", bound.width, bound.height);
      if (book.turn("page") == 1) book.turn("peel", "br");

      $(".next-button").css({
        height: bound.height,
        backgroundPosition: "-38px " + (bound.height / 2 - 32 / 2) + "px"
      });
      $(".previous-button").css({
        height: bound.height,
        backgroundPosition: "-4px " + (bound.height / 2 - 32 / 2) + "px"
      });
    }
    // book.css({ top: -bound.height / 2, left: -bound.width / 2 });

    book.css({
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,

      margin: "auto"
    });
  }
  book.addClass("animated");
}

// Calculate the width and height of a square within another square

function calculateBound(d) {
  var bound = { width: d.width, height: d.height };
  if (bound.width > d.boundWidth || bound.height > d.boundHeight) {
    var rel = bound.width / bound.height;
    if (
      d.boundWidth / rel > d.boundHeight &&
      d.boundHeight * rel <= d.boundWidth
    ) {
      bound.width = Math.round(d.boundHeight * rel);
      bound.height = d.boundHeight;
    } else {
      bound.width = d.boundWidth;
      bound.height = Math.round(d.boundWidth / rel);
    }
  }
  return bound;
}
