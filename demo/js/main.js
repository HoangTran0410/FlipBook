const loadFlipbook = function (data) {
  const canvas = $(config.canvasSelector);
  const viewport = $(config.viewportSelector);
  // const container = $("#canvas .container");
  const flipbook = $(config.flipbookSelector);

  canvas.fadeIn(1000);

  // Check if the CSS was already loaded
  if (flipbook.width() == 0 || flipbook.height() == 0) {
    setTimeout(loadFlipbook, 10);
    return;
  }

  flipbook.html(data);

  // Create flipbook
  flipbook.turn({
    display: getDisplay(),
    // flipbook width
    width: getInitialPageSize().width,
    // flipbook height
    height: getInitialPageSize().height,
    // Duration in millisecond
    duration: 1000,
    // Hardware acceleration
    acceleration: !isChrome(),
    // Enables gradients
    gradients: true,
    // Auto center this flipbook
    autoCenter: true,
    // Elevation from the edge of the flipbook when turning a page
    elevation: 50,
    // The number of pages
    pages: 12,

    // Events
    when: {
      turning: function (event, page, view) {
        // Update the current URI
        Hash.go("page/" + page).update();
      },

      turned: function (event, page, view) {
        $(this).turn("center");

        if (page == 1) {
          $(this).turn("peel", "br");
        }
      },

      missing: function (event, pages) {
        // Add pages that aren't in the flipbook
        // for (var i = 0; i < pages.length; i++) addPage(pages[i], $(this));
      },
    },
  });

  // URIs - Format #/page/1
  Hash.on("^page/([0-9]*)$", {
    yep: function (path, parts) {
      var page = parts[1];
      if (page !== undefined) {
        if (flipbook.turn("is")) flipbook.turn("page", page);
      }
    },
    nop: function (path) {
      if (flipbook.turn("is")) flipbook.turn("page", 1);
    },
  });

  $(window)
    .resize(function () {
      resizeViewport(viewport, flipbook);
    })
    .bind("orientationchange", function () {
      resizeViewport(viewport, flipbook);
    });

  // Zoom.js
  viewport.zoom({
    flipbook: flipbook,

    max: function () {
      return largeFlipbookWidth() / $(this).zoom("flipbook").width();
    },

    when: {
      swipeLeft: function () {
        flipbook.turn("next");
      },

      swipeRight: function () {
        flipbook.turn("previous");
      },
    },
  });

  // Using arrow keys to turn the page
  $(document).keydown(function (e) {
    var previous = 37,
      next = 39;

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
    }
  });

  flipbook.addClass("animated");

  // calculate real size
  resizeViewport(viewport, flipbook);
};

async function loadData() {
  let data = await $.ajax({
    type: "GET",
    // url: "http://35.240.207.163/categories",.
    url: config.apiUrl,
  });

  console.log(data);

  let s = "";

  let page = 0;

  for (let i = 0; i < data.length; i++) {
    //add category name
    s += `
    <div class="page">
      <div class="category-name gradient">
        ${data[i].name}
      </div>
    </div>`;

    let content = "";
    for (let j = 0; j < data[i].products.length; j++) {
      content += `
      <tr>
        <td>${data[i].products[j].id}</td>
        <td>
          <img
            class="img-preview"
            src="${data[i].products[j].image}"
            alt=""
          />
        </td>
        <td>${data[i].products[j].name}</td>
        <td>${data[i].products[j].origin}</td>
        <td>${data[i].products[j].price}</td>
      </tr>`;

      if (
        (j + 1) % config.productPerPage === 0 ||
        j + 1 == data[i].products.length
      ) {
        s += `
        <div class="page">
          <div class="shadow"></div>
          <div class="content-inside gradient">
            <p class="page-header">${data[i].name}</p>
            <table class="table" cellspacing="0" >
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Origin  </th>
                <th>Price</th>
              </tr>
              ${content}
            </table>
          </div>
          <div class="number-page">${page++}</div>
        </div>`;
        content = "";
      }
    }
  }

  s = `
  <div class="hard" style="background-image: url(${config.coverPage})"></div>
  <div class="hard" style="background-image: url(${config.coverPage2})"></div>
    ${s}
  <div class="hard" style="background-image: url(${config.coverPageBack2})"></div>
  <div class="hard" style="background-image: url(${config.coverPageBack})"></div>`;

  return s;
  // $("#flipbook").html(s);
}

function addPage(page, flipbook) {
  // Create a new element for this page
  var element = $('<div class="page" />', {});

  // Add the page to the flipbook
  if (flipbook.turn("addPage", element, page - 2)) {
    // Add the initial HTML
    // It will contain a loader indicator and a gradient
    element.html(`<div class="loader"></div>`);

    // Load the page
    // loadPage(page, element);
  }
}

// http://code.google.com/p/chromium/issues/detail?id=128488
function isChrome() {
  return navigator.userAgent.indexOf("Chrome") != -1;
}

function isLandscape() {
  return window.innerHeight < window.innerWidth;
}

function getDisplay() {
  return isLandscape() ? "double" : "single";
}

function getInitialPageSize(base = 1) {
  if (isLandscape())
    return {
      width: 2 * base,
      height: config.pageSizeRatio * base,
    };

  return {
    width: 1 * base,
    height: config.pageSizeRatio * base,
  };
}

// Width of the flipbook when zoomed in
function largeFlipbookWidth() {
  return 2214;
}

function resizeViewport(viewport, flipbook) {
  // change orientation
  if (isLandscape()) {
    flipbook.turn("display", "double");
  } else {
    flipbook.turn("display", "single");
  }

  // recalculate initial size
  const newSize = getInitialPageSize(
    isLandscape() ? viewport.height() : viewport.width()
  );
  flipbook.turn("size", newSize.width, newSize.height);

  // cal real size
  const windowWidth = $(window).width(),
    windowHeight = $(window).height();

  // flipbook.removeClass("animated");
  viewport.css({
    width: windowWidth,
    height: windowHeight,
  });

  if (flipbook.turn("zoom") == 1) {
    const minMarginHorizontal = 20,
      minMarginVertical = 50;

    var bound = calculateBound({
      width: flipbook.width(),
      height: flipbook.height(),
      boundWidth: Math.min(flipbook.width(), windowWidth),
      boundHeight: Math.min(flipbook.height(), windowHeight),
    });

    if (bound.width % 2 !== 0) bound.width -= 1;

    if (bound.width != flipbook.width() || bound.height != flipbook.height()) {
      flipbook.turn(
        "size",
        bound.width - minMarginHorizontal * 2,
        bound.height - minMarginVertical * 2
      );

      if (flipbook.turn("page") == 1) flipbook.turn("peel", "br");
    }

    flipbook.css({
      top: -bound.height / 2 + minMarginVertical,
      left: -bound.width / 2 + minMarginHorizontal,
    });
  }

  // flipbook.addClass("animated");
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
