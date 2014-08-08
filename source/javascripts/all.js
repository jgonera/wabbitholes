//= require_tree .

;(function($) {
  function Swipe(el) {
    var $el = $(el).addClass('swipe-container');

    this.currentSlide = 0;
    this.$slides = $el.children().addClass('swipe-slide');
    this._update();
  }

  Swipe.prototype.next = function() {
    ++this.currentSlide;
    this._update();
  };

  Swipe.prototype.prev = function() {
    --this.currentSlide;
    this._update();
  };

  Swipe.prototype._update = function() {
    this.$slides
      .removeClass('swipe-active')
      .eq(this.currentSlide).addClass('swipe-active');
  };

  $.Swipe = Swipe;
}(window.jQuery || window.Zepto));

var swipe = new $.Swipe('#slider');

$('.previous').on('click', function() {
  swipe.prev();
});
$('.next').on('click', function() {
  swipe.next();
});
