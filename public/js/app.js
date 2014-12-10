/* these methods borrowed from youmightnotneedjquery.com */
var hasClass = function (el, className) {
    if (el.classList) {
        return el.classList.contains(className);
    }
    else {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
};

var addClass = function (el, className) {
    if (el.classList) {
        el.classList.add(className);
    }
    else {
        el.className += ' ' + className;
    }
};

var removeClass = function (el, className) {
    if (el.classList) {
        el.classList.remove(className);
    }
    else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
};

var matches = function(el, selector) {
    if (!el) return false;
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};

// pin the table of contents
var windowHandler = function () {
    var navDiv = document.querySelectorAll('.nav-secondary');
    if (!navDiv.length) {
        return;
    }

    navDiv = navDiv[0];
    var headerBottom = document.querySelectorAll('[role=banner]');
    if (!headerBottom.length) {
        return;
    }

    headerBottom = headerBottom[0].offsetHeight;
    var top = document.body.scrollTop;
    var winWidth = document.body.offsetWidth;

    if (winWidth > 769) {
        if (top > headerBottom) {
            var left = (winWidth * 0.1) + (winWidth * 0.8 * 0.7);
            var width = winWidth * 0.8 * 0.3;

            navDiv.style.position = 'fixed';
            navDiv.style.top = 0;
            navDiv.style.left = left + 'px';
            navDiv.style.width = width + 'px';
        }
        else {
            navDiv.style.position = '';
            navDiv.style.top = '';
            navDiv.style.left = '';
            navDiv.style.width = '';
        }
    }
};

window.addEventListener('scroll', windowHandler);
window.addEventListener('resize', windowHandler);

// expand a section
var expand = function (target) {

    if (hasClass(target, 'section-closed')) {
        removeClass(target, 'section-closed');
        addClass(target, 'section-opened');
        target.nextElementSibling.style.display = '';
    }

    var findParent = function (el, selector) {
        if (matches(el, selector)) {
            return el;
        }

        return findParent(el.parentNode, selector);
    };

    var parent = findParent(target, 'ul');
    if (parent && matches(parent.previousElementSibling, 'a')) {
        expand(parent.previousElementSibling);
    }
};


// collapse a section
var collapse = function (target) {
    removeClass(target, 'section-opened');
    addClass(target, 'section-closed');

    target.nextElementSibling.style.display = 'none';
};


// format a time stamp to a human readable string
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

document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelectorAll('.api-reference ul');
    if (nav.length) {
        // move the first UL to the sidebar
        nav = nav[0];
        var sidebar = document.querySelectorAll('.nav-secondary nav')[0];
        sidebar.appendChild(nav);

        // iterate over the links, make sections have a section-closed class
        // and collapse all the sections by default
        var links = nav.querySelectorAll('a + ul');
        Array.prototype.forEach.call(links, function (link) {

            addClass(link.previousElementSibling, 'section-closed');
            link.style.display = 'none';
        });

        // remove the user-content- prefix from header links
        var headers = document.querySelectorAll('.api-description a');
        Array.prototype.forEach.call(headers, function (header) {
            header.id = header.id.replace(/^user\-content\-/, '');
        });

        // add link click handlers
        var navLinks = document.querySelectorAll('.nav-secondary nav a');
        Array.prototype.forEach.call(navLinks, function (navLink) {
            navLink.addEventListener('click', function (e) {

                // make sure we have the a
                var target = e.target;
                if (matches(target, 'code')) {
                    target = target.parentNode;
                }

                // clear the old 'active' link and set the current one
                if (!hasClass(target, 'active')) {
                    Array.prototype.forEach.call(document.querySelectorAll('.active'), function (old) {
                        removeClass(old, 'active');
                    });

                    addClass(target, 'active');
                }

                if (hasClass(target, 'section-closed')) {
                    expand(target);
                }
                else if (hasClass(target, 'section-opened')) {
                    collapse(target);
                }

                // collapse everything that isn't active and doesn't have an active child
                Array.prototype.forEach.call(document.querySelectorAll('.section-opened:not(.active)'), function (oldLink) {
                    if (oldLink.nextElementSibling.querySelectorAll('.active').length === 0) {
                        collapse(oldLink);
                    }
                });
            });
        });
    }
    else {
        // check for the 'latest update' text, if it exists format it and set the content back
        var update = document.querySelectorAll('[role=update]');
        if (update.length) {
            update = update[0];
            update.textContent = ageString(update.textContent);
        }
    }

    // make sure to expand menu to correct location if they got here with a hash
    if (window.location.hash) {
        var target = document.querySelectorAll('.nav-secondary nav a[href="' + window.location.hash + '"]');
        if (target.length) {
            target = target[0];
            expand(target);
            addClass(target, 'active');
        }
    }
});
