//= require_tree .

;(function($) {
  function translate($el, x) {
    $el.css({
      '-webkit-transform': 'translate3d(' + x + 'px, 0, 0)',
      'transform': 'translate3d(' + x + 'px, 0, 0)'
    });
  }

  function Swipe(el) {
    this.active = false;
    this.currentSlide = 0;
    this.swiping = false;
    this.$container = $(el)
      .on('touchstart', $.proxy(this, '_onTouchStart'))
      .on('touchmove', $.proxy(this, '_onTouchMove'))
      .on('touchend', $.proxy(this, '_onTouchEnd'));
    this.$slides = this.$container.children().addClass('swipe-slide');
    this.activate();
  }

  Swipe.prototype.next = function() {
    this.currentSlide = this._nextSlide();
    this._update();

    // FIXME: define callback/event and move outside
    setTimeout($.proxy(function() {
      this.$prevSlide.scrollTop(0);
      this.$nextSlide.scrollTop(0);
    }, this), 150);
  };

  Swipe.prototype.prev = function() {
    this.currentSlide = this._prevSlide();
    this._update();

    // FIXME: define callback/event and move outside
    setTimeout($.proxy(function() {
      this.$prevSlide.scrollTop(0);
      this.$nextSlide.scrollTop(0);
    }, this), 150);
  };

  Swipe.prototype._nextSlide = function() {
    return this.currentSlide < this.$slides.length - 1 ? this.currentSlide + 1 : 0;
  };

  Swipe.prototype._prevSlide = function() {
    return this.currentSlide > 0 ? this.currentSlide - 1 : this.$slides.length - 1;
  };

  Swipe.prototype._update = function() {
    this.$currentSlide = this.$slides.eq(this.currentSlide);
    this.$prevSlide = this.$slides.eq(this._prevSlide());
    this.$nextSlide = this.$slides.eq(this._nextSlide());
    translate(this.$currentSlide, 0);
    translate(this.$prevSlide, -this.$container.width());
    translate(this.$nextSlide, this.$container.width());

    if (this.active) {
      // wait for the transition to finish
      setTimeout($.proxy(this, '_updateClasses'), 150);
    } else {
      // set classes without delay when activating
      this._updateClasses();
    }
  };

  Swipe.prototype._updateClasses = function() {
    this.$slides.removeClass('swipe-active');
    this.$currentSlide
      .add(this.$prevSlide)
      .add(this.$nextSlide)
      .addClass('swipe-active');
  };

  Swipe.prototype._onTouchStart = function(ev) {
    this.touchStartX = ev.originalEvent.touches[0].pageX;
    this.touchStartY = ev.originalEvent.touches[0].pageY;
    this.$currentSlide
      .add(this.$prevSlide)
      .add(this.$nextSlide)
      .addClass('swipe-touch');
  };

  Swipe.prototype._onTouchMove = function(ev) {
    var deltaX = ev.originalEvent.touches[0].pageX - this.touchStartX,
        deltaY = ev.originalEvent.touches[0].pageY - this.touchStartY;

    if (this.swiping || Math.abs(deltaY) < 10) {
      translate(this.$currentSlide, deltaX);
      translate(this.$prevSlide, -this.$container.width() + deltaX);
      translate(this.$nextSlide, this.$container.width() + deltaX);
      this.swiping = true;
      ev.preventDefault();
    }
  };

  Swipe.prototype._onTouchEnd = function(ev) {
    var delta = ev.originalEvent.changedTouches[0].pageX - this.touchStartX
        threshold = this.$container.width() * 0.2;

    this.$currentSlide
      .add(this.$prevSlide)
      .add(this.$nextSlide)
      .removeClass('swipe-touch');

    if (this.swiping && -delta > threshold) {
      this.next();
    } else if (this.swiping && delta > threshold) {
      this.prev();
    } else {
      translate(this.$currentSlide, 0);
      translate(this.$prevSlide, -this.$container.width());
      translate(this.$nextSlide, this.$container.width());
    }

    this.swiping = false;
  };

  Swipe.prototype.activate = function() {
    if (!this.active) {
      this.$container.addClass('swipe-container');
      this._update();
      $(window).on('resize.swipe', $.proxy(this, '_update'));
      this.active = true;
    }
  };

  Swipe.prototype.deactivate = function() {
    this.$container.removeClass('swipe-container');
    this.$slides.removeAttr('style').removeClass('swipe-slide swipe-active');
    $(window).off('.swipe');
  };

  $.Swipe = Swipe;
}(window.jQuery || window.Zepto));

;(function($) {
  var $window = $(window),
      TRANSITION_THRESHOLD = 10;

  function Scroll(el) {
    this.active = false;
    this.currentSlide = null;
    this.ignoreScroll = false;
    this.transitioning = false;
    this.lastWheelTimestamp = 0;
    this.$slides = $(el).children();
    this.activate();
  }

  Scroll.prototype._update = function(animate) {
    this.$currentSlide = this.$slides.eq(this.currentSlide);
    this.$prevSlide = this.$slides.eq(this._prevSlide());
    this.$nextSlide = this.$slides.eq(this._nextSlide());
    this.currentSlideTop = this.$currentSlide.offset().top;
    this.currentSlideBottom = this.currentSlideTop + this.$currentSlide.height();

    this.$prevSlide.removeClass('scroll-active');
    this.$prevSlide.addClass('scroll-prev');

    if (animate) {
      this.transitioning = true;
      this.ignoreScroll = true;

      $('html, body').animate({
        scrollTop: this.currentSlideTop
      }, 500, $.proxy(function() {
        this.transitioning = false;
        this._delayEnableScroll();
      }, this));
    }
  };

  Scroll.prototype._delayEnableScroll = function(delay) {
    if (this.ignoreScroll) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout($.proxy(function() {
        this.ignoreScroll = false;
      }, this), 200);
    }
  };

  Scroll.prototype._nextSlide = function() {
    return this.currentSlide < this.$slides.length - 1 ? this.currentSlide + 1 : this.currentSlide;
  };

  Scroll.prototype._prevSlide = function() {
    return this.currentSlide > 0 ? this.currentSlide - 1 : 0;
  };

  Scroll.prototype.activate = function() {
    if (!this.active) {
      $window
        .on('scroll.scroll', $.proxy(this, '_onScroll'))
        .on('mousewheel.scroll wheel.scroll', $.proxy(this, '_onWheel'))
        .on('keydown.scroll', $.proxy(this, '_onKeyDown'))
        .on('mousedown.scroll', $.proxy(this, '_onMouseDown'))
        .on('mouseup.scroll', $.proxy(this, '_onMouseUp'))
        .on('resize.scroll', $.proxy(this, '_onResize'));

      this.active = true;
    }
  };

  Scroll.prototype.deactivate = function() {
    $window.off('.scroll');
    this.$slides.removeClass('scroll-active scroll-prev');
    this.active = false;
  };

  Scroll.prototype._onScroll = function() {
    var scrollTop = $window.scrollTop(),
        scrollBottom = scrollTop + $window.height();

    // need to init current slide here not in activate because scrollTop()
    // gives wrong result before the first scroll event on Chrome
    if (this.currentSlide === null) {
      this.$slides.each($.proxy(function(i, el) {
        if ($(el).offset().top >= $window.scrollTop()) {
          this.currentSlide = i;
          return false;
        }
      }, this));

      this._update(false);
    }

    if (scrollTop > this.lastScrollTop) {
      // scroll down
      if (this.currentSlideBottom + TRANSITION_THRESHOLD < scrollBottom) {
        this.currentSlide = this._nextSlide();
        this._update(!this.transitioning);
      }

      if (this.currentSlideTop < scrollTop) {
        this.$currentSlide.addClass('scroll-active');
      }
    } else if (scrollTop < this.lastScrollTop) {
      // scroll up
      if (this.currentSlideTop - TRANSITION_THRESHOLD > scrollTop) {
        this.currentSlide = this._prevSlide();
        this._update(!this.transitioning);
      }

      if (this.currentSlideBottom >= scrollBottom) {
        this.$currentSlide.removeClass('scroll-prev');
        this.$currentSlide.addClass('scroll-active');
      }
      if (this.currentSlideBottom >= scrollTop) {
        this.$nextSlide.removeClass('scroll-active');
      }
    }

    this.lastScrollTop = scrollTop;
  };

  Scroll.prototype._onWheel = function(ev) {
    var timestampDelta = ev.timeStamp - this.lastWheelTimestamp;
    this.lastWheelTimestamp = ev.timeStamp;

    // delta above 200 means that the user stopped and resumed scrolling
    // delta below 5 means quick scrolling to get past several slides
    if (timestampDelta > 5 && timestampDelta < 200) {
      this._delayEnableScroll();
    } else if (!this.transitioning) {
      this.ignoreScroll = false;
    }

    return !this.ignoreScroll;
  };

  Scroll.prototype._onKeyDown = function(ev) {
    switch (ev.which) {
      case 33:
        // Page Up key
        this.currentSlide = this._prevSlide();
        this._update(true);
        return false;
      case 34:
        // Page Down key
        this.currentSlide = this._nextSlide();
        this._update(true);
        return false;
      case 36:
        // Home key
        this.deactivate();
        this.currentSlide = 0;
        this.activate();
        break;
      case 35:
        // End key
        this.deactivate();
        this.currentSlide = this.$slides.length - 1;
        this.activate();
        break;
    }
  };

  Scroll.prototype._onMouseDown = function() {
    this.$slides.removeClass('scroll-active scroll-prev');
    this.ignoreScroll = true;
    this.transitioning = true;
  };

  Scroll.prototype._onMouseUp = function() {
    this.ignoreScroll = false;
    this._update(true);
  };

  Scroll.prototype._onResize = function() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout($.proxy(function() {
      this.$slides.removeClass('scroll-active scroll-prev');
      this._update(true);
    }, this), 100);
  };

  $.Scroll = Scroll;
}(window.jQuery || window.Zepto));

(function() {
  var swipe = window.swipe = new $.Swipe('#container'),
      scroll = window.scroll = new $.Scroll('#container'),
      mediaQuery = window.matchMedia('(max-width: 50em)');

  function checkMediaQuery(query) {
    if (query.matches && 'ontouchstart' in window) {
      scroll.deactivate();
      swipe.activate();
    } else {
      swipe.deactivate();
      scroll.activate();
    }
  }

  checkMediaQuery(mediaQuery);
  mediaQuery.addListener(checkMediaQuery);

  $('.about').on('click touchend', function() {
    $('.overlay').addClass('visible');
  });
  $('.overlay .close').on('click touchend', function() {
    $('.overlay').removeClass('visible');
  });
}());

