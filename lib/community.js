'use strict';


const internals = {};


// Knuth Shuffle

internals.shuffle = function (array) {

    let idx = array.length;

    while (idx !== 0) {
        const rand = Math.floor(Math.random() * idx);
        idx -= 1;

        const tempVal = array[idx];
        array[idx] = array[rand];
        array[rand] = tempVal;
    }

    return array;
};

exports.all = {
    'Alphamantis Technologies': {
        url: 'http://alphamantis.com/',
        logo: 'logo-alpha.png',
        width: 150,
        quote: 'hapi allows me to concentrate on the data I need to deliver and how I want it to be delivered. I appreciate all the work that goes into writing good tests and building an extremely flexible plugin ecosystem.',
        person: 'Christian Savard, Software Developer'
    },
    'American Bible Society': {
        url: 'http://www.americanbible.org',
        logo: 'logo-abs.png',
        width: 150,
        quote: 'hapi has been a great foundation for our api project. It provides a very rich interface to build on, and we\'ve enjoyed building with it more than Express.',
        person: 'Mark Bradshaw'
    },
    '&yet': {
        url: 'https://andyet.com',
        logo: 'logo-andyet.png',
        height: 75,
        quote: 'hapi\'s design is pushed by thoughtful experience rather than reactionary or experimental whim, and thus handles the practicalities and scale of production environments flawlessly. Additionally, hapi\'s modular design, which consists of distinct pieces that complement each other, fits with &yet\'s JavaScript philosophy, and brings the flexibility to be the right tool for the job in a wide variety of applications.',
        person: 'Nathan Fritz, Chief Architect'
    },
    'Auth0': {
        url: 'https://auth0.com',
        logo: 'logo-auth0.png',
        width: 150,
        quote: 'hapi\'s clear structure, in particular its plugin system and request lifecycle, makes it easy for us to separate cutting concerns from our API business logic allowing us to add features and fix bugs at a fast pace.',
        person: 'Damian Schenkelman, Engineer'
    },
    'Beats Music': {
        url: 'http://www.beatsmusic.com/',
        logo: 'logo-beats.png',
        height: 75,
        quote: 'With a well-planned interface and selection of patterns, hapi has allowed us to get started on business logic on day one of each new project, knowing that we have a solid, yet extendable code base with great test coverage to build off of.',
        person: 'Johnny Megahan, Senior Engineer'
    },
    'Clarify': {
        url: 'http://clarify.io/',
        logo: 'logo-clarify.png',
        height: 60,
        quote: 'Working with hapi for the last year and a half has been great. Not only is it fast, flexible, and easy to use but the community around it has pushed and grown things in exciting ways. As a result, it has been simple and straightforward to implement good hypermedia support in our API.',
        person: 'Ivo Rothschild, VP Research and Development'
    },
    'CodeWinds': {
        url: 'http://www.codewinds.com/',
        logo: 'logo-codewinds.png',
        height: 75,
        quote: 'hapi has proven to be a rock solid choice for CodeWinds\' REST API and dynamic pages. It\'s intuitive API stays out of the way. All major functionality is built in. I love the plugin architecture for splitting up functionality. Codebase is simple and clean.',
        person: 'Jeff Barczewski, Host'
    },
    'Codio': {
        url: 'https://codio.com/',
        logo: 'logo-codio.png',
        width: 150,
        quote: 'hapi gives us the freedom and ability to quickly develop even complex apis, with deep structural validation. It gives you the right structure to give your code structure even when it spans many files and with many different concerns. Making it possible to build applications the "Node Way", i.e. having many small building blocks to make up the bigger picture.',
        person: 'Friedel Ziegelmayer'
    },
    'Concrete': {
        url: 'http://www.concrete.cc',
        logo: 'logo-concrete.png',
        width: 150,
        quote: 'hapi has allowed us to dramatically accelerate our api design and construction, and now underpins our global collaboration platform. hapi has made our engineers more productive, enthusiastic and engaged within the community.',
        person: 'Andy Clarke'
    },
    'Condé Nast': {
        url: 'http://www.condenast.com/',
        logo: 'logo-conde.png',
        width: 150,
        quote: 'hapi\'s extensive plugin system allows us to quickly build, extend, and compose brand-specific features on top of its rock-solid architecture. It has become our secret weapon for powerful API services.',
        person: 'Paul Fryzel'
    },
    'Convulsic': {
        url: 'https://www.convulsic.com/',
        logo: 'logo-convulsic.png',
        width: 150,
        quote: 'As a musician and relatively new music company, I was faced with the daunting task of learning how to program to provide music lovers with an optimal user experience. hapi provided the avenue to programmatically showcase our products in a simple and comprehensive manner.',
        person: 'Engineering'
    },
    'Creativelive': {
        url: 'http://creativelive.com/',
        logo: 'logo-creativelive.jpg',
        height: 75,
        quote: 'hapi is a well-thought-out framework which is powerful and pleasant to use.',
        person: 'Aaron Elligsen'
    },
    'Cronj IT Technologies Pvt. Ltd.': {
        url: 'http://cronj.com/',
        logo: 'logo-cronj.jpeg',
        height: 75,
        quote: 'hapi gives you the right structure to give your code structure, it makes simple for any developer to understand and debug code, quickly develop even complex apis, with deep structural validation. The beauty of code comes from way routing and controllers are written.',
        person: 'Soni Pandey'
    },
    'D4H Technologies': {
        url: 'http://d4h.org',
        logo: 'logo-d4h.png',
        height: 85,
        quote: 'hapi enabled, and encouraged our first venture into Node by allowing us to quickly produce complex APIs with a comprehensible structure, with input validation, authentication, and documentation made easy. Excellent work by the hapi team, can\'t thank you enough.',
        person: 'John Brett, Lead Engineer'
    },
    'DCIT Corporation': {
        url: 'http://dcit.com/',
        logo: 'logo-dcit.png',
        width: 75,
        quote: 'hapi is rock solid and a pleasure to work with. We have a small team and we find hapi\'s API fosters collaboration really well. Our internal systems were previously written with Java and we were able to completely rewrite and significantly extend them all with hapi in one quarter of the time it took to write them in Java. The hapi API is well thought out and seems to anticipate our needs at every turn. We have begun the process of rewriting a few of our customer facing services with hapi as well. Great job team hapi!',
        person: 'Raffi Minassian, Founder'
    },
    'Digitro Tecnologia': {
        url: 'http://www.digitro.com.br/en/index.php',
        logo: 'logo-digitro.png',
        width: 150,
        quote: 'hapi transforms our way to write high scalability API services. We’re now able to develop about 50% faster and secure the I/O through payload validations. The plugin feature is a great tool to provide independent modules for personalized solutions.',
        person: 'Jose Cardozo, Senior Engineer R&D Dept.'
    },
    'Disney': {
        url: 'http://www.disney.com/',
        logo: 'logo-disney.png',
        width: 150,
        quote: 'hapi is simple to use yet robust with configuration-based functionality. The coding part of our API was so easy, I had time to complete 100% test coverage (with Lab) and schema validation (with Joi). I couldn\'t have gotten this API pushed to production on such a short timeline without hapi!',
        person: 'Adam Eivy, Solutions Engineering Architect'
    },
    'Feedient': {
        url: 'https://feedient.com/',
        logo: 'logo-feedient.png',
        width: 150,
        quote: 'By using hapi we were able to easily let our code evolve with our company and use existing features without re-inventing the wheel.',
        person: 'Xavier Geerinck, Founder'
    },
    'Filmin': {
        url: 'https://www.filmin.es',
        logo: 'logo-filmin.png',
        width: 150,
        quote: 'We started using hapi for a simple task of our platform. We loved how easy it was to set up the service so we rewrote the entire Smart TVs API from PHP to NodeJS. It was fun, fast and easy to get started.',
        person: 'Gerard Nesta'
    },
    'Founders & Coders': {
        url: 'http://foundersandcoders.org/',
        logo: 'logo-foundersandcoders.png',
        width: 150,
        quote: 'We love the thought that has gone into hapi and the support from the community. We think it is a great starting point for understanding real-world web applications and it is now the default framework that our students learn.',
        person: 'Dan Sofer, Founder'
    },
    'Free People': {
        url:'https://www.freepeople.com/',
        logo: 'logo-freepeople.png',
        width: 150,
        quote: 'We needed a scalable, battle-tested framework to create an orchestration layer between our API services and front-end templates. The plugins architecture allowed us to quickly develop routes, create re-usable components, and better organize our codebase. We had tried Express and Sails, but hapi proved to be the best.',
        person: 'Christian Lohr, Manager of Development'
    },
    'Future Studio': {
        url: 'https://futurestud.io/',
        logo: 'logo-futurestudio.png',
        width: 150,
        quote: 'We use hapi to build our Future Studio platform. When touching it for the first time, we immediately fall in love with the framework. The API is great. The community and its ecosystem are superb. We as developers love the framework’s progress and are happy to build more awesome stuff with hapi as we grow.',
        person: 'Marcus Poehls'
    },
    'Get Human': {
        url: 'http://gethuman.com/',
        logo: 'logo-gethuman.png',
        width: 150,
        quote: 'We are in the process of moving our Express website and API projects to hapi as well as doing a very large migration of our main website to hapi. I have really enjoyed using hapi. You can tell that a lot of thought went into what features went into the framework and what was left out. In general I value flexibility and hapi has done a great job of not getting in my way while at the same time providing the support for logging, error handling, configuration, etc. when I need it.',
        person: 'Jeff Whelpley, Chief Architect'
    },
    'GOV.UK': {
        url: 'https://gov.uk',
        logo: 'logo-gov.uk.png',
        width: 75,
        quote: 'hapi\'s configuration centric approach and simple but powerful request model has meant that productivity, quality and satisfaction have vastly improved. We are able to focus our attention to business logic and the code we produce is far more approachable and reasonable. For enterprise level nodejs applications, look no further than hapi.',
        person: 'David James Stone'
    },
    'Hoodie': {
        url: 'http://hood.ie/',
        logo: 'logo-hoodie.png',
        width: 150,
        quote: '@svnlto switched us from Express to hapi and with that one change, our server code became manageable and self-describing. It has been a boon to the productivity we’ve had at Hoodie and we have not encountered any production issues since 2.0.',
        person: 'Jan Lehnardt, Initiator'
    },
    'HotelQuickly': {
        url: 'http://www.hotelquickly.com/',
        logo: 'logo-hotelquickly.png',
        width: 150,
        quote: 'We\'re using hapi.js for a few months for our node.js projects that power parts of our Backend and also mobile app APIs. It\'s so far the best node.js frameworks we\'ve used!',
        person: 'Michal Juhas, Co-founder and CTO'
    },
    'Ideapod': {
        url: 'http://www.ideapod.com/',
        logo: 'logo-ideapod.png',
        height: 75,
        quote: 'We tried Joomla, Django, Rails. Node + hapi is better.',
        person: 'Richard Littauer'
    },
    'Jibo, Inc': {
        url: 'http://www.myjibo.com',
        logo: 'logo-jibo.png',
        width: 150,
        quote: 'I decided to evaluate hapi after reading about it and seeing the corporate logos of the other users. We are expecting Jibo to be a massive success and want to build a system that will scale quickly. I\'ve used Express and Restify in prior projects. At the beginning of each new project I research what is available and select the best product.',
        person: 'Rich Sadowsky, Chief Architect Cloud'
    },
    'JJ Foodservice Ltd': {
        url: 'https://www.jjfoodservice.com/',
        logo: 'logo-jjfoodserviceltd.png',
        width: 150,
        quote: 'Hapi is elegant and a joy to work with. It allows us for focus on the real issues and tasks without being loaded down with baggage, Without Hapi we would have not been able to deliver the scalability that will future-proof our application for the foreseeable future.',
        person: 'Jason Lane'
    },
    'Liaison Technologies': {
        url: 'https://www.liaison.com/',
        logo: 'logo-liaison.png',
        width: 150,
        quote: 'Hapi is integral to our Alloy data management and integration platform. What used to take months in an enterprise-heavy architecture is cut down to weeks, sometimes just hours, and future-proof to meet the demands of our customers.',
        person: 'Jonny Hawley, Manager of Web Engineering'
    },
    'Lob': {
        url: 'https://www.lob.com/',
        logo: 'logo-lob.png',
        width: 150,
        quote: 'Choosing hapi has been the best technical decision we have made. Being an API-centric company, the decisions made within the hapi framework make development easier and help us to create high quality code.',
        person: 'Peter Nagel, Developer'
    },
    'Macy\'s': {
        url: 'http://www.macys.com/',
        logo: 'logo-macys.svg',
        width: 150,
        quote: 'Starting with vanilla Node.js we wanted to refactor our proxy server to be easier to use, understand, expand and maintain. My colleague and I created a rating system based on our criteria and evaluated several Node frameworks, including but not limited to Kraken.js, Express, restify, Rendr, Sails.js and of course hapi. Using Express meant bringing in a lot of third party middleware which would have required research and time. All the others were geared towards creating a RESTful backend from scratch which we weren\'t doing. hapi ended up rating the highest in our view. Just a couple days later we had dramatically reduced our lines of code and could move much quicker creating new routes and functionality.',
        person: 'Tyler Briles, JavaScript Engineer'
    },
    'Mallzee': {
        url: 'http://www.mallzee.com/',
        logo: 'logo-mallzee.png',
        height: 75,
        quote: 'After using other frameworks and having to bolt on 10s of plugins to achieve mediocre functionality, hapi has completely simplified our development process. Using the other Spumko modules, validation, authentication, documentation and testing are all beautifully easy to set up. Mallzee <3\'s hapi!',
        person: 'Ro Ramtohul'
    },
    'microapps': {
        url: 'http://microapps.com/',
        logo: 'logo-microapps.svg',
        width: 150,
        height: 75,
        quote: 'hapi is a simple yet powerful framework which goes out of your way.',
        person: 'Alexandre Saiz'
    },
    'Mobicow': {
        url: 'http://www.mobicow.com/',
        logo: 'logo-mobicow.png',
        height: 75,
        quote: 'Since our company is growing daily and the market we are in is constantly evolving it will be time to put our "old, reliable, inflexible" code to rest! We looked at most of the frameworks in node and we\'re not \'hapi\' with any of them.  After a long review of hapi\'s code and development it was an easy choice to make.',
        person: 'William Gray, CTO'
    },
    'Modulus': {
        url: 'https://modulus.io/',
        logo: 'logo-modulus.png',
        width: 150,
        quote: 'hapi\'s configuration-centric approach lends itself to writing testable and maintainable applications that scale effortlessly, which our customers certainly appreciate. We\'re also big fans of the well-thought out security layer - a welcome change from other frameworks we\'ve used in the past.',
        person: 'Matt Hernandez, Senior Manager of Engineering'
    },
    'Moving Worlds': {
        url: 'https://movingworlds.org',
        logo: 'logo-movingworlds.png',
        height: 75,
        quote: 'hapi, with its configuration-centric approach, integrated authentication, easy to use and powerful validations, and intelligent API design, allowed us to launch publicly much faster than anticipated. Maintenance/upgrades have also been a breeze, I would highly recommend hapi to anyone starting out or looking to switch web frameworks.',
        person: 'Farrin A. Reid, Director of Engineering'
    },
    'Mozilla': {
        url: 'http://www.mozilla.com/',
        logo: 'logo-mozilla.png',
        width: 150,
        quote: 'hapi has all the latest security and robustness features built in that production sites need. We love using, supporting, and creating open source software that benefits the entire community and we appreciate the enormous effort and dedication of the hapi team.',
        person: 'Danny Coates'
    },
    'Muzzley': {
        url: 'http://www.muzzley.com/',
        logo: 'logo-muzzley.svg',
        width: 150,
        quote: 'hapi allowed us to quickly build from the ground-up a robust and test-proof API for our Mobile app. Alongside other related and must-have Spumko modules, it made our development process insanely productive and a true "joi".',
        person: 'Rui Quelhas'
    },
    'Night Zookeeper': {
        url: 'http://www.nightzookeeper.com/',
        logo: 'logo-zoo.svg',
        height: 75,
        quote: 'hapi is the best decision I\'ve made as a CTO. The integrated authentication and its configuration over convention approach makes the code easy to understand, organise, modify and most importantly test. We switched from Express before going to production and never looked back!',
        person: 'Mathieu Triay, CTO'
    },
    'Node Security Project': {
        url: 'https://nodesecurity.io',
        logo: 'logo-nsp.png',
        height: 75,
        quote: 'The hapi framework embraces a strong security culture at it’s core. They understand that security is a process and are quick to improve if they can and create trust and transparency by self disclosing vulnerabilities in the project to the community. We use hapi for the node security project services not only because of these core values but because the actions that back these values up.',
        person: 'Adam Baldwin, Founder'
    },
    'npm, Inc.': {
        url: 'http://www.npmjs.org/',
        logo: 'logo-npm.png',
        width: 150,
        quote: 'We wanted a security-conscious, production-tested framework, and hapi delivered. It works in a really "node-y" way, and we like that.',
        person: 'Laurie Voss, Co-founder and CTO'
    },
    'Octovis': {
        url: 'http://www.octovis.com/',
        logo: 'logo-octovis.png',
        width: 150,
        quote: 'The flexibility and simplicity inherent in hapi\’s approach has both sped up our development cycle and eliminated all those wasted hours that we used to spend fighting against the decisions made for us by other frameworks. hapi\’s ecosystem of plugins provides us with myriad tools and configuration options to quickly get a solid and scalable infrastructure up and running that fits our unique business needs.',
        person: 'Jay Politzer'
    },
    'Open Table': {
        url: 'http://www.opentable.com/',
        logo: 'logo-opentable.png',
        width: 150,
        quote: 'Quite simply, hapi rocks! hapi gets things right: the right features, in the right places, with the right level of integration. It allows awesome friction-free development, with great extensibility and community support.',
        person: 'Andy Royle, Developer'
    },
    'PARSEC': {
        url: 'http://parsec.media',
        logo: 'logo-parsec.png',
        width: 150,
        quote: 'The simplicity and power of Hapi has enabled our team to build production-quality services quickly, focusing on what our users want rather than worrying about how we\'re going to build them.',
        person: 'Todd Medema, CTO'
    },
    'PayPal': {
        url: 'http://www.paypal.com/',
        logo: 'logo-paypal.png',
        width: 150,
        quote: 'hapi is the solid foundation powering our open source npm proxy that has served millions of requests without issue. With a solid plugin architecture, hapi has proven the ideal choice for some of our frequently changing internal tools.',
        person: 'Jean-Charles Sisk, Engineering Architect'
    },
    'Pebble{code}': {
        url: 'http://pebblecode.com',
        logo: 'logo-pebblecode.png',
        width: 150,
        quote: 'hapi has allowed us to build strategic solutions for some of our largest clients; from lightweight single-sign on portals, to fast middleware services that allow us to interact with large databases with ease. Using hapi best practices our codebase is light and easy to maintain on a daily basis.',
        person: 'Tane Piper'
    },
    'Percolate': {
        url: 'http://percolate.com/',
        logo: 'logo-percolate.png',
        width: 150,
        quote: 'I\'m an engineer at Percolate. We\'re running hapi as a frontend for the service that powers our image editor. It\'s been in production for about six months now. So far, so good and plans to use for some upcoming projects. The API has been a real crowd-pleaser here.',
        person: 'Christopher Cliff, Developer'
    },
    'Piksel': {
        url: 'http://piksel.com/',
        logo: 'logo-piksel.svg',
        width: 150,
        quote: 'Hapi has enabled us to build a scalable micro-services component oriented architecture to support our varied products and clients. Building on it\'s solid architecture enables us to get new services and features to market efficiently and in keeping with our agile approach.',
        person: 'Dan Ledgard, Technical Architect'
    },
    'Revolt': {
        url: 'http://revolt.tv/',
        logo: 'logo-revolt.jpg',
        width: 150,
        quote: 'hapi allows us to quickly produce APIs with minimal boilerplate. The configuration based architecture makes setting up authentication, input validation, and routing dead simple. hapi just feels like the right way to do APIs.',
        person: 'Peter Henning, Developer'
    },
    'Seen Digital Media, Inc.': {
        url: 'http://seenmoment.com/',
        logo: 'logo-seen.png',
        width: 150,
        quote: 'hapi’s flexibly and extensibility have allowed us to quickly build out our platform on a solid, clean code-base.',
        person: 'Brad Walker, Developer'
    },
    'Starcount': {
        url: 'http://starcount.com/',
        logo: 'logo-starcount.png',
        width: 150,
        quote: 'We evaluated express.js and restify, after past experience with both, and then discovered hapi in February 2013, not long after it was released to the world. We jumped on board and it was one of the best technical decisions we made.',
        person: 'Johnny Hall, Developer'
    },
    'Tagboard': {
        url: 'http://tagboard.com/',
        logo: 'logo-tagboard.svg',
        width: 150,
        quote: 'hapi has been a solid, extensible, test and performance friendly server framework that’s continually evolving and improving. It allows us to build and maintain secure and stable services quickly that scale quite well. I never thought I’d say this but, thanks Walmart!',
        person: 'Nathan Heskew, Developer'
    },
    'Teramine': {
        url: 'http://teramine.io',
        logo: 'logo-teramine.png',
        width: 150,
        quote: 'Coming from an Erlang thinking, was looking for a fast, reliable and robust framework, that also would be accessible by normal programmers (only 1% of programmers write in Erlang, it\'s for sure an anomaly). Looking and testing more than 30 frameworks, we noticed that everything was built in Express, a cool framework for websites, but not built from scratch to be a "java beans" killer, I mean, an enterprise framework. So I found myself comparing hapi against all the others, and in fact, taking all the others frameworks on one hand, they will not be able to reach what hapi reaches, since it was built from the ground up for the enterprise development.',
        person: 'Henry Hazan, CEO'
    },
    'Walmart': {
        url: 'http://www.walmart.com/',
        logo: 'logo-walmart.svg',
        width: 150,
        quote: 'When we were building orchestration services in node we needed to the ability to have trusted scalability and simplicity to handle the Black Friday load. hapi gave us just that, and it held through the test of the holiday period at Walmart.',
        person: 'Dion Almaer, Vice President of Mobile Engineering'
    },
    'Worldline': {
        url: 'http://worldline.com/en-us/home.html',
        logo: 'logo-worldline.png',
        width: 150,
        quote: 'hapi made us vastly more productive by offering out-of-the-box features we always use in our services, and it allowed us to collaborate more efficiently between teams through its plugin interface.',
        person: 'Nicolas Morel, Developer'
    },
    'Yahoo': {
        url: 'http://www.yahoo.com/',
        logo: 'logo-yahoo.png',
        width: 150,
        quote: 'hapi\'s configuration-centric approach allows our engineers to quickly build web applications that are easy to work with as we scale.',
        person: 'Reid Burke, Senior Engineer'
    },
    'YLD!': {
        url: 'http://www.yld.io/',
        logo: 'logo-yld.png',
        width: 150,
        quote: 'Using hapi helps YLD! to quickly create production-ready APIs by allowing us to focus on delivering business value to our customers. It solidifies a collection of good practices and standards, effectively allowing us to improve communication within and across teams.',
        person: 'Pedro Teixeira, Partner and CTO'
    }
};


exports.methods = [];


exports.methods.push({
    name: 'community.frontPage',
    method: function (callback) {

        const companies = internals.shuffle(
            Object.keys(exports.all)
                .filter((company) => exports.all[company].logo)
                .map((company) => exports.all[company]))
            .slice(0, 12);

        return callback(null, companies);
    }
});
