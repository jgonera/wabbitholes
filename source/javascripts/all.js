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
  var $window = $(window);

  function Scroll(el) {
    this.active = false;
    this.currentSlide = 0;
    this.ignoreScroll = false;
    this.lastScrollTop = $window.scrollTop();
    this.$slides = $(el).children();
    this.activate();
  }

  Scroll.prototype._update = function() {
    this.$currentSlide = this.$slides.eq(this.currentSlide);
    this.$prevSlide = this.$slides.eq(this._prevSlide());
    this.$nextSlide = this.$slides.eq(this._nextSlide());
    this.currentSlideTop = this.$currentSlide.offset().top;
    this.currentSlideBottom = this.currentSlideTop + this.$currentSlide.height();

    if (this.active) {
      this.ignoreScroll = true;

      $('html, body').animate({
        scrollTop: this.currentSlideTop
      }, 500, $.proxy(function() {
        this.ignoreScroll = false;
      }, this));
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
        .on('keydown.scroll', $.proxy(this, '_onKeyDown'));

      this._update();
      this.active = true;
    }
  };

  Scroll.prototype.deactivate = function() {
    $window.off('.scroll');
    this.$slides.removeClass('scroll-active scroll-prev scroll-next');
  };

  Scroll.prototype._onScroll = function() {
    var scrollTop = $window.scrollTop(),
        scrollBottom = scrollTop + $window.height();

    if (scrollTop > this.lastScrollTop) {
      if (this.currentSlideTop < scrollBottom) {
        this.$prevSlide.removeClass('scroll-active');
        this.$prevSlide.addClass('scroll-prev');
      }
      if (this.currentSlideTop <= scrollTop) {
        this.$currentSlide.addClass('scroll-active');
      }
    } else {
      if (this.currentSlideBottom >= scrollBottom) {
        this.$currentSlide.removeClass('scroll-prev');
        this.$currentSlide.addClass('scroll-active');
      }
      if (this.currentSlideBottom >= scrollTop) {
        this.$nextSlide.removeClass('scroll-active');
      }
    }

    if (!this.ignoreScroll) {
      if (scrollTop > this.lastScrollTop && this.currentSlideBottom < scrollBottom) {
        // scroll down
        this.currentSlide = this._nextSlide();
        this._update();
      } else if (scrollTop < this.lastScrollTop && this.currentSlideTop > scrollTop) {
        // scroll up
        this.currentSlide = this._prevSlide();
        this._update();
      }
    }

    this.lastScrollTop = scrollTop;
  };

  Scroll.prototype._onWheel = function() {
    return !this.ignoreScroll;
  };

  Scroll.prototype._onKeyDown = function(ev) {
    if (ev.which >= 33 && ev.which <= 36) {
      switch (ev.which) {
        // Page Up key
        case 33: this.currentSlide = this._prevSlide(); break;
        // Page Down key
        case 34: this.currentSlide = this._nextSlide(); break;
        // Home key
        case 36: this.currentSlide = 0; break;
        // End key
        case 35: this.currentSlide = this.$slides.length - 1; break;
      }

      this._update();
      return false;
    }
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

