/* jshint browser:true */
/* global $:false */
// pin the table of contents
$(window).on('resize scroll', function () {

    var navDiv = $('.nav-secondary');
    var win = $(window);
    var headerBottom = $('[role=banner]').height();
    var top = win.scrollTop();
    var winWidth = win.width();

    if (winWidth > 769) {
        if (top > headerBottom) {
            var left = (winWidth * 0.1) + (winWidth * 0.8 * 0.7);
            var width = winWidth * 0.8 * 0.3;

            navDiv.css({ position: 'fixed', top: 0, left: left, width: width + 'px' });
        } else {
            navDiv.css({ position: 'static', width: '30%' });
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


var ageString = function (then) {

    then = new Date(then);
    var now = new Date();
    var age = Math.round((now.getTime() - then.getTime()) / 60 / 1000); // minutes

    if (age < 60) {
        if (age === 1) {
            return '1 minute ago';
        }

        return age + ' minutes ago';
    }

    age = Math.round(age / 60);

    if (age < 60) {
        if (age === 1) {
            return '1 hour ago';
        }

        return age + ' hours ago';
    }

    age = Math.round(age / 24);
    if (age === 1) {
        return '1 day ago';
    }

    return age + ' days ago';
};

$(function () {
    var nav = $('.api-reference ul').get(0);
    $(nav).appendTo('.nav-secondary nav');
    var links = $(nav).find('a + ul');
    links.prev().addClass('section-closed');
    links.hide();
    $('[role=update]').text(ageString($('[role=update]').text()));

    $('.api-description a').each(function () {
        this.id = this.id.replace(/^user\-content\-/, '');
    });

    // clicked a link
    $('.nav-secondary nav a').click(function (e) {

        var target = $(e.target);
        if (target.is('code')) {
            target = target.parent();
        }

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
        var target = $('.nav-secondary nav a[href=' + window.location.hash + ']');
        expand(target);
        target.addClass('active');
    }
});
