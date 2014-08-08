//= require_tree .

;(function($) {
  function Swipe(el) {
    var $el = $(el).addClass('swipe-container');

    this.currentSlide = 0;
    this.$slides = $el.children().addClass('swipe-slide');
    this.$slides.eq(this.currentSlide).addClass('swipe-active');
  }

  Swipe.prototype.next = function() {
    ++this.currentSlide;
    this.$slides.removeClass('swipe-active');
    this.$slides.eq(this.currentSlide).addClass('swipe-active');
  };

  Swipe.prototype.prev = function() {
    --this.currentSlide;
    this.$slides.removeClass('swipe-active');
    this.$slides.eq(this.currentSlide).addClass('swipe-active');
  };

  $.Swipe = Swipe;
}(jQuery || Zepto));

var swipe = new $.Swipe('#slider');

$('.previous').on('click', function() {
  swipe.prev();
});
$('.next').on('click', function() {
  swipe.next();
});
