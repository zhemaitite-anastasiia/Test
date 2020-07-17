var Nanobar = (function () {

    'use strict';
    var addCss, Bar, Nanobar, move, place, init,
      // container styles
      cssCont = {
        width: '100%',
        height: '2px',
        zIndex: 9999,
        top : '0'
      },
      // bar styles
      cssBar = {
        width:0,
        height: '100%',
        clear: 'both',
        transition: 'height .3s'
      };
  
  
    // add `css` to `el` element
    addCss = function (el, css ) {
      var i;
      for (i in css) {
        el.style[i] = css[i];
      }
      el.style.float = 'left';
    };
  
    // animation loop
    move = function () {
      var self = this,
        dist = this.width - this.here;
  
      if (dist < 0.1 && dist > -0.1) {
        place.call( this, this.here );
        this.moving = false;
        if (this.width == 100) {
          this.el.style.height = 0;
          setTimeout( function () {
            self.cont.el.removeChild( self.el );
          }, 300);
        }
      } else {
        place.call( this, this.width - (dist/4) );
        setTimeout( function () {
          self.go();
        }, 16);
      }
    };
  
    // set bar width
    place = function (num) {
      this.width = num;
      this.el.style.width = this.width + '%';
    };
  
    // create and insert bar in DOM and this.bars array
    init = function () {
      var bar = new Bar( this );
      this.bars.unshift( bar );
    };
  
    Bar = function ( cont ) {
      // create progress element
      this.el = document.createElement( 'div' );
      this.el.style.backgroundColor = cont.opts.bg;
      this.width = 0;
      this.here = 0;
      this.moving = false;
      this.cont = cont;
      addCss( this.el, cssBar);
      cont.el.appendChild( this.el );
    };
  
    Bar.prototype.go = function (num) {
      if (num) {
        this.here = num;
        if (!this.moving) {
          this.moving = true;
          move.call( this );
        }
      } else if (this.moving) {
        move.call( this );
      }
    };
  
  
    Nanobar = function (opt) {
  
      var opts = this.opts = opt || {},
        el;
  
      // set options
      opts.bg = opts.bg || '#000';
      this.bars = [];
  
  
      // create bar container
      el = this.el = document.createElement( 'div' );
      // append style
      addCss( this.el, cssCont);
      if (opts.id) {
        el.id = opts.id;
      }
      // set CSS position
      el.style.position = !opts.target ? 'fixed' : 'relative';
  
      // insert container
      if (!opts.target) {
        document.getElementsByTagName( 'body' )[0].appendChild( el );
      } else {
        opts.target.insertBefore( el, opts.target.firstChild);
      }
  
      init.call( this );
    };
  
  
    Nanobar.prototype.go = function (p) {
      // expand bar
      this.bars[0].go( p );
  
      // create new bar at progress end
      if (p == 100) {
        init.call( this );
      }
    };
  
    return Nanobar;
  })();
  
  
  (function($) {
    var nanobar = new Nanobar( {
      bg: '#000',
      id: 'mynano'
    });
  
    var $themesOptions = '';
    var trackedName = "";
  
  
    /**
     * Determine the mobile operating system.
     * This function either returns 'iOS', 'Android' or 'unknown'
     *
     * @returns {String}
     */
    function getMobileOperatingSystem() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
      if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) ) {
        return 'iOS';
      }
      else if( userAgent.match( /Android/i ) ) {
        return 'Android';
      }
      else {
        return 'unknown';
      }
    }
  
  
    /**
    * Create AJAX request to get All Links
    **/
    function getTheme(themeName, option) {
  
      themeName = themeName || false;
      option = option || false;
  
      var themeIsAvailable = theme !== null && theme != 'null';
  
        if (themeIsAvailable) {
          var themeData = jQuery('.theme-data').html();
          var theme = $.parseJSON(themeData);
          prepareTheme(theme);
  
        } else {
          console.error('Incorect Theme Name');
        }
    }
  
    /**
    * Parse URL to get paramsObj with Theme Name
    **/
    function parseURL(url) {
      var parser = document.createElement('a'),
          searchObject = {},
          queries, split, i;
  
      // Let the browser do the work
      parser.href = url;
  
      // Convert query string to object
      queries = parser.search.replace(/^\?/, '').split('&');
  
      for( i = 0; i < queries.length; i++ ) {
          split = queries[i].split('=');
          searchObject[split[0]] = split[1];
      }
  
      return {
          params: parser.search,
          paramsObj: searchObject,
          hash: parser.hash
      };
    }
  
    /**
    * Prepare Theme to render
    **/
    function prepareTheme(theme) {
  
      var themeIsMultiversion = theme.version_type == 'multiversion';
  
      if (themeIsMultiversion) {
        renderThemeOptions(theme.site_links);
  
        if(currentOption) {
          for (var i = 0; i < theme.site_links.length; i++) {
            if(theme.site_links[i].name == currentOption) {
              theme.site_link = theme.site_links[i].link;
              break;
  
            } else {
              theme.site_link = theme.site_links[0].link;
            }
          }
        } else {
          theme.site_link = theme.site_links[0].link;
        }
      }
  
      trackedName = theme.title;
  
      if (getMobileOperatingSystem() != 'unknown' ) {
        document.location.href = theme.site_link;
      }
  
      renderTheme(theme.site_link, theme.title);
  
      $('header #logo').attr('href', 'https://themestash.com/products/' + trackedName);
      $('.theme-nav a.more').attr('href', theme.site_shop_link.replace('&amp;', '&'));
      $('.theme-nav a.more').attr('data-theme', theme.title);
      $('.theme-name').text(theme.title);
      $('.theme-desc').text(theme.desc);
    }
  
    /**
    * Render theme Option Select checkbox
    **/
    function renderTheme(link, title) {
      var $iFrame = $('#demo'),
          $layout = $('.layout');
  
      var currentTitle = $('title').html();
  
      var nanobarPos = 0;
  
      var nanobarInterval = setInterval(function() {
  
          if (nanobarPos != 90) {
            nanobarPos = nanobarPos + 0.4;
            nanobar.go(nanobarPos);
          }
  
      }, 10);
  
      // Chage page title on title with Theme Name
      $('title').html(currentTitle + ' -> ' + title);
  
      var iflayoutIsActive = $layout.hasClass('active');
  
      if (iflayoutIsActive) {
        $layout.removeClass('active');
      }
  
      // Load Iframe
      $iFrame.attr('src', link);
  
      $('a.close-btn').attr('href', link);
  
      $iFrame.load(function() {
  
        $layout.addClass('active');
  
        clearTimeout(nanobarInterval);
        nanobar.go( 100 );
  
        var themeNavIsActive = $('.navigation').hasClass('active');
  
        if (! themeNavIsActive) {
          $('.navigation').addClass('active');
        }
      });
    }
  
    /**
    * Render theme Option Select checkbox
    **/
    function renderThemeOptions(links) {
      var thereIsNoActiveOptions = true;
  
      for (var i = 0; i < links.length; i++) {
  
        var $option = $('<a>');
  
        $option.attr('href', links[i].link)
               .attr('data-number', i + 1)
               .attr('data-name', links[i].name)
               .attr('data-color', links[i].style_kit_color)
               .attr('style','--var-color:'+links[i].style_kit_color)
               .html(links[i].name)
               .addClass('option');
  
        if (currentOption) {
          if (currentOption == links[i].name) {
            $option.addClass('active');
  
            thereIsNoActiveOptions = false;
          }
        } else if (i === 0) {
  
          $option.addClass('active');
  
          thereIsNoActiveOptions = false;
        }
  
        $themesOptions.append($option);
      }
  
      if (thereIsNoActiveOptions) {
        $themesOptions.find('.option:first-child').addClass('active');
      }
  
      $themesOptions.find('.option').click(function(event) {
        event.preventDefault();
  
        var thisOptionIsActive = $(this).hasClass('active');
  
        if (! thisOptionIsActive) {
  
          $themesOptions.find('.active').removeClass('active');
  
          $(this).addClass('active');
  
          var themeLink = $(this).attr('href');
          var themeName = $(this).html();
  
          window.location.hash = themeName;
  
          // ga('send', 'event', currentTheme, 'Demo Switch', currentTheme + ' - ' +themeName );
  
          renderTheme(themeLink, themeName);
        }
      });
  
      jQuery('.thm-lst a').click(function(event) {
        event.preventDefault();
  
        var thisOptionIsActive = $(this).hasClass('active');
  
        if (! thisOptionIsActive) {
  
          $themesOptions.find('.active').removeClass('active');
  
          $(this).addClass('active');
  
          var themeLink = $(this).attr('href');
          var themeName = $(this).attr('data-name');
  
          window.location = window.location.origin + window.location.pathname + '?theme='+ themeName.toLowerCase();
  
          // ga('send', 'event', themeName, 'Theme Switch', currentTheme + ' - ' + themeName );
  
          renderTheme(themeLink, themeName);
        }
      });
  
      $(document).mouseup(function(e)
      {
          var container = $('.thm-lst');
  
          // if the target of the click isn't the container nor a descendant of the container
          if (!container.is(e.target) && container.has(e.target).length === 0)
          {
              container.hide();
          }
      });
    }
  
    function reloadIframe() {
      var iframe = document.getElementById('demo');
      iframe.src = iframe.src;
    }
  
  
  
    var currentUrl = parseURL(window.location.href);
  
    var currentTheme = currentUrl.paramsObj.theme || false;
  
    var currentOption  = currentUrl.hash || false;
  
    if(currentOption) {
      currentOption = currentOption.replace('#', '');
    } else {
      currentOption = 'Overview';
    }
  
  
   $(document).ready(function() {
  
     $('#logo').on('click', function(){
       // ga('send', 'event', currentTheme, 'Back to TouchSize', 'From ' + currentTheme + ' - ' + currentOption );
     });
     $('.btn.more').on('click', function(){
       // ga('send', 'event', currentTheme, 'Buy Now', currentTheme + ' - ' + currentOption );
     });
  
     $('.theme-dts').on('click', function(){
       jQuery(this).find('.thm-lst').toggle();
     });
  
      $themesOptions = $('.theme-nav .options');
  
      getTheme(currentTheme, currentOption);
  
      $('.screen-select').each(function() {
        var screenOption = $(this).data('screen');
  
        $(this).click(function() {
  
          // ga('send', 'event', currentTheme, 'Device Resize', 'Switched to ' + screenOption);
  
          reloadIframe();
  
          $('.screen-selecter').find('.active').removeClass('active');
  
          $(this).addClass('active');
  
          $('.layout').attr('data-screen', screenOption);
        });
      });
  
  
    });
  
  })(jQuery);
  
  
