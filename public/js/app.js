/* jshint browser:true */
/* global $:false */
// fixed positioning for table of contents
var toc = $('[role=toc]');
var navDiv = $('.nav-secondary');
var banner = $('[role=banner]');
var win = $(window);

// pin the table of contents
$(window).on('resize scroll', function () {

    var headerBottom = banner.height();
    var top = win.scrollTop();
    var winWidth = win.width();

    if (winWidth > 769) {
        if (top > headerBottom) {
            var left = (winWidth * 0.1) + (winWidth * 0.8 * 0.7);
            var width = winWidth * 0.8 * 0.3;

            navDiv.css({ position: 'fixed', top: 0, left: left, width: width + 'px' });
            toc.css({ width: (width + 15) + 'px' });
        } else {
            navDiv.css({ position: 'static', width: '30%' });
            toc.css({ width: '100%' });
        }
    }
});


// expand a section
var expand = function (target) {

    if (target.hasClass('section-closed') || target.hasClass('section-opened')) {
        target.removeClass('section-closed');
        target.addClass('section-opened');
        target.next('ul').slideDown();
    }

    if (target.closest('ul').length) {
        expand(target.closest('ul').prev('a'));
    }
};


// collapse a section
var collapse = function (target) {
    target.removeClass('section-opened');
    target.addClass('section-closed');

    target.next('ul').slideUp();
};


// clicked a link
$('[role=categories] a').click(function (e) {

    var target = $(e.target);

    if (!target.hasClass('active')) {
        $('.active').removeClass('active');
        target.addClass('active');
    }

    if (target.hasClass('section-closed')) {
        expand(target);
    }
    else if (target.hasClass('section-opened')) {
        collapse(target);
    }
    else {
        expand(target.closest('ul').prev('a'));
    }

    collapse($('.section-opened:not(.active)').filter(function () { return $(this).next('ul').find('.active').length === 0; }));
});

// make sure to expand menu to correct location if they got here with a hash
if (window.location.hash) {
    var target = $('[role=categories] [href=' + window.location.hash + ']');
    expand(target);
    target.addClass('active');
}
