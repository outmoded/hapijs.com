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

// Search engine for the API part
var SearchEngine = function () {

    // Simple DOM walker
    var walkTheDOM = function (node, func) {
        if (func(node)) {
            // If the function returns true, do not walk the children
            return;
        }

        node = node.firstChild;
        while (node) {
            walkTheDOM(node, func);
            node = node.nextSibling;
        }
    };

    /**
     * Crawls the hierarchy looking for the search terms, and eventually hide what doesn't match.
     * It's supposed to leave alone the nodes that do not directly contain the terms but lead to the ones that do,
     * this is essential to know in which part of the documentation your are.
     */
    var crawlToHide = function (terms) {
        var children = this.children;
        var nodes = this.nodes;
        var found = false;
        var nodesToHide = [];

        // Both the following loops won't stop even if a match is found, because we need to be able to hide siblings
        // that don't.

        for (var i = 0, il = children.length; i < il; ++i) {
            if (crawlToHide.call(children[i], terms)) {
                found = true;
            }
            else {
                nodesToHide.push(children[i].tag);
            }
        }

        for (var i = 0, il = nodes.length; i < il; ++i) {
            var allFound = true;
            for (var t = 0, tl = terms.length; t < tl; ++t) {
                allFound &= nodes[i].textContent.toLowerCase().indexOf(terms[t]) !== -1;
            }

            // All the words need to be found for that node to match
            if (allFound) {
                found = true;

                // If something was found directly in that LI, we need to see all the children
                if (this.tag.tagName === 'LI') {
                    var children = this.tag.querySelectorAll('.hidden');
                    for (var i = 0, il = children.length; i < il; ++i) {
                        children[i].classList.remove('hidden');
                    }
                }
            }
            else {
                nodesToHide.push(nodes[i]);
            }
        }

        if (!found) {
            if (this.parent) { // Don't want to hide the root
                this.tag.classList.add('hidden');
            }

            for (var i = 0, il = nodesToHide.length; i < il; ++i) {
                if (!(nodesToHide[i] instanceof Text)) {
                    nodesToHide[i].classList.add('hidden');
                }
            }
        }

        return found;
    };

    var hierarchy; // holds a cache of the hierarchy of the document
    var search = function () {
        var terms = searchText.value.toLowerCase().split(' ');
        var content = document.querySelector('.entry-content');

        // Show all hidden parts prior to hiding them, the performance is good enough without a diff
        var hiddens = content.querySelectorAll('.hidden');
        for (var i = 0, il = hiddens.length; i < il; ++i) {
            hiddens[i].classList.remove('hidden');
        }

        if (!terms.length) {
            return;
        }

        if (!hierarchy) {
            // Nodes outside of the H* that are considered hierarchical and need to be walked
            var hierarchicalNodes = ['UL', 'LI'];

            hierarchy = { tag: content, children: [], nodes: [] };
            var current = hierarchy;

            walkTheDOM(content, function (node) {
                if (node === content) { // Skip root
                    return;
                }

                // We probably just got out of a ul/li, find the correct parent we should be under
                while (node.parentNode !== current.tag && (hierarchicalNodes.indexOf(current.tag.tagName) !== -1)) {
                    current = current.parent;
                }

                if (/^H\d$/.test(node.tagName)) {
                    // Headers are a specific case that need to be compared to give them the good level in the hierarchy

                    if (current.tag.tagName === node.tagName) {
                        current.parent.children.push({ tag: node, parent: current.parent, children: [], nodes: [] });
                        current = current.parent.children[current.parent.children.length - 1];
                    }
                    else {
                        if (/^H\d$/.test(current.tag.tagName) && +current.tag.tagName[1] > +node.tagName[1]) {

                            // That header has a higher level than the current, this means we just ended a section and
                            // are starting a new one.

                            while (current.tag.tagName !== node.tagName) { // Go up until we find our equal in level
                                current = current.parent;
                            }

                            // Then put ourself under the right parent
                            current = current.parent;
                            current.children.push({ tag: node, parent: current, children: [], nodes: [] });
                        }
                        else {
                            // This is a sub-section
                            current.children.push({ tag: node, parent: current, children: [], nodes: [] });
                        }

                        current = current.children[current.children.length - 1];
                    }
                }
                else if (hierarchicalNodes.indexOf(node.tagName) !== -1) {
                    current.children.push({ tag: node, parent: current, children: [], nodes: [] });
                    current = current.children[current.children.length - 1];
                }
                else {
                    current.nodes.push(node);
                    return true; // Stop walking that, this is a normal node, we can consider it a leaf even if it has children.
                }
            });
        }

        crawlToHide.call(hierarchy, terms);
    };

    return search;
};

document.addEventListener('DOMContentLoaded', function () {
    if (typeof searchText !== 'undefined') {
        searchText.onkeyup = SearchEngine();
    }

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
