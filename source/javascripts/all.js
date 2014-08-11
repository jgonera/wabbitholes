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
      .addClass('swipe-container')
      .on('touchstart', $.proxy(this, '_onTouchStart'))
      .on('touchmove', $.proxy(this, '_onTouchMove'))
      .on('touchend', $.proxy(this, '_onTouchEnd'));
    this.$slides = this.$container.children().addClass('swipe-slide');
    this._update();
  }

  Swipe.prototype.next = function() {
    this.currentSlide = this._nextSlide();
    this._update();
  };

  Swipe.prototype.prev = function() {
    this.currentSlide = this._prevSlide();
    this._update();
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
    translate(this.$currentSlide.children(), 0);
    translate(this.$prevSlide.children(), -this.$container.width());
    translate(this.$nextSlide.children(), this.$container.width());

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
      translate(this.$currentSlide.children(), deltaX);
      translate(this.$prevSlide.children(), -this.$container.width() + deltaX);
      translate(this.$nextSlide.children(), this.$container.width() + deltaX);
      this.swiping = true;
      ev.preventDefault();
    }
  };

  Swipe.prototype._onTouchEnd = function(ev) {
    var delta = ev.originalEvent.changedTouches[0].pageX - this.touchStartX
      threshold = this.$container.width() * 0.2;

    this.$prevSlide
      .add(this.$nextSlide)
      .add(this.$currentSlide)
      .removeClass('swipe-touch');

    if (this.swiping && -delta > threshold) {
      this.next();
    } else if (this.swiping && delta > threshold) {
      this.prev();
    } else {
      translate(this.$currentSlide.children(), 0);
      translate(this.$currentSlide.prev().children(), -this.$container.width());
      translate(this.$currentSlide.next().children(), this.$container.width());
    }

    this.swiping = false;
  };

  $.Swipe = Swipe;
}(window.jQuery || window.Zepto));

(function() {
  var swipe = new $.Swipe('#slider');

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

