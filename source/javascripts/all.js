//= require_tree .

;(function($) {
  function translate($el, x) {
    $el.css({
      '-webkit-transform': 'translate3d(' + x + 'px, 0, 0)',
      'transform': 'translate3d(' + x + 'px, 0, 0)'
    });
  }

  function Swipe(el) {
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
      this.$prevSlide.find('.content').scrollTop(0);
      this.$nextSlide.find('.content').scrollTop(0);
    }, this), 150);
  };

  Swipe.prototype.prev = function() {
    this.currentSlide = this._prevSlide();
    this._update();

    // FIXME: define callback/event and move outside
    setTimeout($.proxy(function() {
      this.$prevSlide.find('.content').scrollTop(0);
      this.$nextSlide.find('.content').scrollTop(0);
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

    // wait for the transition to finish
    setTimeout($.proxy(function() {
      this.$slides.removeClass('swipe-active');
      this.$currentSlide
        .add(this.$prevSlide)
        .add(this.$nextSlide)
        .addClass('swipe-active');
    }, this), 150);
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
    this.$container.addClass('swipe-container');
    this._update();
    $(window).on('resize.swipe', $.proxy(this, '_update'));
  };

  Swipe.prototype.deactivate = function() {
    this.$container.removeClass('swipe-container');
    this.$slides.removeAttr('style');
    $(window).off('.swipe');
  };

  $.Swipe = Swipe;
}(window.jQuery || window.Zepto));

;(function($) {
  var $window = $(window),
      AUTO_SCROLL_THRESHOLD = 10;

  function Scroll(el) {
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

    this.$slides.removeClass('scroll-active');
    setTimeout($.proxy(function() {
      this.$slides.removeClass('scroll-prev');
      this.$slides.removeClass('scroll-next');
      this.$currentSlide.addClass('scroll-active');
      this.$prevSlide.addClass('scroll-prev');
      this.$nextSlide.addClass('scroll-next');
    }, this), 1000);
  };

  Scroll.prototype._nextSlide = function() {
    return this.currentSlide < this.$slides.length - 1 ? this.currentSlide + 1 : 0;
  };

  Scroll.prototype._prevSlide = function() {
    return this.currentSlide > 0 ? this.currentSlide - 1 : this.$slides.length - 1;
  };

  Scroll.prototype.activate = function() {
    this._update();

    $window
      .on('scroll.scroll', $.proxy(this, '_onScroll'))
      .on('mousewheel.scroll', $.proxy(this, '_onMouseWheel'))
      .on('keydown.scroll', $.proxy(this, '_onKeyDown'))
      .on('keyup.scroll', $.proxy(this, '_onKeyUp'));
  };

  Scroll.prototype.deactivate = function() {
    $window.off('.scroll');
  };

  Scroll.prototype._onScroll = function() {
    var self = this,
        scrollTop = $window.scrollTop(),
        scrollBottom = scrollTop + $window.height(),
        slidesCount = this.$slides.length - 1;

    if (this.ignoreScroll) {
      return;
    }

    // scroll down
    if (scrollTop > this.lastScrollTop && this.currentSlide + 1 <= slidesCount) {
      var nextSlideTop = this.$slides.eq(this.currentSlide + 1).offset().top;

      if (nextSlideTop + AUTO_SCROLL_THRESHOLD < scrollBottom) {
        ++this.currentSlide;
        this.ignoreScroll = true;
        $('html, body').animate({
          scrollTop: nextSlideTop
        }, 1000, function() {
          self.ignoreScroll = false;
        });
        this._update();
      }
    }

    // scroll up
    if (scrollTop < this.lastScrollTop && this.currentSlide - 1 >= 0) {
      var $prevSlide = this.$slides.eq(this.currentSlide - 1),
          prevSlideTop = $prevSlide.offset().top,
          prevSlideBottom = prevSlideTop + $prevSlide.height();

      if (prevSlideBottom - AUTO_SCROLL_THRESHOLD > scrollTop) {
        --this.currentSlide;
        this.ignoreScroll = true;
        $('html, body').animate({
          scrollTop: prevSlideTop
        }, 1000, function() {
          self.ignoreScroll = false;
        });
        this._update();
      }
    }

    this.lastScrollTop = scrollTop;
  };

  Scroll.prototype._onMouseWheel = function() {
    return !this.ignoreScroll;
  };

  Scroll.prototype._onKeyDown = function(ev) {
    if (ev.which >= 33 && ev.which <= 36) {
      this.ignoreScroll = true;

      switch (ev.which) {
        // Home key
        case 36: this.currentSlide = 0; break;
        // End key
        case 35: this.currentSlide = this.$slides.length - 1; break;
        // Page Up key
        case 33: this.currentSlide = this._prevSlide(); break;
        // Page Down key
        case 34: this.currentSlide = this._nextSlide(); break;
      }

      this._update();
    }
  };

  Scroll.prototype._onKeyUp = function() {
    this.ignoreScroll = false;
  };

  $.Scroll = Scroll;
}(window.jQuery || window.Zepto));

(function() {
  var swipe = window.swipe = new $.Swipe('#container'),
      scroll = window.scroll = new $.Scroll('#container'),
      mediaQuery = window.matchMedia('(max-width: 50em)');

  function checkMediaQuery(query) {
    if (query.matches && 'touchstart' in window) {
      scroll.deactivate();
      swipe.activate();
    } else {
      swipe.deactivate();
      scroll.activate();
    }
  }

  checkMediaQuery(mediaQuery);
  mediaQuery.addListener(checkMediaQuery);

  $('.previous').on('click', function() {
    swipe.prev();
  });
  $('.next').on('click', function() {
    swipe.next();
  });

  $('.about').on('click touchend', function() {
    $('.overlay').addClass('visible');
  });
  $('.overlay .close').on('click touchend', function() {
    $('.overlay').removeClass('visible');
  });
}());

