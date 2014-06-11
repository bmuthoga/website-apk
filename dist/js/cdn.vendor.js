/* 
 * An Angular service which helps with creating recursive directives.
 * @author Mark Lagendijk
 * @license MIT
 */
angular.module('RecursionHelper', []).factory('RecursionHelper', ['$compile', function($compile){
	return {
		/**
		 * Manually compiles the element, fixing the recursion loop.
		 * @param element
		 * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
		 * @returns An object containing the linking functions.
		 */
		compile: function(element, link){
			// Normalize the link parameter
			if(angular.isFunction(link)){
				link = { post: link };
			}

			// Break the recursion loop by removing the contents
			var contents = element.contents().remove();
			var compiledContents;
			return {
				pre: (link && link.pre) ? link.pre : null,
				/**
				 * Compiles and re-adds the contents
				 */
				post: function(scope, element){
					// Compile the contents
					if(!compiledContents){
						compiledContents = $compile(contents);
					}
					// Re-add the compiled contents to the element
					compiledContents(scope, function(clone){
						element.append(clone);
					});

					// Call the post-linking function, if any
					if(link && link.post){
						link.post.apply(null, arguments);
					}
				}
			};
		}
	};
}]);
/**
 * @license AngularJS v1.2.16
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

var $sanitizeMinErr = angular.$$minErr('$sanitize');

/**
 * @ngdoc module
 * @name ngSanitize
 * @description
 *
 * # ngSanitize
 *
 * The `ngSanitize` module provides functionality to sanitize HTML.
 *
 *
 * <div doc-module-components="ngSanitize"></div>
 *
 * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
 */

/*
 * HTML Parser By Misko Hevery (misko@hevery.com)
 * based on:  HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 */


/**
 * @ngdoc service
 * @name $sanitize
 * @function
 *
 * @description
 *   The input is sanitized by parsing the html into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string, however, since our parser is more strict than a typical browser
 *   parser, it's possible that some obscure input, which would be recognized as valid HTML by a
 *   browser, won't make it through the sanitizer.
 *   The whitelist is configured using the functions `aHrefSanitizationWhitelist` and
 *   `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider `$compileProvider`}.
 *
 * @param {string} html Html input.
 * @returns {string} Sanitized html.
 *
 * @example
   <example module="ngSanitize" deps="angular-sanitize.js">
   <file name="index.html">
     <script>
       function Ctrl($scope, $sce) {
         $scope.snippet =
           '<p style="color:blue">an html\n' +
           '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
           'snippet</p>';
         $scope.deliberatelyTrustDangerousSnippet = function() {
           return $sce.trustAsHtml($scope.snippet);
         };
       }
     </script>
     <div ng-controller="Ctrl">
        Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Directive</td>
           <td>How</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="bind-html-with-sanitize">
           <td>ng-bind-html</td>
           <td>Automatically uses $sanitize</td>
           <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind-html="snippet"></div></td>
         </tr>
         <tr id="bind-html-with-trust">
           <td>ng-bind-html</td>
           <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
           <td>
           <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
&lt;/div&gt;</pre>
           </td>
           <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
         </tr>
         <tr id="bind-default">
           <td>ng-bind</td>
           <td>Automatically escapes</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
       </div>
   </file>
   <file name="protractor.js" type="protractor">
     it('should sanitize the html snippet by default', function() {
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
     });

     it('should inline raw snippet if bound to a trusted value', function() {
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).
         toBe("<p style=\"color:blue\">an html\n" +
              "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
              "snippet</p>");
     });

     it('should escape snippet without any filter', function() {
       expect(element(by.css('#bind-default div')).getInnerHtml()).
         toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
              "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
              "snippet&lt;/p&gt;");
     });

     it('should update', function() {
       element(by.model('snippet')).clear();
       element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('new <b>text</b>');
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).toBe(
         'new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-default div')).getInnerHtml()).toBe(
         "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
     });
   </file>
   </example>
 */
function $SanitizeProvider() {
  this.$get = ['$$sanitizeUri', function($$sanitizeUri) {
    return function(html) {
      var buf = [];
      htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
        return !/^unsafe/.test($$sanitizeUri(uri, isImage));
      }));
      return buf.join('');
    };
  }];
}

function sanitizeText(chars) {
  var buf = [];
  var writer = htmlSanitizeWriter(buf, angular.noop);
  writer.chars(chars);
  return buf.join('');
}


// Regular Expressions for parsing tags and attributes
var START_TAG_REGEXP =
       /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
  END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/,
  ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
  BEGIN_TAG_REGEXP = /^</,
  BEGING_END_TAGE_REGEXP = /^<\s*\//,
  COMMENT_REGEXP = /<!--(.*?)-->/g,
  DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i,
  CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g,
  // Match everything outside of normal chars and " (quote character)
  NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;


// Good source of info about elements and attributes
// http://dev.w3.org/html5/spec/Overview.html#semantics
// http://simon.html5.org/html-elements

// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
var voidElements = makeMap("area,br,col,hr,img,wbr");

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
var optionalEndTagBlockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
    optionalEndTagInlineElements = makeMap("rp,rt"),
    optionalEndTagElements = angular.extend({},
                                            optionalEndTagInlineElements,
                                            optionalEndTagBlockElements);

// Safe Block Elements - HTML5
var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap("address,article," +
        "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
        "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul"));

// Inline Elements - HTML5
var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap("a,abbr,acronym,b," +
        "bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s," +
        "samp,small,span,strike,strong,sub,sup,time,tt,u,var"));


// Special Elements (can contain anything)
var specialElements = makeMap("script,style");

var validElements = angular.extend({},
                                   voidElements,
                                   blockElements,
                                   inlineElements,
                                   optionalEndTagElements);

//Attributes that have href and hence need to be sanitized
var uriAttrs = makeMap("background,cite,href,longdesc,src,usemap");
var validAttrs = angular.extend({}, uriAttrs, makeMap(
    'abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,'+
    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,'+
    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,'+
    'scope,scrolling,shape,size,span,start,summary,target,title,type,'+
    'valign,value,vspace,width'));

function makeMap(str) {
  var obj = {}, items = str.split(','), i;
  for (i = 0; i < items.length; i++) obj[items[i]] = true;
  return obj;
}


/**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
function htmlParser( html, handler ) {
  var index, chars, match, stack = [], last = html;
  stack.last = function() { return stack[ stack.length - 1 ]; };

  while ( html ) {
    chars = true;

    // Make sure we're not in a script or style element
    if ( !stack.last() || !specialElements[ stack.last() ] ) {

      // Comment
      if ( html.indexOf("<!--") === 0 ) {
        // comments containing -- are not allowed unless they terminate the comment
        index = html.indexOf("--", 4);

        if ( index >= 0 && html.lastIndexOf("-->", index) === index) {
          if (handler.comment) handler.comment( html.substring( 4, index ) );
          html = html.substring( index + 3 );
          chars = false;
        }
      // DOCTYPE
      } else if ( DOCTYPE_REGEXP.test(html) ) {
        match = html.match( DOCTYPE_REGEXP );

        if ( match ) {
          html = html.replace( match[0], '');
          chars = false;
        }
      // end tag
      } else if ( BEGING_END_TAGE_REGEXP.test(html) ) {
        match = html.match( END_TAG_REGEXP );

        if ( match ) {
          html = html.substring( match[0].length );
          match[0].replace( END_TAG_REGEXP, parseEndTag );
          chars = false;
        }

      // start tag
      } else if ( BEGIN_TAG_REGEXP.test(html) ) {
        match = html.match( START_TAG_REGEXP );

        if ( match ) {
          html = html.substring( match[0].length );
          match[0].replace( START_TAG_REGEXP, parseStartTag );
          chars = false;
        }
      }

      if ( chars ) {
        index = html.indexOf("<");

        var text = index < 0 ? html : html.substring( 0, index );
        html = index < 0 ? "" : html.substring( index );

        if (handler.chars) handler.chars( decodeEntities(text) );
      }

    } else {
      html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", 'i'),
        function(all, text){
          text = text.replace(COMMENT_REGEXP, "$1").replace(CDATA_REGEXP, "$1");

          if (handler.chars) handler.chars( decodeEntities(text) );

          return "";
      });

      parseEndTag( "", stack.last() );
    }

    if ( html == last ) {
      throw $sanitizeMinErr('badparse', "The sanitizer was unable to parse the following block " +
                                        "of html: {0}", html);
    }
    last = html;
  }

  // Clean up any remaining tags
  parseEndTag();

  function parseStartTag( tag, tagName, rest, unary ) {
    tagName = angular.lowercase(tagName);
    if ( blockElements[ tagName ] ) {
      while ( stack.last() && inlineElements[ stack.last() ] ) {
        parseEndTag( "", stack.last() );
      }
    }

    if ( optionalEndTagElements[ tagName ] && stack.last() == tagName ) {
      parseEndTag( "", tagName );
    }

    unary = voidElements[ tagName ] || !!unary;

    if ( !unary )
      stack.push( tagName );

    var attrs = {};

    rest.replace(ATTR_REGEXP,
      function(match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
        var value = doubleQuotedValue
          || singleQuotedValue
          || unquotedValue
          || '';

        attrs[name] = decodeEntities(value);
    });
    if (handler.start) handler.start( tagName, attrs, unary );
  }

  function parseEndTag( tag, tagName ) {
    var pos = 0, i;
    tagName = angular.lowercase(tagName);
    if ( tagName )
      // Find the closest opened tag of the same type
      for ( pos = stack.length - 1; pos >= 0; pos-- )
        if ( stack[ pos ] == tagName )
          break;

    if ( pos >= 0 ) {
      // Close all the open elements, up the stack
      for ( i = stack.length - 1; i >= pos; i-- )
        if (handler.end) handler.end( stack[ i ] );

      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
}

var hiddenPre=document.createElement("pre");
var spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
/**
 * decodes all entities into regular string
 * @param value
 * @returns {string} A string with decoded entities.
 */
function decodeEntities(value) {
  if (!value) { return ''; }

  // Note: IE8 does not preserve spaces at the start/end of innerHTML
  // so we must capture them and reattach them afterward
  var parts = spaceRe.exec(value);
  var spaceBefore = parts[1];
  var spaceAfter = parts[3];
  var content = parts[2];
  if (content) {
    hiddenPre.innerHTML=content.replace(/</g,"&lt;");
    // innerText depends on styling as it doesn't display hidden elements.
    // Therefore, it's better to use textContent not to cause unnecessary
    // reflows. However, IE<9 don't support textContent so the innerText
    // fallback is necessary.
    content = 'textContent' in hiddenPre ?
      hiddenPre.textContent : hiddenPre.innerText;
  }
  return spaceBefore + content + spaceAfter;
}

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns {string} escaped text
 */
function encodeEntities(value) {
  return value.
    replace(/&/g, '&amp;').
    replace(NON_ALPHANUMERIC_REGEXP, function(value){
      return '&#' + value.charCodeAt(0) + ';';
    }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}

/**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.jain('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
function htmlSanitizeWriter(buf, uriValidator){
  var ignore = false;
  var out = angular.bind(buf, buf.push);
  return {
    start: function(tag, attrs, unary){
      tag = angular.lowercase(tag);
      if (!ignore && specialElements[tag]) {
        ignore = tag;
      }
      if (!ignore && validElements[tag] === true) {
        out('<');
        out(tag);
        angular.forEach(attrs, function(value, key){
          var lkey=angular.lowercase(key);
          var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
          if (validAttrs[lkey] === true &&
            (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
            out(' ');
            out(key);
            out('="');
            out(encodeEntities(value));
            out('"');
          }
        });
        out(unary ? '/>' : '>');
      }
    },
    end: function(tag){
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] === true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
    chars: function(chars){
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
  };
}


// define ngSanitize module and register $sanitize service
angular.module('ngSanitize', []).provider('$sanitize', $SanitizeProvider);

/* global sanitizeText: false */

/**
 * @ngdoc filter
 * @name linky
 * @function
 *
 * @description
 * Finds links in text input and turns them into html links. Supports http/https/ftp/mailto and
 * plain email address links.
 *
 * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
 *
 * @param {string} text Input text.
 * @param {string} target Window (_blank|_self|_parent|_top) or named frame to open links in.
 * @returns {string} Html-linkified text.
 *
 * @usage
   <span ng-bind-html="linky_expression | linky"></span>
 *
 * @example
   <example module="ngSanitize" deps="angular-sanitize.js">
     <file name="index.html">
       <script>
         function Ctrl($scope) {
           $scope.snippet =
             'Pretty text with some links:\n'+
             'http://angularjs.org/,\n'+
             'mailto:us@somewhere.org,\n'+
             'another@somewhere.org,\n'+
             'and one more: ftp://127.0.0.1/.';
           $scope.snippetWithTarget = 'http://angularjs.org/';
         }
       </script>
       <div ng-controller="Ctrl">
       Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng-bind-html="snippet | linky"></div>
           </td>
         </tr>
         <tr id="linky-target">
          <td>linky target</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithTarget | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithTarget | linky:'_blank'"></div>
          </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
     </file>
     <file name="protractor.js" type="protractor">
       it('should linkify the snippet with urls', function() {
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
       });

       it('should not linkify snippet without the linky filter', function() {
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
       });

       it('should update', function() {
         element(by.model('snippet')).clear();
         element(by.model('snippet')).sendKeys('new http://link.');
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('new http://link.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
             .toBe('new http://link.');
       });

       it('should work with the target property', function() {
        expect(element(by.id('linky-target')).
            element(by.binding("snippetWithTarget | linky:'_blank'")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
       });
     </file>
   </example>
 */
angular.module('ngSanitize').filter('linky', ['$sanitize', function($sanitize) {
  var LINKY_URL_REGEXP =
        /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,
      MAILTO_REGEXP = /^mailto:/;

  return function(text, target) {
    if (!text) return text;
    var match;
    var raw = text;
    var html = [];
    var url;
    var i;
    while ((match = raw.match(LINKY_URL_REGEXP))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/mailto then assume mailto
      if (match[2] == match[3]) url = 'mailto:' + url;
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return $sanitize(html.join(''));

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(sanitizeText(text));
    }

    function addLink(url, text) {
      html.push('<a ');
      if (angular.isDefined(target)) {
        html.push('target="');
        html.push(target);
        html.push('" ');
      }
      html.push('href="');
      html.push(url);
      html.push('">');
      addText(text);
      html.push('</a>');
    }
  };
}]);


})(window, window.angular);

/**!
 * AngularJS file upload/drop directive with http post and progress
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.3.1
 */
(function() {
	
var angularFileUpload = angular.module('angularFileUpload', []);

angularFileUpload.service('$upload', ['$http', '$timeout', function($http, $timeout) {
	function sendHttp(config) {
		config.method = config.method || 'POST';
		config.headers = config.headers || {};
		config.transformRequest = config.transformRequest || function(data, headersGetter) {
			if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
				return data;
			}
			return $http.defaults.transformRequest[0](data, headersGetter);
		};

		if (window.XMLHttpRequest.__isShim) {
			config.headers['__setXHR_'] = function() {
				return function(xhr) {
					config.__XHR = xhr;
					config.xhrFn && config.xhrFn(xhr);
					xhr.upload.addEventListener('progress', function(e) {
						if (config.progress) {
							$timeout(function() {
								if(config.progress) config.progress(e);
							});
						}
					}, false);
					//fix for firefox not firing upload progress end, also IE8-9
					xhr.upload.addEventListener('load', function(e) {
						if (e.lengthComputable) {
							$timeout(function() {
								if(config.progress) config.progress(e);
							});
						}
					}, false);
				}	
			};
		}

		var promise = $http(config);

		promise.progress = function(fn) {
			config.progress = fn;
			return promise;
		};
		promise.abort = function() {
			if (config.__XHR) {
				$timeout(function() {
					config.__XHR.abort();
				});
			}
			return promise;
		};
		promise.xhr = function(fn) {
			config.xhrFn = fn;
			return promise;
		};
		promise.then = (function(promise, origThen) {
			return function(s, e, p) {
				config.progress = p || config.progress;
				var result = origThen.apply(promise, [s, e, p]);
				result.abort = promise.abort;
				result.progress = promise.progress;
				result.xhr = promise.xhr;
				return result;
			};
		})(promise, promise.then);
		
		return promise;
	}

	this.upload = function(config) {
		config.headers = config.headers || {};
		config.headers['Content-Type'] = undefined;
		config.transformRequest = config.transformRequest || $http.defaults.transformRequest;
		var formData = new FormData();
		var origTransformRequest = config.transformRequest;
		var origData = config.data;
		config.transformRequest = function(formData, headerGetter) {
			if (origData) {
				if (config.formDataAppender) {
					for (var key in origData) {
						var val = origData[key];
						config.formDataAppender(formData, key, val);
					}
				} else {
					for (var key in origData) {
						var val = origData[key];
						if (typeof origTransformRequest == 'function') {
							val = origTransformRequest(val, headerGetter);
						} else {
							for (var i = 0; i < origTransformRequest.length; i++) {
								var transformFn = origTransformRequest[i];
								if (typeof transformFn == 'function') {
									val = transformFn(val, headerGetter);
								}
							}
						}
						formData.append(key, val);
					}
				}
			}

			if (config.file != null) {
				var fileFormName = config.fileFormDataName || 'file';

				if (Object.prototype.toString.call(config.file) === '[object Array]') {
					var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]'; 
					for (var i = 0; i < config.file.length; i++) {
						formData.append(isFileFormNameString ? fileFormName + i : fileFormName[i], config.file[i], config.file[i].name);
					}
				} else {
					formData.append(fileFormName, config.file, config.file.name);
				}
			}
			return formData;
		};

		config.data = formData;

		return sendHttp(config);
	};

	this.http = function(config) {
		return sendHttp(config);
	}
}]);

angularFileUpload.directive('ngFileSelect', [ '$parse', '$timeout', function($parse, $timeout) {
	return function(scope, elem, attr) {
		var fn = $parse(attr['ngFileSelect']);
		elem.bind('change', function(evt) {
			var files = [], fileList, i;
			fileList = evt.target.files;
			if (fileList != null) {
				for (i = 0; i < fileList.length; i++) {
					files.push(fileList.item(i));
				}
			}
			$timeout(function() {
				fn(scope, {
					$files : files,
					$event : evt
				});
			});
		});
		elem.bind('click', function(){
			this.value = null;
		});
	};
} ]);

angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$timeout', function($parse, $timeout) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var fn = $parse(attr['ngFileDropAvailable']);
			$timeout(function() {
				fn(scope);
			});
		}
	};
} ]);

angularFileUpload.directive('ngFileDrop', [ '$parse', '$timeout', function($parse, $timeout) {
	return function(scope, elem, attr) {		
		if ('draggable' in document.createElement('span')) {
			var cancel = null;
			var fn = $parse(attr['ngFileDrop']);
			elem[0].addEventListener("dragover", function(evt) {
				$timeout.cancel(cancel);
				evt.stopPropagation();
				evt.preventDefault();
				elem.addClass(attr['ngFileDragOverClass'] || "dragover");
			}, false);
			elem[0].addEventListener("dragleave", function(evt) {
				cancel = $timeout(function() {
					elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
				});
			}, false);
			
			var processing = 0;
			function traverseFileTree(files, item) {
				if (item.isDirectory) {
					var dirReader = item.createReader();
					processing++;
					dirReader.readEntries(function(entries) {
						for (var i = 0; i < entries.length; i++) {
							traverseFileTree(files, entries[i]);
						}
						processing--;
					});
				} else {
					processing++;
		    	    item.file(function(file) {
		    	    	processing--;
		    	    	files.push(file);
		    	    });
	    	  }
			}
			
			elem[0].addEventListener("drop", function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
				var files = [], items = evt.dataTransfer.items;
				if (items && items.length > 0 && items[0].webkitGetAsEntry) {
					for (var i = 0; i < items.length; i++) {
						traverseFileTree(files, items[i].webkitGetAsEntry());
					}
				} else {
					var fileList = evt.dataTransfer.files;
					if (fileList != null) {
						for (var i = 0; i < fileList.length; i++) {
							files.push(fileList.item(i));
						}
					}
				}
				(function callback(delay) {
					$timeout(function() {
						if (!processing) {
							fn(scope, {
								$files : files,
								$event : evt
							});
						} else {
							callback(10);
						}
					}, delay || 0)
				})();
			}, false);
		}
	};
} ]);

})();

/**!
 * AngularJS file upload shim for HTML5 FormData
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.3.1
 */
(function() {

var hasFlash = function() {
	try {
	  var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	  if (fo) return true;
	} catch(e) {
	  if (navigator.mimeTypes["application/x-shockwave-flash"] != undefined) return true;
	}
	return false;
}
	
if (window.XMLHttpRequest) {
	if (window.FormData) {
		// allow access to Angular XHR private field: https://github.com/angular/angular.js/issues/1934
		window.XMLHttpRequest = (function(origXHR) {
			return function() {
				var xhr = new origXHR();
				xhr.setRequestHeader = (function(orig) {
					return function(header, value) {
						if (header === '__setXHR_') {
							var val = value(xhr);
							// fix for angular < 1.2.0
							if (val instanceof Function) {
								val(xhr);
							}
						} else {
							orig.apply(xhr, arguments);
						}
					}
				})(xhr.setRequestHeader);
				return xhr;
			}
		})(window.XMLHttpRequest);
	} else {
		window.XMLHttpRequest = (function(origXHR) {
			return function() {
				var xhr = new origXHR();
				var origSend = xhr.send;
				xhr.__requestHeaders = [];
				xhr.open = (function(orig) {
					if (!xhr.upload) xhr.upload = {};
					xhr.__listeners = [];
					xhr.upload.addEventListener = function(t, fn, b) {
						xhr.__listeners[t] = fn;
					};
					return function(m, url, b) {
						orig.apply(xhr, [m, url, b]);
						xhr.__url = url;
					}
				})(xhr.open);
				xhr.getResponseHeader = (function(orig) {
					return function(h) {
						return xhr.__fileApiXHR ? xhr.__fileApiXHR.getResponseHeader(h) : orig.apply(xhr, [h]);
					}
				})(xhr.getResponseHeader);
				xhr.getAllResponseHeaders = (function(orig) {
					return function() {
						return xhr.__fileApiXHR ? xhr.__fileApiXHR.getAllResponseHeaders() : orig.apply(xhr);
					}
				})(xhr.getAllResponseHeaders);
				xhr.abort = (function(orig) {
					return function() {
						return xhr.__fileApiXHR ? xhr.__fileApiXHR.abort() : (orig == null ? null : orig.apply(xhr));
					}
				})(xhr.abort);
				xhr.setRequestHeader = (function(orig) {
					return function(header, value) {
						if (header === '__setXHR_') {
							var val = value(xhr);
							// fix for angular < 1.2.0
							if (val instanceof Function) {
								val(xhr);
							}
						} else {
							orig.apply(xhr, arguments);
						}
					}
				})(xhr.setRequestHeader);

				xhr.send = function() {
					if (arguments[0] && arguments[0].__isShim) {
						var formData = arguments[0];
						var config = {
							url: xhr.__url,
							complete: function(err, fileApiXHR) {
								if (!err && xhr.__listeners['load']) 
									xhr.__listeners['load']({type: 'load', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
								if (!err && xhr.__listeners['loadend']) 
									xhr.__listeners['loadend']({type: 'loadend', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
								if (err === 'abort' && xhr.__listeners['abort']) 
									xhr.__listeners['abort']({type: 'abort', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
								if (fileApiXHR.status !== undefined) Object.defineProperty(xhr, 'status', {get: function() {return fileApiXHR.status}});
								if (fileApiXHR.statusText !== undefined) Object.defineProperty(xhr, 'statusText', {get: function() {return fileApiXHR.statusText}});
								Object.defineProperty(xhr, 'readyState', {get: function() {return 4}});
								if (fileApiXHR.response !== undefined) Object.defineProperty(xhr, 'response', {get: function() {return fileApiXHR.response}});
								Object.defineProperty(xhr, 'responseText', {get: function() {return fileApiXHR.responseText}});
								xhr.__fileApiXHR = fileApiXHR;
								xhr.onreadystatechange();
							},
							progress: function(e) {
								e.target = xhr;
								xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
								xhr.__total = e.total;
								xhr.__loaded = e.loaded;
							},
							headers: xhr.__requestHeaders
						}
						config.data = {};
						config.files = {}
						for (var i = 0; i < formData.data.length; i++) {
							var item = formData.data[i];
							if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
								config.files[item.key] = item.val;
							} else {
								config.data[item.key] = item.val;
							}
						}

						setTimeout(function() {
							if (!hasFlash()) {
								throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
							}
							xhr.__fileApiXHR = FileAPI.upload(config);
						}, 1);
					} else {
						origSend.apply(xhr, arguments);
					}
				}
				return xhr;
			}
		})(window.XMLHttpRequest);
		window.XMLHttpRequest.__hasFlash = hasFlash();
	}
	window.XMLHttpRequest.__isShim = true;
}

if (!window.FormData) {
	var wrapFileApi = function(elem) {
		if (!hasFlash()) {
			throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
		}
		if (!elem.__isWrapped && (elem.getAttribute('ng-file-select') != null || elem.getAttribute('data-ng-file-select') != null)) {
			var wrap = document.createElement('div');
			wrap.innerHTML = '<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden"></div>';
			wrap = wrap.firstChild;
			var parent = elem.parentNode;
			parent.insertBefore(wrap, elem);
			parent.removeChild(elem);
			wrap.appendChild(elem);
			elem.__isWrapped = true;
		}
	};
	var changeFnWrapper = function(fn) {
		return function(evt) {
			var files = FileAPI.getFiles(evt);
			if (!evt.target) {
				evt.target = {};
			}
			evt.target.files = files;
			evt.target.files.item = function(i) {
				return evt.target.files[i] || null;
			}
			fn(evt);
		};
	};
	var isFileChange = function(elem, e) {
		return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
	}
	if (HTMLInputElement.prototype.addEventListener) {
		HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
			return function(e, fn, b, d) {
				if (isFileChange(this, e)) {
					wrapFileApi(this);
					origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
				} else {
					origAddEventListener.apply(this, [e, fn, b, d]);
				}
			}
		})(HTMLInputElement.prototype.addEventListener);
	}
	if (HTMLInputElement.prototype.attachEvent) {
		HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
			return function(e, fn) {
				if (isFileChange(this, e)) {
					wrapFileApi(this);
					origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
				} else {
					origAttachEvent.apply(this, [e, fn]);
				}
			}
		})(HTMLInputElement.prototype.attachEvent);
	}

	window.FormData = FormData = function() {
		return {
			append: function(key, val, name) {
				this.data.push({
					key: key,
					val: val,
					name: name
				});
			},
			data: [],
			__isShim: true
		};
	};

	(function () {
		//load FileAPI
		if (!window.FileAPI) {
			window.FileAPI = {};
		}
		if (!FileAPI.upload) {
			var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
			if (window.FileAPI.jsUrl) {
				jsUrl = window.FileAPI.jsUrl;
			} else if (window.FileAPI.jsPath) {
				basePath = window.FileAPI.jsPath;
			} else {
				for (i = 0; i < allScripts.length; i++) {
					src = allScripts[i].src;
					index = src.indexOf('angular-file-upload-shim.js')
					if (index == -1) {
						index = src.indexOf('angular-file-upload-shim.min.js');
					}
					if (index > -1) {
						basePath = src.substring(0, index);
						break;
					}
				}
			}

			if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
			script.setAttribute('src', jsUrl || basePath + "FileAPI.min.js");
			document.getElementsByTagName('head')[0].appendChild(script);
			FileAPI.hasFlash = hasFlash();
		}
	})();
}


if (!window.FileReader) {
	window.FileReader = function() {
		var _this = this, loadStarted = false;
		this.listeners = {};
		this.addEventListener = function(type, fn) {
			_this.listeners[type] = _this.listeners[type] || [];
			_this.listeners[type].push(fn);
		};
		this.removeEventListener = function(type, fn) {
			_this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
		};
		this.dispatchEvent = function(evt) {
			var list = _this.listeners[evt.type];
			if (list) {
				for (var i = 0; i < list.length; i++) {
					list[i].call(_this, evt);
				}
			}
		};
		this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

		function constructEvent(type, evt) {
			var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
			if (evt.result != null) e.target.result = evt.result;
			return e;
		};
		var listener = function(evt) {
			if (!loadStarted) {
				loadStarted = true;
				_this.onloadstart && this.onloadstart(constructEvent('loadstart', evt));
			}
			if (evt.type === 'load') {
				_this.onloadend && _this.onloadend(constructEvent('loadend', evt));
				var e = constructEvent('load', evt);
				_this.onload && _this.onload(e);
				_this.dispatchEvent(e);
			} else if (evt.type === 'progress') {
				var e = constructEvent('progress', evt);
				_this.onprogress && _this.onprogress(e);
				_this.dispatchEvent(e);
			} else {
				var e = constructEvent('error', evt);
				_this.onerror && _this.onerror(e);
				_this.dispatchEvent(e);
			}
		};
		this.readAsArrayBuffer = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsBinaryString = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsDataURL = function(file) {
			FileAPI.readAsDataURL(file, listener);
		}
		this.readAsText = function(file) {
			FileAPI.readAsText(file, listener);
		}
	}
}

})();

angular.module("mnd.multi-transclude", [])

.directive("mndMultiTransclude", function () {
	return {
		link: function ($scope, $element, $attrs, controller, $transclude) {
			if (!$transclude) {
				throw new Error("Illegal use of mndMultiTransculde");
			}
			$transclude(function (clone) {
				var wrapper = angular.element("<div></div>");
				wrapper.append(clone);
				var selector = "[name=" + $attrs.mndMultiTransclude + "]";
				var target = wrapper[0].querySelector(selector);
				target = angular.element(target);
				$element.replaceWith(target);
			});
		}
	};
});

angular.module('mnd.dashboard', [
  'ui.bootstrap',
  'mnd.multi-transclude'
]).factory('MndSidebarService', function () {
  var sidebarOpen = false;
  return {
    getSidebarStatus: function () {
      return sidebarOpen;
    },
    toggleSidebarStatus: function () {
      sidebarOpen = !sidebarOpen;
    }
  };
}).directive('mndSidebar', [
  'MndSidebarService',
  function (MndSidebarService) {
    return {
      restrict: 'EA',
      templateUrl: 'template/sidebar.html',
      replace: true,
      transclude: true,
      scope: true,
      link: function ($scope) {
        $scope.call = function (name) {
          if (!name) {
            return;
          }
          var args = Array.prototype.slice.call(arguments, 1);
          $scope.actions[name].apply(null, args);
        };
        $scope.isSubmenu = function (item) {
          return item.type === 'submenu';
        };
        $scope.toggleSubmenu = function (item) {
          if (item.type === 'submenu') {
            item.open = !item.open;
          }
        };
        $scope.sidebarOpen = MndSidebarService.getSidebarStatus();
        $scope.$on('sidebarStatusChanged', function () {
          $scope.sidebarOpen = MndSidebarService.getSidebarStatus();
        });
      }
    };
  }
]).directive('mndToggleSidebar', [
  'MndSidebarService',
  function (MndSidebarService) {
    return {
      restrict: 'EA',
      templateUrl: 'template/toggle-sidebar.html',
      replace: true,
      transclude: true,
      scope: true,
      link: function ($scope) {
        $scope.sidebarOpen = MndSidebarService.getSidebarStatus();
        $scope.toggle = function () {
          MndSidebarService.toggleSidebarStatus();
          $scope.$parent.$broadcast('sidebarStatusChanged');
        };
        $scope.$on('sidebarStatusChanged', function () {
          $scope.sidebarOpen = MndSidebarService.getSidebarStatus();
        });
      }
    };
  }
]).directive('mndContent', [
  'MndSidebarService',
  function (MndSidebarService) {
    return {
      restrict: 'EA',
      templateUrl: 'template/content.html',
      replace: true,
      transclude: true,
      scope: true,
      link: function ($scope) {
        $scope.sidebarOpen = MndSidebarService.getSidebarStatus();
        $scope.$on('sidebarStatusChanged', function () {
          $scope.sidebarOpen = MndSidebarService.getSidebarStatus();
        });
      }
    };
  }
]);
(function(module) {
try {
  module = angular.module('mnd.dashboard');
} catch (e) {
  module = angular.module('mnd.dashboard', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/content.html',
    '<div id="mnd-content" ng-class="{\'sidebar-open\': sidebarOpen}" ng-transclude></div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd.dashboard');
} catch (e) {
  module = angular.module('mnd.dashboard', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/sidebar.html',
    '<div id="mnd-sidebar" ng-class="{\'sidebar-open\': sidebarOpen}">\n' +
    '	<div mnd-multi-transclude="before"></div>\n' +
    '	<ul class="nav">\n' +
    '		<li ng-repeat="item in menu.items" ng-click="toggleSubmenu(item)" class="mnd-clickable">\n' +
    '\n' +
    '			<a ng-if="item.type === \'link\'" ng-href="{{item.link}}">\n' +
    '				{{item.title}}\n' +
    '			</a>\n' +
    '\n' +
    '			<a ng-if="item.type === \'action\'" ng-click="call(item.action)">\n' +
    '				{{item.title}}\n' +
    '			</a>\n' +
    '\n' +
    '			<a ng-if="item.type === \'submenu\'">\n' +
    '				{{item.title}}\n' +
    '				<span ng-if="isSubmenu(item)" class="pull-right">\n' +
    '					<i ng-if="!item.open" class="fa fa-angle-left"></i>\n' +
    '					<i ng-if="item.open" class="fa fa-angle-down"></i>\n' +
    '				</span>\n' +
    '			</a>\n' +
    '\n' +
    '			<ul ng-if="isSubmenu(item)" collapse="!item.open" class="nav nav-second-level">\n' +
    '				<li ng-repeat="subitem in item.items">\n' +
    '					<a ng-href="{{subitem.link}}" ng-click="call(subitem.action)">\n' +
    '						<span class="mnd-width-20"></span>\n' +
    '						<span class="mnd-width-20" ng-if="subitem.icon">\n' +
    '							<i class="fa {{subitem.icon}}"></i>\n' +
    '						</span>\n' +
    '						{{subitem.title}}\n' +
    '					</a>\n' +
    '				</li>\n' +
    '			</ul>\n' +
    '		</li>\n' +
    '	</ul>\n' +
    '	<div mnd-multi-transclude="after"></div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd.dashboard');
} catch (e) {
  module = angular.module('mnd.dashboard', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/toggle-sidebar.html',
    '<div id="mnd-toggle-sidebar" ng-class="{\'sidebar-open\': sidebarOpen}">\n' +
    '	<div id="mnd-show-sidebar" ng-click="toggle()">\n' +
    '		<i class="fa fa-bars" ng-show="!sidebarOpen"></i>\n' +
    '		<i class="fa fa-times" ng-show="sidebarOpen"></i>\n' +
    '	</div>\n' +
    '	<div mnd-multi-transclude="center"></div>\n' +
    '</div>\n' +
    '');
}]);
})();

angular.module('mnd.sprinkle', []).factory('MndWordProcessingService', function () {
  var repeat = function (string, times) {
    var result = '';
    for (var i = 0; i < times; i++) {
      result += string;
    }
    return result;
  };
  return function (word) {
    var processed = {};
    if (word.length === 2) {
      processed.left = word[0];
      processed.pivot = word[1];
      processed.right = '';
    } else {
      var pivotIndex = Math.ceil(word.length / 2 - 1);
      processed.left = word.slice(0, pivotIndex);
      processed.right = word.slice(pivotIndex + 1);
      processed.pivot = word.slice(pivotIndex, pivotIndex + 1);
    }
    if (/[\,\:\;]$/g.test(word)) {
      processed.multiplier = 1.5;
    } else if (/[\.\!\?]$/g.test(word)) {
      processed.multiplier = 2;
    } else {
      processed.multiplier = 1;
    }
    return processed;
  };
}).factory('MndWordSplittingService', function () {
  return function (text) {
    var words = text.split(' ');
    return words;
  };
}).factory('MndTagStrippingService', function () {
  return function (html) {
    var strippedText = html.replace(/(<([^>]+)>)/gi, ' ');
    strippedText = strippedText.replace(/\s+/g, ' ').trim();
    var p = document.createElement('p');
    p.innerHTML = strippedText;
    return p.textContent;
  };
}).factory('MndReadTimeEstimatingService', [
  'MndTagStrippingService',
  function (MndTagStrippingService) {
    return function (wordCount, readingSpeed) {
      return Math.round(wordCount / readingSpeed);
    };
  }
]).directive('mndSprinkle', [
  '$timeout',
  'MndWordSplittingService',
  'MndWordProcessingService',
  'MndTagStrippingService',
  'MndReadTimeEstimatingService',
  function ($timeout, MndWordSplittingService, MndWordProcessingService, MndTagStrippingService, MndReadTimeEstimatingService) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/sprinkle.html',
      scope: {
        text: '@?',
        html: '@?',
        defaultWpm: '@?',
        wpm: '=?',
        time: '=?',
        hideControlBar: '=?',
        autoplay: '@?',
        autoplayDelay: '@?',
        progressPercentage: '=?'
      },
      link: function ($scope) {
        ////////////////////////////////
        // Parse the text to sprinkle //
        ////////////////////////////////
        if ($scope.text) {
          $scope._words = MndWordSplittingService($scope.text);
        } else if ($scope.html) {
          $scope._text = MndTagStrippingService($scope.html);
          $scope._words = MndWordSplittingService($scope._text);
        } else {
          throw new Error('Nothing to display!');
        }
        //////////////////////////////////////////
        // Speed-related properties and methods //
        //////////////////////////////////////////
        $scope.wpm = $scope.wpm || parseInt($scope.defaultWpm || '250', 10);
        $scope.time = MndReadTimeEstimatingService($scope._words.length, $scope.wpm);
        $scope._msPerWord = function () {
          return Math.floor(60000 / $scope.wpm);
        };
        $scope.increaseSpeed = function (n) {
          var cur = $scope.wpm;
          cur += n || 50;
          $scope.wpm = cur;
          $scope.time = MndReadTimeEstimatingService($scope._words.length, $scope.wpm);
        };
        $scope.decreaseSpeed = function (n) {
          var cur = $scope.wpm;
          cur -= n || 50;
          if (cur < 50)
            cur = 50;
          $scope.wpm = cur;
          $scope.time = MndReadTimeEstimatingService($scope._words.length, $scope.wpm);
        };
        var next = function () {
          var word = $scope._words[$scope._wordIndex];
          var processed = MndWordProcessingService(word);
          $scope.word = processed;
          var delay = processed.multiplier * $scope._msPerWord();
          $scope._wordIndex++;
          $scope.progressPercentage = $scope._wordIndex / $scope._words.length * 100;
          if ($scope._wordIndex < $scope._words.length) {
            $scope._timeout = $timeout(next, delay);
          } else {
            $scope.running = false;
            $scope._wordIndex = 0;
          }
        };
        //////////////////////////////////////////
        // Status-related properties and methods //
        //////////////////////////////////////////
        $scope.running = false;
        $scope._wordIndex = 0;
        $scope.start = function () {
          if ($scope.running)
            return;
          $scope.running = true;
          next();
        };
        $scope.pause = function () {
          if (!$scope.running)
            return;
          $timeout.cancel($scope._timeout);
          $scope.running = false;
        };
        $scope.toggle = function () {
          if ($scope.running) {
            $scope.pause();
          } else {
            $scope.start();
          }
        };
        $scope.rewind = function () {
          $scope._wordIndex = 0;
        };
        $scope.stop = function () {
          $scope.pause();
          $scope.rewind();
        };
        if ($scope.autoplay === 'true') {
          var autoplayDelay = parseInt($scope.autoplayDelay, 10);
          var delay = isNaN(autoplayDelay) ? 0 : autoplayDelay;
          $timeout(function () {
            $scope.start();
          }, delay * 1000);
        }
        /////////////////
        // Control bar //
        /////////////////
        $scope.toggleControlBar = function () {
          $scope.hideControlBar = !$scope.hideControlBar;
        };
      }
    };
  }
]);
(function(module) {
try {
  module = angular.module('mnd.sprinkle');
} catch (e) {
  module = angular.module('mnd.sprinkle', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/sprinkle.html',
    '<div class="sprinkle-container">\n' +
    '	<div class="sprinkle-result" ng-click="toggle();">\n' +
    '		<span class="sprinkle-left">\n' +
    '			&nbsp;\n' +
    '			{{word.left}}\n' +
    '		</span>\n' +
    '		<span class="sprinkle-pivot">\n' +
    '			<div class="sprinkle-center-line-top"></div>\n' +
    '			<div class="sprinkle-center-line-bottom"></div>	\n' +
    '			{{word.pivot || "&nbsp;"}}\n' +
    '		</span>\n' +
    '		<span class="sprinkle-right">\n' +
    '			{{word.right}}\n' +
    '		</span>\n' +
    '	</div>\n' +
    '	<div class="sprinkle-control-bar" ng-if="!hideControlBar">\n' +
    '		<div class="sprinkle-control-bar-left">\n' +
    '			<div class="sprinkle-control-btn" ng-click="rewind()"><i class="fa fa-refresh"></i></div>\n' +
    '			<div class="sprinkle-control-btn" ng-if="running" ng-click="pause()"><i class="fa fa-pause"></i></div>\n' +
    '			<div class="sprinkle-control-btn" ng-if="!running" ng-click="start()"><i class="fa fa-play"></i></div>\n' +
    '		</div>\n' +
    '		<div class="sprinkle-control-bar-right">\n' +
    '			<div class="sprinkle-control-btn" ng-click="decreaseSpeed()"><i class="fa fa-minus"></i></div>\n' +
    '			<div class="sprinkle-control-wpm">{{wpm}} wpm </div>\n' +
    '			<div class="sprinkle-control-btn" ng-click="increaseSpeed()"><i class="fa fa-plus"></i></div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);
})();

/* SockJS client, version 0.3.4, http://sockjs.org, MIT License

Copyright (c) 2011-2012 VMware, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// JSON2 by Douglas Crockford (minified).
var JSON;JSON||(JSON={}),function(){function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i&&typeof i=="object"&&typeof i.toJSON=="function"&&(i=i.toJSON(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g;return e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)typeof rep[c]=="string"&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g;return e}}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function f(a){return a<10?"0"+a:a}"use strict",typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(!b||typeof b=="function"||typeof b=="object"&&typeof b.length=="number")return str("",{"":a});throw new Error("JSON.stringify")}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver=="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")})}()


//     [*] Including lib/index.js
// Public object
SockJS = (function(){
              var _document = document;
              var _window = window;
              var utils = {};


//         [*] Including lib/reventtarget.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

/* Simplified implementation of DOM2 EventTarget.
 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 */
var REventTarget = function() {};
REventTarget.prototype.addEventListener = function (eventType, listener) {
    if(!this._listeners) {
         this._listeners = {};
    }
    if(!(eventType in this._listeners)) {
        this._listeners[eventType] = [];
    }
    var arr = this._listeners[eventType];
    if(utils.arrIndexOf(arr, listener) === -1) {
        arr.push(listener);
    }
    return;
};

REventTarget.prototype.removeEventListener = function (eventType, listener) {
    if(!(this._listeners && (eventType in this._listeners))) {
        return;
    }
    var arr = this._listeners[eventType];
    var idx = utils.arrIndexOf(arr, listener);
    if (idx !== -1) {
        if(arr.length > 1) {
            this._listeners[eventType] = arr.slice(0, idx).concat( arr.slice(idx+1) );
        } else {
            delete this._listeners[eventType];
        }
        return;
    }
    return;
};

REventTarget.prototype.dispatchEvent = function (event) {
    var t = event.type;
    var args = Array.prototype.slice.call(arguments, 0);
    if (this['on'+t]) {
        this['on'+t].apply(this, args);
    }
    if (this._listeners && t in this._listeners) {
        for(var i=0; i < this._listeners[t].length; i++) {
            this._listeners[t][i].apply(this, args);
        }
    }
};
//         [*] End of lib/reventtarget.js


//         [*] Including lib/simpleevent.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var SimpleEvent = function(type, obj) {
    this.type = type;
    if (typeof obj !== 'undefined') {
        for(var k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            this[k] = obj[k];
        }
    }
};

SimpleEvent.prototype.toString = function() {
    var r = [];
    for(var k in this) {
        if (!this.hasOwnProperty(k)) continue;
        var v = this[k];
        if (typeof v === 'function') v = '[function]';
        r.push(k + '=' + v);
    }
    return 'SimpleEvent(' + r.join(', ') + ')';
};
//         [*] End of lib/simpleevent.js


//         [*] Including lib/eventemitter.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var EventEmitter = function(events) {
    var that = this;
    that._events = events || [];
    that._listeners = {};
};
EventEmitter.prototype.emit = function(type) {
    var that = this;
    that._verifyType(type);
    if (that._nuked) return;

    var args = Array.prototype.slice.call(arguments, 1);
    if (that['on'+type]) {
        that['on'+type].apply(that, args);
    }
    if (type in that._listeners) {
        for(var i = 0; i < that._listeners[type].length; i++) {
            that._listeners[type][i].apply(that, args);
        }
    }
};

EventEmitter.prototype.on = function(type, callback) {
    var that = this;
    that._verifyType(type);
    if (that._nuked) return;

    if (!(type in that._listeners)) {
        that._listeners[type] = [];
    }
    that._listeners[type].push(callback);
};

EventEmitter.prototype._verifyType = function(type) {
    var that = this;
    if (utils.arrIndexOf(that._events, type) === -1) {
        utils.log('Event ' + JSON.stringify(type) +
                  ' not listed ' + JSON.stringify(that._events) +
                  ' in ' + that);
    }
};

EventEmitter.prototype.nuke = function() {
    var that = this;
    that._nuked = true;
    for(var i=0; i<that._events.length; i++) {
        delete that[that._events[i]];
    }
    that._listeners = {};
};
//         [*] End of lib/eventemitter.js


//         [*] Including lib/utils.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var random_string_chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
utils.random_string = function(length, max) {
    max = max || random_string_chars.length;
    var i, ret = [];
    for(i=0; i < length; i++) {
        ret.push( random_string_chars.substr(Math.floor(Math.random() * max),1) );
    }
    return ret.join('');
};
utils.random_number = function(max) {
    return Math.floor(Math.random() * max);
};
utils.random_number_string = function(max) {
    var t = (''+(max - 1)).length;
    var p = Array(t+1).join('0');
    return (p + utils.random_number(max)).slice(-t);
};

// Assuming that url looks like: http://asdasd:111/asd
utils.getOrigin = function(url) {
    url += '/';
    var parts = url.split('/').slice(0, 3);
    return parts.join('/');
};

utils.isSameOriginUrl = function(url_a, url_b) {
    // location.origin would do, but it's not always available.
    if (!url_b) url_b = _window.location.href;

    return (url_a.split('/').slice(0,3).join('/')
                ===
            url_b.split('/').slice(0,3).join('/'));
};

utils.getParentDomain = function(url) {
    // ipv4 ip address
    if (/^[0-9.]*$/.test(url)) return url;
    // ipv6 ip address
    if (/^\[/.test(url)) return url;
    // no dots
    if (!(/[.]/.test(url))) return url;

    var parts = url.split('.').slice(1);
    return parts.join('.');
};

utils.objectExtend = function(dst, src) {
    for(var k in src) {
        if (src.hasOwnProperty(k)) {
            dst[k] = src[k];
        }
    }
    return dst;
};

var WPrefix = '_jp';

utils.polluteGlobalNamespace = function() {
    if (!(WPrefix in _window)) {
        _window[WPrefix] = {};
    }
};

utils.closeFrame = function (code, reason) {
    return 'c'+JSON.stringify([code, reason]);
};

utils.userSetCode = function (code) {
    return code === 1000 || (code >= 3000 && code <= 4999);
};

// See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
// and RFC 2988.
utils.countRTO = function (rtt) {
    var rto;
    if (rtt > 100) {
        rto = 3 * rtt; // rto > 300msec
    } else {
        rto = rtt + 200; // 200msec < rto <= 300msec
    }
    return rto;
}

utils.log = function() {
    if (_window.console && console.log && console.log.apply) {
        console.log.apply(console, arguments);
    }
};

utils.bind = function(fun, that) {
    if (fun.bind) {
        return fun.bind(that);
    } else {
        return function() {
            return fun.apply(that, arguments);
        };
    }
};

utils.flatUrl = function(url) {
    return url.indexOf('?') === -1 && url.indexOf('#') === -1;
};

utils.amendUrl = function(url) {
    var dl = _document.location;
    if (!url) {
        throw new Error('Wrong url for SockJS');
    }
    if (!utils.flatUrl(url)) {
        throw new Error('Only basic urls are supported in SockJS');
    }

    //  '//abc' --> 'http://abc'
    if (url.indexOf('//') === 0) {
        url = dl.protocol + url;
    }
    // '/abc' --> 'http://localhost:80/abc'
    if (url.indexOf('/') === 0) {
        url = dl.protocol + '//' + dl.host + url;
    }
    // strip trailing slashes
    url = url.replace(/[/]+$/,'');
    return url;
};

// IE doesn't support [].indexOf.
utils.arrIndexOf = function(arr, obj){
    for(var i=0; i < arr.length; i++){
        if(arr[i] === obj){
            return i;
        }
    }
    return -1;
};

utils.arrSkip = function(arr, obj) {
    var idx = utils.arrIndexOf(arr, obj);
    if (idx === -1) {
        return arr.slice();
    } else {
        var dst = arr.slice(0, idx);
        return dst.concat(arr.slice(idx+1));
    }
};

// Via: https://gist.github.com/1133122/2121c601c5549155483f50be3da5305e83b8c5df
utils.isArray = Array.isArray || function(value) {
    return {}.toString.call(value).indexOf('Array') >= 0
};

utils.delay = function(t, fun) {
    if(typeof t === 'function') {
        fun = t;
        t = 0;
    }
    return setTimeout(fun, t);
};


// Chars worth escaping, as defined by Douglas Crockford:
//   https://github.com/douglascrockford/JSON-js/blob/47a9882cddeb1e8529e07af9736218075372b8ac/json2.js#L196
var json_escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    json_lookup = {
"\u0000":"\\u0000","\u0001":"\\u0001","\u0002":"\\u0002","\u0003":"\\u0003",
"\u0004":"\\u0004","\u0005":"\\u0005","\u0006":"\\u0006","\u0007":"\\u0007",
"\b":"\\b","\t":"\\t","\n":"\\n","\u000b":"\\u000b","\f":"\\f","\r":"\\r",
"\u000e":"\\u000e","\u000f":"\\u000f","\u0010":"\\u0010","\u0011":"\\u0011",
"\u0012":"\\u0012","\u0013":"\\u0013","\u0014":"\\u0014","\u0015":"\\u0015",
"\u0016":"\\u0016","\u0017":"\\u0017","\u0018":"\\u0018","\u0019":"\\u0019",
"\u001a":"\\u001a","\u001b":"\\u001b","\u001c":"\\u001c","\u001d":"\\u001d",
"\u001e":"\\u001e","\u001f":"\\u001f","\"":"\\\"","\\":"\\\\",
"\u007f":"\\u007f","\u0080":"\\u0080","\u0081":"\\u0081","\u0082":"\\u0082",
"\u0083":"\\u0083","\u0084":"\\u0084","\u0085":"\\u0085","\u0086":"\\u0086",
"\u0087":"\\u0087","\u0088":"\\u0088","\u0089":"\\u0089","\u008a":"\\u008a",
"\u008b":"\\u008b","\u008c":"\\u008c","\u008d":"\\u008d","\u008e":"\\u008e",
"\u008f":"\\u008f","\u0090":"\\u0090","\u0091":"\\u0091","\u0092":"\\u0092",
"\u0093":"\\u0093","\u0094":"\\u0094","\u0095":"\\u0095","\u0096":"\\u0096",
"\u0097":"\\u0097","\u0098":"\\u0098","\u0099":"\\u0099","\u009a":"\\u009a",
"\u009b":"\\u009b","\u009c":"\\u009c","\u009d":"\\u009d","\u009e":"\\u009e",
"\u009f":"\\u009f","\u00ad":"\\u00ad","\u0600":"\\u0600","\u0601":"\\u0601",
"\u0602":"\\u0602","\u0603":"\\u0603","\u0604":"\\u0604","\u070f":"\\u070f",
"\u17b4":"\\u17b4","\u17b5":"\\u17b5","\u200c":"\\u200c","\u200d":"\\u200d",
"\u200e":"\\u200e","\u200f":"\\u200f","\u2028":"\\u2028","\u2029":"\\u2029",
"\u202a":"\\u202a","\u202b":"\\u202b","\u202c":"\\u202c","\u202d":"\\u202d",
"\u202e":"\\u202e","\u202f":"\\u202f","\u2060":"\\u2060","\u2061":"\\u2061",
"\u2062":"\\u2062","\u2063":"\\u2063","\u2064":"\\u2064","\u2065":"\\u2065",
"\u2066":"\\u2066","\u2067":"\\u2067","\u2068":"\\u2068","\u2069":"\\u2069",
"\u206a":"\\u206a","\u206b":"\\u206b","\u206c":"\\u206c","\u206d":"\\u206d",
"\u206e":"\\u206e","\u206f":"\\u206f","\ufeff":"\\ufeff","\ufff0":"\\ufff0",
"\ufff1":"\\ufff1","\ufff2":"\\ufff2","\ufff3":"\\ufff3","\ufff4":"\\ufff4",
"\ufff5":"\\ufff5","\ufff6":"\\ufff6","\ufff7":"\\ufff7","\ufff8":"\\ufff8",
"\ufff9":"\\ufff9","\ufffa":"\\ufffa","\ufffb":"\\ufffb","\ufffc":"\\ufffc",
"\ufffd":"\\ufffd","\ufffe":"\\ufffe","\uffff":"\\uffff"};

// Some extra characters that Chrome gets wrong, and substitutes with
// something else on the wire.
var extra_escapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g,
    extra_lookup;

// JSON Quote string. Use native implementation when possible.
var JSONQuote = (JSON && JSON.stringify) || function(string) {
    json_escapable.lastIndex = 0;
    if (json_escapable.test(string)) {
        string = string.replace(json_escapable, function(a) {
            return json_lookup[a];
        });
    }
    return '"' + string + '"';
};

// This may be quite slow, so let's delay until user actually uses bad
// characters.
var unroll_lookup = function(escapable) {
    var i;
    var unrolled = {}
    var c = []
    for(i=0; i<65536; i++) {
        c.push( String.fromCharCode(i) );
    }
    escapable.lastIndex = 0;
    c.join('').replace(escapable, function (a) {
        unrolled[ a ] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        return '';
    });
    escapable.lastIndex = 0;
    return unrolled;
};

// Quote string, also taking care of unicode characters that browsers
// often break. Especially, take care of unicode surrogates:
//    http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
utils.quote = function(string) {
    var quoted = JSONQuote(string);

    // In most cases this should be very fast and good enough.
    extra_escapable.lastIndex = 0;
    if(!extra_escapable.test(quoted)) {
        return quoted;
    }

    if(!extra_lookup) extra_lookup = unroll_lookup(extra_escapable);

    return quoted.replace(extra_escapable, function(a) {
        return extra_lookup[a];
    });
}

var _all_protocols = ['websocket',
                      'xdr-streaming',
                      'xhr-streaming',
                      'iframe-eventsource',
                      'iframe-htmlfile',
                      'xdr-polling',
                      'xhr-polling',
                      'iframe-xhr-polling',
                      'jsonp-polling'];

utils.probeProtocols = function() {
    var probed = {};
    for(var i=0; i<_all_protocols.length; i++) {
        var protocol = _all_protocols[i];
        // User can have a typo in protocol name.
        probed[protocol] = SockJS[protocol] &&
                           SockJS[protocol].enabled();
    }
    return probed;
};

utils.detectProtocols = function(probed, protocols_whitelist, info) {
    var pe = {},
        protocols = [];
    if (!protocols_whitelist) protocols_whitelist = _all_protocols;
    for(var i=0; i<protocols_whitelist.length; i++) {
        var protocol = protocols_whitelist[i];
        pe[protocol] = probed[protocol];
    }
    var maybe_push = function(protos) {
        var proto = protos.shift();
        if (pe[proto]) {
            protocols.push(proto);
        } else {
            if (protos.length > 0) {
                maybe_push(protos);
            }
        }
    }

    // 1. Websocket
    if (info.websocket !== false) {
        maybe_push(['websocket']);
    }

    // 2. Streaming
    if (pe['xhr-streaming'] && !info.null_origin) {
        protocols.push('xhr-streaming');
    } else {
        if (pe['xdr-streaming'] && !info.cookie_needed && !info.null_origin) {
            protocols.push('xdr-streaming');
        } else {
            maybe_push(['iframe-eventsource',
                        'iframe-htmlfile']);
        }
    }

    // 3. Polling
    if (pe['xhr-polling'] && !info.null_origin) {
        protocols.push('xhr-polling');
    } else {
        if (pe['xdr-polling'] && !info.cookie_needed && !info.null_origin) {
            protocols.push('xdr-polling');
        } else {
            maybe_push(['iframe-xhr-polling',
                        'jsonp-polling']);
        }
    }
    return protocols;
}
//         [*] End of lib/utils.js


//         [*] Including lib/dom.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

// May be used by htmlfile jsonp and transports.
var MPrefix = '_sockjs_global';
utils.createHook = function() {
    var window_id = 'a' + utils.random_string(8);
    if (!(MPrefix in _window)) {
        var map = {};
        _window[MPrefix] = function(window_id) {
            if (!(window_id in map)) {
                map[window_id] = {
                    id: window_id,
                    del: function() {delete map[window_id];}
                };
            }
            return map[window_id];
        }
    }
    return _window[MPrefix](window_id);
};



utils.attachMessage = function(listener) {
    utils.attachEvent('message', listener);
};
utils.attachEvent = function(event, listener) {
    if (typeof _window.addEventListener !== 'undefined') {
        _window.addEventListener(event, listener, false);
    } else {
        // IE quirks.
        // According to: http://stevesouders.com/misc/test-postmessage.php
        // the message gets delivered only to 'document', not 'window'.
        _document.attachEvent("on" + event, listener);
        // I get 'window' for ie8.
        _window.attachEvent("on" + event, listener);
    }
};

utils.detachMessage = function(listener) {
    utils.detachEvent('message', listener);
};
utils.detachEvent = function(event, listener) {
    if (typeof _window.addEventListener !== 'undefined') {
        _window.removeEventListener(event, listener, false);
    } else {
        _document.detachEvent("on" + event, listener);
        _window.detachEvent("on" + event, listener);
    }
};


var on_unload = {};
// Things registered after beforeunload are to be called immediately.
var after_unload = false;

var trigger_unload_callbacks = function() {
    for(var ref in on_unload) {
        on_unload[ref]();
        delete on_unload[ref];
    };
};

var unload_triggered = function() {
    if(after_unload) return;
    after_unload = true;
    trigger_unload_callbacks();
};

// 'unload' alone is not reliable in opera within an iframe, but we
// can't use `beforeunload` as IE fires it on javascript: links.
utils.attachEvent('unload', unload_triggered);

utils.unload_add = function(listener) {
    var ref = utils.random_string(8);
    on_unload[ref] = listener;
    if (after_unload) {
        utils.delay(trigger_unload_callbacks);
    }
    return ref;
};
utils.unload_del = function(ref) {
    if (ref in on_unload)
        delete on_unload[ref];
};


utils.createIframe = function (iframe_url, error_callback) {
    var iframe = _document.createElement('iframe');
    var tref, unload_ref;
    var unattach = function() {
        clearTimeout(tref);
        // Explorer had problems with that.
        try {iframe.onload = null;} catch (x) {}
        iframe.onerror = null;
    };
    var cleanup = function() {
        if (iframe) {
            unattach();
            // This timeout makes chrome fire onbeforeunload event
            // within iframe. Without the timeout it goes straight to
            // onunload.
            setTimeout(function() {
                if(iframe) {
                    iframe.parentNode.removeChild(iframe);
                }
                iframe = null;
            }, 0);
            utils.unload_del(unload_ref);
        }
    };
    var onerror = function(r) {
        if (iframe) {
            cleanup();
            error_callback(r);
        }
    };
    var post = function(msg, origin) {
        try {
            // When the iframe is not loaded, IE raises an exception
            // on 'contentWindow'.
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, origin);
            }
        } catch (x) {};
    };

    iframe.src = iframe_url;
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.onerror = function(){onerror('onerror');};
    iframe.onload = function() {
        // `onload` is triggered before scripts on the iframe are
        // executed. Give it few seconds to actually load stuff.
        clearTimeout(tref);
        tref = setTimeout(function(){onerror('onload timeout');}, 2000);
    };
    _document.body.appendChild(iframe);
    tref = setTimeout(function(){onerror('timeout');}, 15000);
    unload_ref = utils.unload_add(cleanup);
    return {
        post: post,
        cleanup: cleanup,
        loaded: unattach
    };
};

utils.createHtmlfile = function (iframe_url, error_callback) {
    var doc = new ActiveXObject('htmlfile');
    var tref, unload_ref;
    var iframe;
    var unattach = function() {
        clearTimeout(tref);
    };
    var cleanup = function() {
        if (doc) {
            unattach();
            utils.unload_del(unload_ref);
            iframe.parentNode.removeChild(iframe);
            iframe = doc = null;
            CollectGarbage();
        }
    };
    var onerror = function(r)  {
        if (doc) {
            cleanup();
            error_callback(r);
        }
    };
    var post = function(msg, origin) {
        try {
            // When the iframe is not loaded, IE raises an exception
            // on 'contentWindow'.
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, origin);
            }
        } catch (x) {};
    };

    doc.open();
    doc.write('<html><s' + 'cript>' +
              'document.domain="' + document.domain + '";' +
              '</s' + 'cript></html>');
    doc.close();
    doc.parentWindow[WPrefix] = _window[WPrefix];
    var c = doc.createElement('div');
    doc.body.appendChild(c);
    iframe = doc.createElement('iframe');
    c.appendChild(iframe);
    iframe.src = iframe_url;
    tref = setTimeout(function(){onerror('timeout');}, 15000);
    unload_ref = utils.unload_add(cleanup);
    return {
        post: post,
        cleanup: cleanup,
        loaded: unattach
    };
};
//         [*] End of lib/dom.js


//         [*] Including lib/dom2.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var AbstractXHRObject = function(){};
AbstractXHRObject.prototype = new EventEmitter(['chunk', 'finish']);

AbstractXHRObject.prototype._start = function(method, url, payload, opts) {
    var that = this;

    try {
        that.xhr = new XMLHttpRequest();
    } catch(x) {};

    if (!that.xhr) {
        try {
            that.xhr = new _window.ActiveXObject('Microsoft.XMLHTTP');
        } catch(x) {};
    }
    if (_window.ActiveXObject || _window.XDomainRequest) {
        // IE8 caches even POSTs
        url += ((url.indexOf('?') === -1) ? '?' : '&') + 't='+(+new Date);
    }

    // Explorer tends to keep connection open, even after the
    // tab gets closed: http://bugs.jquery.com/ticket/5280
    that.unload_ref = utils.unload_add(function(){that._cleanup(true);});
    try {
        that.xhr.open(method, url, true);
    } catch(e) {
        // IE raises an exception on wrong port.
        that.emit('finish', 0, '');
        that._cleanup();
        return;
    };

    if (!opts || !opts.no_credentials) {
        // Mozilla docs says https://developer.mozilla.org/en/XMLHttpRequest :
        // "This never affects same-site requests."
        that.xhr.withCredentials = 'true';
    }
    if (opts && opts.headers) {
        for(var key in opts.headers) {
            that.xhr.setRequestHeader(key, opts.headers[key]);
        }
    }

    that.xhr.onreadystatechange = function() {
        if (that.xhr) {
            var x = that.xhr;
            switch (x.readyState) {
            case 3:
                // IE doesn't like peeking into responseText or status
                // on Microsoft.XMLHTTP and readystate=3
                try {
                    var status = x.status;
                    var text = x.responseText;
                } catch (x) {};
                // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
                if (status === 1223) status = 204;

                // IE does return readystate == 3 for 404 answers.
                if (text && text.length > 0) {
                    that.emit('chunk', status, text);
                }
                break;
            case 4:
                var status = x.status;
                // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
                if (status === 1223) status = 204;

                that.emit('finish', status, x.responseText);
                that._cleanup(false);
                break;
            }
        }
    };
    that.xhr.send(payload);
};

AbstractXHRObject.prototype._cleanup = function(abort) {
    var that = this;
    if (!that.xhr) return;
    utils.unload_del(that.unload_ref);

    // IE needs this field to be a function
    that.xhr.onreadystatechange = function(){};

    if (abort) {
        try {
            that.xhr.abort();
        } catch(x) {};
    }
    that.unload_ref = that.xhr = null;
};

AbstractXHRObject.prototype.close = function() {
    var that = this;
    that.nuke();
    that._cleanup(true);
};

var XHRCorsObject = utils.XHRCorsObject = function() {
    var that = this, args = arguments;
    utils.delay(function(){that._start.apply(that, args);});
};
XHRCorsObject.prototype = new AbstractXHRObject();

var XHRLocalObject = utils.XHRLocalObject = function(method, url, payload) {
    var that = this;
    utils.delay(function(){
        that._start(method, url, payload, {
            no_credentials: true
        });
    });
};
XHRLocalObject.prototype = new AbstractXHRObject();



// References:
//   http://ajaxian.com/archives/100-line-ajax-wrapper
//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx
var XDRObject = utils.XDRObject = function(method, url, payload) {
    var that = this;
    utils.delay(function(){that._start(method, url, payload);});
};
XDRObject.prototype = new EventEmitter(['chunk', 'finish']);
XDRObject.prototype._start = function(method, url, payload) {
    var that = this;
    var xdr = new XDomainRequest();
    // IE caches even POSTs
    url += ((url.indexOf('?') === -1) ? '?' : '&') + 't='+(+new Date);

    var onerror = xdr.ontimeout = xdr.onerror = function() {
        that.emit('finish', 0, '');
        that._cleanup(false);
    };
    xdr.onprogress = function() {
        that.emit('chunk', 200, xdr.responseText);
    };
    xdr.onload = function() {
        that.emit('finish', 200, xdr.responseText);
        that._cleanup(false);
    };
    that.xdr = xdr;
    that.unload_ref = utils.unload_add(function(){that._cleanup(true);});
    try {
        // Fails with AccessDenied if port number is bogus
        that.xdr.open(method, url);
        that.xdr.send(payload);
    } catch(x) {
        onerror();
    }
};

XDRObject.prototype._cleanup = function(abort) {
    var that = this;
    if (!that.xdr) return;
    utils.unload_del(that.unload_ref);

    that.xdr.ontimeout = that.xdr.onerror = that.xdr.onprogress =
        that.xdr.onload = null;
    if (abort) {
        try {
            that.xdr.abort();
        } catch(x) {};
    }
    that.unload_ref = that.xdr = null;
};

XDRObject.prototype.close = function() {
    var that = this;
    that.nuke();
    that._cleanup(true);
};

// 1. Is natively via XHR
// 2. Is natively via XDR
// 3. Nope, but postMessage is there so it should work via the Iframe.
// 4. Nope, sorry.
utils.isXHRCorsCapable = function() {
    if (_window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()) {
        return 1;
    }
    // XDomainRequest doesn't work if page is served from file://
    if (_window.XDomainRequest && _document.domain) {
        return 2;
    }
    if (IframeTransport.enabled()) {
        return 3;
    }
    return 4;
};
//         [*] End of lib/dom2.js


//         [*] Including lib/sockjs.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var SockJS = function(url, dep_protocols_whitelist, options) {
    if (this === _window) {
        // makes `new` optional
        return new SockJS(url, dep_protocols_whitelist, options);
    }
    
    var that = this, protocols_whitelist;
    that._options = {devel: false, debug: false, protocols_whitelist: [],
                     info: undefined, rtt: undefined};
    if (options) {
        utils.objectExtend(that._options, options);
    }
    that._base_url = utils.amendUrl(url);
    that._server = that._options.server || utils.random_number_string(1000);
    if (that._options.protocols_whitelist &&
        that._options.protocols_whitelist.length) {
        protocols_whitelist = that._options.protocols_whitelist;
    } else {
        // Deprecated API
        if (typeof dep_protocols_whitelist === 'string' &&
            dep_protocols_whitelist.length > 0) {
            protocols_whitelist = [dep_protocols_whitelist];
        } else if (utils.isArray(dep_protocols_whitelist)) {
            protocols_whitelist = dep_protocols_whitelist
        } else {
            protocols_whitelist = null;
        }
        if (protocols_whitelist) {
            that._debug('Deprecated API: Use "protocols_whitelist" option ' +
                        'instead of supplying protocol list as a second ' +
                        'parameter to SockJS constructor.');
        }
    }
    that._protocols = [];
    that.protocol = null;
    that.readyState = SockJS.CONNECTING;
    that._ir = createInfoReceiver(that._base_url);
    that._ir.onfinish = function(info, rtt) {
        that._ir = null;
        if (info) {
            if (that._options.info) {
                // Override if user supplies the option
                info = utils.objectExtend(info, that._options.info);
            }
            if (that._options.rtt) {
                rtt = that._options.rtt;
            }
            that._applyInfo(info, rtt, protocols_whitelist);
            that._didClose();
        } else {
            that._didClose(1002, 'Can\'t connect to server', true);
        }
    };
};
// Inheritance
SockJS.prototype = new REventTarget();

SockJS.version = "0.3.4";

SockJS.CONNECTING = 0;
SockJS.OPEN = 1;
SockJS.CLOSING = 2;
SockJS.CLOSED = 3;

SockJS.prototype._debug = function() {
    if (this._options.debug)
        utils.log.apply(utils, arguments);
};

SockJS.prototype._dispatchOpen = function() {
    var that = this;
    if (that.readyState === SockJS.CONNECTING) {
        if (that._transport_tref) {
            clearTimeout(that._transport_tref);
            that._transport_tref = null;
        }
        that.readyState = SockJS.OPEN;
        that.dispatchEvent(new SimpleEvent("open"));
    } else {
        // The server might have been restarted, and lost track of our
        // connection.
        that._didClose(1006, "Server lost session");
    }
};

SockJS.prototype._dispatchMessage = function(data) {
    var that = this;
    if (that.readyState !== SockJS.OPEN)
            return;
    that.dispatchEvent(new SimpleEvent("message", {data: data}));
};

SockJS.prototype._dispatchHeartbeat = function(data) {
    var that = this;
    if (that.readyState !== SockJS.OPEN)
        return;
    that.dispatchEvent(new SimpleEvent('heartbeat', {}));
};

SockJS.prototype._didClose = function(code, reason, force) {
    var that = this;
    if (that.readyState !== SockJS.CONNECTING &&
        that.readyState !== SockJS.OPEN &&
        that.readyState !== SockJS.CLOSING)
            throw new Error('INVALID_STATE_ERR');
    if (that._ir) {
        that._ir.nuke();
        that._ir = null;
    }

    if (that._transport) {
        that._transport.doCleanup();
        that._transport = null;
    }

    var close_event = new SimpleEvent("close", {
        code: code,
        reason: reason,
        wasClean: utils.userSetCode(code)});

    if (!utils.userSetCode(code) &&
        that.readyState === SockJS.CONNECTING && !force) {
        if (that._try_next_protocol(close_event)) {
            return;
        }
        close_event = new SimpleEvent("close", {code: 2000,
                                                reason: "All transports failed",
                                                wasClean: false,
                                                last_event: close_event});
    }
    that.readyState = SockJS.CLOSED;

    utils.delay(function() {
                   that.dispatchEvent(close_event);
                });
};

SockJS.prototype._didMessage = function(data) {
    var that = this;
    var type = data.slice(0, 1);
    switch(type) {
    case 'o':
        that._dispatchOpen();
        break;
    case 'a':
        var payload = JSON.parse(data.slice(1) || '[]');
        for(var i=0; i < payload.length; i++){
            that._dispatchMessage(payload[i]);
        }
        break;
    case 'm':
        var payload = JSON.parse(data.slice(1) || 'null');
        that._dispatchMessage(payload);
        break;
    case 'c':
        var payload = JSON.parse(data.slice(1) || '[]');
        that._didClose(payload[0], payload[1]);
        break;
    case 'h':
        that._dispatchHeartbeat();
        break;
    }
};

SockJS.prototype._try_next_protocol = function(close_event) {
    var that = this;
    if (that.protocol) {
        that._debug('Closed transport:', that.protocol, ''+close_event);
        that.protocol = null;
    }
    if (that._transport_tref) {
        clearTimeout(that._transport_tref);
        that._transport_tref = null;
    }

    while(1) {
        var protocol = that.protocol = that._protocols.shift();
        if (!protocol) {
            return false;
        }
        // Some protocols require access to `body`, what if were in
        // the `head`?
        if (SockJS[protocol] &&
            SockJS[protocol].need_body === true &&
            (!_document.body ||
             (typeof _document.readyState !== 'undefined'
              && _document.readyState !== 'complete'))) {
            that._protocols.unshift(protocol);
            that.protocol = 'waiting-for-load';
            utils.attachEvent('load', function(){
                that._try_next_protocol();
            });
            return true;
        }

        if (!SockJS[protocol] ||
              !SockJS[protocol].enabled(that._options)) {
            that._debug('Skipping transport:', protocol);
        } else {
            var roundTrips = SockJS[protocol].roundTrips || 1;
            var to = ((that._options.rto || 0) * roundTrips) || 5000;
            that._transport_tref = utils.delay(to, function() {
                if (that.readyState === SockJS.CONNECTING) {
                    // I can't understand how it is possible to run
                    // this timer, when the state is CLOSED, but
                    // apparently in IE everythin is possible.
                    that._didClose(2007, "Transport timeouted");
                }
            });

            var connid = utils.random_string(8);
            var trans_url = that._base_url + '/' + that._server + '/' + connid;
            that._debug('Opening transport:', protocol, ' url:'+trans_url,
                        ' RTO:'+that._options.rto);
            that._transport = new SockJS[protocol](that, trans_url,
                                                   that._base_url);
            return true;
        }
    }
};

SockJS.prototype.close = function(code, reason) {
    var that = this;
    if (code && !utils.userSetCode(code))
        throw new Error("INVALID_ACCESS_ERR");
    if(that.readyState !== SockJS.CONNECTING &&
       that.readyState !== SockJS.OPEN) {
        return false;
    }
    that.readyState = SockJS.CLOSING;
    that._didClose(code || 1000, reason || "Normal closure");
    return true;
};

SockJS.prototype.send = function(data) {
    var that = this;
    if (that.readyState === SockJS.CONNECTING)
        throw new Error('INVALID_STATE_ERR');
    if (that.readyState === SockJS.OPEN) {
        that._transport.doSend(utils.quote('' + data));
    }
    return true;
};

SockJS.prototype._applyInfo = function(info, rtt, protocols_whitelist) {
    var that = this;
    that._options.info = info;
    that._options.rtt = rtt;
    that._options.rto = utils.countRTO(rtt);
    that._options.info.null_origin = !_document.domain;
    var probed = utils.probeProtocols();
    that._protocols = utils.detectProtocols(probed, protocols_whitelist, info);
};
//         [*] End of lib/sockjs.js


//         [*] Including lib/trans-websocket.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var WebSocketTransport = SockJS.websocket = function(ri, trans_url) {
    var that = this;
    var url = trans_url + '/websocket';
    if (url.slice(0, 5) === 'https') {
        url = 'wss' + url.slice(5);
    } else {
        url = 'ws' + url.slice(4);
    }
    that.ri = ri;
    that.url = url;
    var Constructor = _window.WebSocket || _window.MozWebSocket;

    that.ws = new Constructor(that.url);
    that.ws.onmessage = function(e) {
        that.ri._didMessage(e.data);
    };
    // Firefox has an interesting bug. If a websocket connection is
    // created after onunload, it stays alive even when user
    // navigates away from the page. In such situation let's lie -
    // let's not open the ws connection at all. See:
    // https://github.com/sockjs/sockjs-client/issues/28
    // https://bugzilla.mozilla.org/show_bug.cgi?id=696085
    that.unload_ref = utils.unload_add(function(){that.ws.close()});
    that.ws.onclose = function() {
        that.ri._didMessage(utils.closeFrame(1006, "WebSocket connection broken"));
    };
};

WebSocketTransport.prototype.doSend = function(data) {
    this.ws.send('[' + data + ']');
};

WebSocketTransport.prototype.doCleanup = function() {
    var that = this;
    var ws = that.ws;
    if (ws) {
        ws.onmessage = ws.onclose = null;
        ws.close();
        utils.unload_del(that.unload_ref);
        that.unload_ref = that.ri = that.ws = null;
    }
};

WebSocketTransport.enabled = function() {
    return !!(_window.WebSocket || _window.MozWebSocket);
};

// In theory, ws should require 1 round trip. But in chrome, this is
// not very stable over SSL. Most likely a ws connection requires a
// separate SSL connection, in which case 2 round trips are an
// absolute minumum.
WebSocketTransport.roundTrips = 2;
//         [*] End of lib/trans-websocket.js


//         [*] Including lib/trans-sender.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var BufferedSender = function() {};
BufferedSender.prototype.send_constructor = function(sender) {
    var that = this;
    that.send_buffer = [];
    that.sender = sender;
};
BufferedSender.prototype.doSend = function(message) {
    var that = this;
    that.send_buffer.push(message);
    if (!that.send_stop) {
        that.send_schedule();
    }
};

// For polling transports in a situation when in the message callback,
// new message is being send. If the sending connection was started
// before receiving one, it is possible to saturate the network and
// timeout due to the lack of receiving socket. To avoid that we delay
// sending messages by some small time, in order to let receiving
// connection be started beforehand. This is only a halfmeasure and
// does not fix the big problem, but it does make the tests go more
// stable on slow networks.
BufferedSender.prototype.send_schedule_wait = function() {
    var that = this;
    var tref;
    that.send_stop = function() {
        that.send_stop = null;
        clearTimeout(tref);
    };
    tref = utils.delay(25, function() {
        that.send_stop = null;
        that.send_schedule();
    });
};

BufferedSender.prototype.send_schedule = function() {
    var that = this;
    if (that.send_buffer.length > 0) {
        var payload = '[' + that.send_buffer.join(',') + ']';
        that.send_stop = that.sender(that.trans_url, payload, function(success, abort_reason) {
            that.send_stop = null;
            if (success === false) {
                that.ri._didClose(1006, 'Sending error ' + abort_reason);
            } else {
                that.send_schedule_wait();
            }
        });
        that.send_buffer = [];
    }
};

BufferedSender.prototype.send_destructor = function() {
    var that = this;
    if (that._send_stop) {
        that._send_stop();
    }
    that._send_stop = null;
};

var jsonPGenericSender = function(url, payload, callback) {
    var that = this;

    if (!('_send_form' in that)) {
        var form = that._send_form = _document.createElement('form');
        var area = that._send_area = _document.createElement('textarea');
        area.name = 'd';
        form.style.display = 'none';
        form.style.position = 'absolute';
        form.method = 'POST';
        form.enctype = 'application/x-www-form-urlencoded';
        form.acceptCharset = "UTF-8";
        form.appendChild(area);
        _document.body.appendChild(form);
    }
    var form = that._send_form;
    var area = that._send_area;
    var id = 'a' + utils.random_string(8);
    form.target = id;
    form.action = url + '/jsonp_send?i=' + id;

    var iframe;
    try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        iframe = _document.createElement('<iframe name="'+ id +'">');
    } catch(x) {
        iframe = _document.createElement('iframe');
        iframe.name = id;
    }
    iframe.id = id;
    form.appendChild(iframe);
    iframe.style.display = 'none';

    try {
        area.value = payload;
    } catch(e) {
        utils.log('Your browser is seriously broken. Go home! ' + e.message);
    }
    form.submit();

    var completed = function(e) {
        if (!iframe.onerror) return;
        iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
        // Opera mini doesn't like if we GC iframe
        // immediately, thus this timeout.
        utils.delay(500, function() {
                       iframe.parentNode.removeChild(iframe);
                       iframe = null;
                   });
        area.value = '';
        // It is not possible to detect if the iframe succeeded or
        // failed to submit our form.
        callback(true);
    };
    iframe.onerror = iframe.onload = completed;
    iframe.onreadystatechange = function(e) {
        if (iframe.readyState == 'complete') completed();
    };
    return completed;
};

var createAjaxSender = function(AjaxObject) {
    return function(url, payload, callback) {
        var xo = new AjaxObject('POST', url + '/xhr_send', payload);
        xo.onfinish = function(status, text) {
            callback(status === 200 || status === 204,
                     'http status ' + status);
        };
        return function(abort_reason) {
            callback(false, abort_reason);
        };
    };
};
//         [*] End of lib/trans-sender.js


//         [*] Including lib/trans-jsonp-receiver.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

// Parts derived from Socket.io:
//    https://github.com/LearnBoost/socket.io/blob/0.6.17/lib/socket.io/transports/jsonp-polling.js
// and jQuery-JSONP:
//    https://code.google.com/p/jquery-jsonp/source/browse/trunk/core/jquery.jsonp.js
var jsonPGenericReceiver = function(url, callback) {
    var tref;
    var script = _document.createElement('script');
    var script2;  // Opera synchronous load trick.
    var close_script = function(frame) {
        if (script2) {
            script2.parentNode.removeChild(script2);
            script2 = null;
        }
        if (script) {
            clearTimeout(tref);
            // Unfortunately, you can't really abort script loading of
            // the script.
            script.parentNode.removeChild(script);
            script.onreadystatechange = script.onerror =
                script.onload = script.onclick = null;
            script = null;
            callback(frame);
            callback = null;
        }
    };

    // IE9 fires 'error' event after orsc or before, in random order.
    var loaded_okay = false;
    var error_timer = null;

    script.id = 'a' + utils.random_string(8);
    script.src = url;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.onerror = function(e) {
        if (!error_timer) {
            // Delay firing close_script.
            error_timer = setTimeout(function() {
                if (!loaded_okay) {
                    close_script(utils.closeFrame(
                        1006,
                        "JSONP script loaded abnormally (onerror)"));
                }
            }, 1000);
        }
    };
    script.onload = function(e) {
        close_script(utils.closeFrame(1006, "JSONP script loaded abnormally (onload)"));
    };

    script.onreadystatechange = function(e) {
        if (/loaded|closed/.test(script.readyState)) {
            if (script && script.htmlFor && script.onclick) {
                loaded_okay = true;
                try {
                    // In IE, actually execute the script.
                    script.onclick();
                } catch (x) {}
            }
            if (script) {
                close_script(utils.closeFrame(1006, "JSONP script loaded abnormally (onreadystatechange)"));
            }
        }
    };
    // IE: event/htmlFor/onclick trick.
    // One can't rely on proper order for onreadystatechange. In order to
    // make sure, set a 'htmlFor' and 'event' properties, so that
    // script code will be installed as 'onclick' handler for the
    // script object. Later, onreadystatechange, manually execute this
    // code. FF and Chrome doesn't work with 'event' and 'htmlFor'
    // set. For reference see:
    //   http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
    // Also, read on that about script ordering:
    //   http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
    if (typeof script.async === 'undefined' && _document.attachEvent) {
        // According to mozilla docs, in recent browsers script.async defaults
        // to 'true', so we may use it to detect a good browser:
        // https://developer.mozilla.org/en/HTML/Element/script
        if (!/opera/i.test(navigator.userAgent)) {
            // Naively assume we're in IE
            try {
                script.htmlFor = script.id;
                script.event = "onclick";
            } catch (x) {}
            script.async = true;
        } else {
            // Opera, second sync script hack
            script2 = _document.createElement('script');
            script2.text = "try{var a = document.getElementById('"+script.id+"'); if(a)a.onerror();}catch(x){};";
            script.async = script2.async = false;
        }
    }
    if (typeof script.async !== 'undefined') {
        script.async = true;
    }

    // Fallback mostly for Konqueror - stupid timer, 35 seconds shall be plenty.
    tref = setTimeout(function() {
                          close_script(utils.closeFrame(1006, "JSONP script loaded abnormally (timeout)"));
                      }, 35000);

    var head = _document.getElementsByTagName('head')[0];
    head.insertBefore(script, head.firstChild);
    if (script2) {
        head.insertBefore(script2, head.firstChild);
    }
    return close_script;
};
//         [*] End of lib/trans-jsonp-receiver.js


//         [*] Including lib/trans-jsonp-polling.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

// The simplest and most robust transport, using the well-know cross
// domain hack - JSONP. This transport is quite inefficient - one
// mssage could use up to one http request. But at least it works almost
// everywhere.
// Known limitations:
//   o you will get a spinning cursor
//   o for Konqueror a dumb timer is needed to detect errors


var JsonPTransport = SockJS['jsonp-polling'] = function(ri, trans_url) {
    utils.polluteGlobalNamespace();
    var that = this;
    that.ri = ri;
    that.trans_url = trans_url;
    that.send_constructor(jsonPGenericSender);
    that._schedule_recv();
};

// Inheritnace
JsonPTransport.prototype = new BufferedSender();

JsonPTransport.prototype._schedule_recv = function() {
    var that = this;
    var callback = function(data) {
        that._recv_stop = null;
        if (data) {
            // no data - heartbeat;
            if (!that._is_closing) {
                that.ri._didMessage(data);
            }
        }
        // The message can be a close message, and change is_closing state.
        if (!that._is_closing) {
            that._schedule_recv();
        }
    };
    that._recv_stop = jsonPReceiverWrapper(that.trans_url + '/jsonp',
                                           jsonPGenericReceiver, callback);
};

JsonPTransport.enabled = function() {
    return true;
};

JsonPTransport.need_body = true;


JsonPTransport.prototype.doCleanup = function() {
    var that = this;
    that._is_closing = true;
    if (that._recv_stop) {
        that._recv_stop();
    }
    that.ri = that._recv_stop = null;
    that.send_destructor();
};


// Abstract away code that handles global namespace pollution.
var jsonPReceiverWrapper = function(url, constructReceiver, user_callback) {
    var id = 'a' + utils.random_string(6);
    var url_id = url + '?c=' + escape(WPrefix + '.' + id);

    // Unfortunately it is not possible to abort loading of the
    // script. We need to keep track of frake close frames.
    var aborting = 0;

    // Callback will be called exactly once.
    var callback = function(frame) {
        switch(aborting) {
        case 0:
            // Normal behaviour - delete hook _and_ emit message.
            delete _window[WPrefix][id];
            user_callback(frame);
            break;
        case 1:
            // Fake close frame - emit but don't delete hook.
            user_callback(frame);
            aborting = 2;
            break;
        case 2:
            // Got frame after connection was closed, delete hook, don't emit.
            delete _window[WPrefix][id];
            break;
        }
    };

    var close_script = constructReceiver(url_id, callback);
    _window[WPrefix][id] = close_script;
    var stop = function() {
        if (_window[WPrefix][id]) {
            aborting = 1;
            _window[WPrefix][id](utils.closeFrame(1000, "JSONP user aborted read"));
        }
    };
    return stop;
};
//         [*] End of lib/trans-jsonp-polling.js


//         [*] Including lib/trans-xhr.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var AjaxBasedTransport = function() {};
AjaxBasedTransport.prototype = new BufferedSender();

AjaxBasedTransport.prototype.run = function(ri, trans_url,
                                            url_suffix, Receiver, AjaxObject) {
    var that = this;
    that.ri = ri;
    that.trans_url = trans_url;
    that.send_constructor(createAjaxSender(AjaxObject));
    that.poll = new Polling(ri, Receiver,
                            trans_url + url_suffix, AjaxObject);
};

AjaxBasedTransport.prototype.doCleanup = function() {
    var that = this;
    if (that.poll) {
        that.poll.abort();
        that.poll = null;
    }
};

// xhr-streaming
var XhrStreamingTransport = SockJS['xhr-streaming'] = function(ri, trans_url) {
    this.run(ri, trans_url, '/xhr_streaming', XhrReceiver, utils.XHRCorsObject);
};

XhrStreamingTransport.prototype = new AjaxBasedTransport();

XhrStreamingTransport.enabled = function() {
    // Support for CORS Ajax aka Ajax2? Opera 12 claims CORS but
    // doesn't do streaming.
    return (_window.XMLHttpRequest &&
            'withCredentials' in new XMLHttpRequest() &&
            (!/opera/i.test(navigator.userAgent)));
};
XhrStreamingTransport.roundTrips = 2; // preflight, ajax

// Safari gets confused when a streaming ajax request is started
// before onload. This causes the load indicator to spin indefinetely.
XhrStreamingTransport.need_body = true;


// According to:
//   http://stackoverflow.com/questions/1641507/detect-browser-support-for-cross-domain-xmlhttprequests
//   http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/


// xdr-streaming
var XdrStreamingTransport = SockJS['xdr-streaming'] = function(ri, trans_url) {
    this.run(ri, trans_url, '/xhr_streaming', XhrReceiver, utils.XDRObject);
};

XdrStreamingTransport.prototype = new AjaxBasedTransport();

XdrStreamingTransport.enabled = function() {
    return !!_window.XDomainRequest;
};
XdrStreamingTransport.roundTrips = 2; // preflight, ajax



// xhr-polling
var XhrPollingTransport = SockJS['xhr-polling'] = function(ri, trans_url) {
    this.run(ri, trans_url, '/xhr', XhrReceiver, utils.XHRCorsObject);
};

XhrPollingTransport.prototype = new AjaxBasedTransport();

XhrPollingTransport.enabled = XhrStreamingTransport.enabled;
XhrPollingTransport.roundTrips = 2; // preflight, ajax


// xdr-polling
var XdrPollingTransport = SockJS['xdr-polling'] = function(ri, trans_url) {
    this.run(ri, trans_url, '/xhr', XhrReceiver, utils.XDRObject);
};

XdrPollingTransport.prototype = new AjaxBasedTransport();

XdrPollingTransport.enabled = XdrStreamingTransport.enabled;
XdrPollingTransport.roundTrips = 2; // preflight, ajax
//         [*] End of lib/trans-xhr.js


//         [*] Including lib/trans-iframe.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

// Few cool transports do work only for same-origin. In order to make
// them working cross-domain we shall use iframe, served form the
// remote domain. New browsers, have capabilities to communicate with
// cross domain iframe, using postMessage(). In IE it was implemented
// from IE 8+, but of course, IE got some details wrong:
//    http://msdn.microsoft.com/en-us/library/cc197015(v=VS.85).aspx
//    http://stevesouders.com/misc/test-postmessage.php

var IframeTransport = function() {};

IframeTransport.prototype.i_constructor = function(ri, trans_url, base_url) {
    var that = this;
    that.ri = ri;
    that.origin = utils.getOrigin(base_url);
    that.base_url = base_url;
    that.trans_url = trans_url;

    var iframe_url = base_url + '/iframe.html';
    if (that.ri._options.devel) {
        iframe_url += '?t=' + (+new Date);
    }
    that.window_id = utils.random_string(8);
    iframe_url += '#' + that.window_id;

    that.iframeObj = utils.createIframe(iframe_url, function(r) {
                                            that.ri._didClose(1006, "Unable to load an iframe (" + r + ")");
                                        });

    that.onmessage_cb = utils.bind(that.onmessage, that);
    utils.attachMessage(that.onmessage_cb);
};

IframeTransport.prototype.doCleanup = function() {
    var that = this;
    if (that.iframeObj) {
        utils.detachMessage(that.onmessage_cb);
        try {
            // When the iframe is not loaded, IE raises an exception
            // on 'contentWindow'.
            if (that.iframeObj.iframe.contentWindow) {
                that.postMessage('c');
            }
        } catch (x) {}
        that.iframeObj.cleanup();
        that.iframeObj = null;
        that.onmessage_cb = that.iframeObj = null;
    }
};

IframeTransport.prototype.onmessage = function(e) {
    var that = this;
    if (e.origin !== that.origin) return;
    var window_id = e.data.slice(0, 8);
    var type = e.data.slice(8, 9);
    var data = e.data.slice(9);

    if (window_id !== that.window_id) return;

    switch(type) {
    case 's':
        that.iframeObj.loaded();
        that.postMessage('s', JSON.stringify([SockJS.version, that.protocol, that.trans_url, that.base_url]));
        break;
    case 't':
        that.ri._didMessage(data);
        break;
    }
};

IframeTransport.prototype.postMessage = function(type, data) {
    var that = this;
    that.iframeObj.post(that.window_id + type + (data || ''), that.origin);
};

IframeTransport.prototype.doSend = function (message) {
    this.postMessage('m', message);
};

IframeTransport.enabled = function() {
    // postMessage misbehaves in konqueror 4.6.5 - the messages are delivered with
    // huge delay, or not at all.
    var konqueror = navigator && navigator.userAgent && navigator.userAgent.indexOf('Konqueror') !== -1;
    return ((typeof _window.postMessage === 'function' ||
            typeof _window.postMessage === 'object') && (!konqueror));
};
//         [*] End of lib/trans-iframe.js


//         [*] Including lib/trans-iframe-within.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var curr_window_id;

var postMessage = function (type, data) {
    if(parent !== _window) {
        parent.postMessage(curr_window_id + type + (data || ''), '*');
    } else {
        utils.log("Can't postMessage, no parent window.", type, data);
    }
};

var FacadeJS = function() {};
FacadeJS.prototype._didClose = function (code, reason) {
    postMessage('t', utils.closeFrame(code, reason));
};
FacadeJS.prototype._didMessage = function (frame) {
    postMessage('t', frame);
};
FacadeJS.prototype._doSend = function (data) {
    this._transport.doSend(data);
};
FacadeJS.prototype._doCleanup = function () {
    this._transport.doCleanup();
};

utils.parent_origin = undefined;

SockJS.bootstrap_iframe = function() {
    var facade;
    curr_window_id = _document.location.hash.slice(1);
    var onMessage = function(e) {
        if(e.source !== parent) return;
        if(typeof utils.parent_origin === 'undefined')
            utils.parent_origin = e.origin;
        if (e.origin !== utils.parent_origin) return;

        var window_id = e.data.slice(0, 8);
        var type = e.data.slice(8, 9);
        var data = e.data.slice(9);
        if (window_id !== curr_window_id) return;
        switch(type) {
        case 's':
            var p = JSON.parse(data);
            var version = p[0];
            var protocol = p[1];
            var trans_url = p[2];
            var base_url = p[3];
            if (version !== SockJS.version) {
                utils.log("Incompatibile SockJS! Main site uses:" +
                          " \"" + version + "\", the iframe:" +
                          " \"" + SockJS.version + "\".");
            }
            if (!utils.flatUrl(trans_url) || !utils.flatUrl(base_url)) {
                utils.log("Only basic urls are supported in SockJS");
                return;
            }

            if (!utils.isSameOriginUrl(trans_url) ||
                !utils.isSameOriginUrl(base_url)) {
                utils.log("Can't connect to different domain from within an " +
                          "iframe. (" + JSON.stringify([_window.location.href, trans_url, base_url]) +
                          ")");
                return;
            }
            facade = new FacadeJS();
            facade._transport = new FacadeJS[protocol](facade, trans_url, base_url);
            break;
        case 'm':
            facade._doSend(data);
            break;
        case 'c':
            if (facade)
                facade._doCleanup();
            facade = null;
            break;
        }
    };

    // alert('test ticker');
    // facade = new FacadeJS();
    // facade._transport = new FacadeJS['w-iframe-xhr-polling'](facade, 'http://host.com:9999/ticker/12/basd');

    utils.attachMessage(onMessage);

    // Start
    postMessage('s');
};
//         [*] End of lib/trans-iframe-within.js


//         [*] Including lib/info.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var InfoReceiver = function(base_url, AjaxObject) {
    var that = this;
    utils.delay(function(){that.doXhr(base_url, AjaxObject);});
};

InfoReceiver.prototype = new EventEmitter(['finish']);

InfoReceiver.prototype.doXhr = function(base_url, AjaxObject) {
    var that = this;
    var t0 = (new Date()).getTime();
    var xo = new AjaxObject('GET', base_url + '/info');

    var tref = utils.delay(8000,
                           function(){xo.ontimeout();});

    xo.onfinish = function(status, text) {
        clearTimeout(tref);
        tref = null;
        if (status === 200) {
            var rtt = (new Date()).getTime() - t0;
            var info = JSON.parse(text);
            if (typeof info !== 'object') info = {};
            that.emit('finish', info, rtt);
        } else {
            that.emit('finish');
        }
    };
    xo.ontimeout = function() {
        xo.close();
        that.emit('finish');
    };
};

var InfoReceiverIframe = function(base_url) {
    var that = this;
    var go = function() {
        var ifr = new IframeTransport();
        ifr.protocol = 'w-iframe-info-receiver';
        var fun = function(r) {
            if (typeof r === 'string' && r.substr(0,1) === 'm') {
                var d = JSON.parse(r.substr(1));
                var info = d[0], rtt = d[1];
                that.emit('finish', info, rtt);
            } else {
                that.emit('finish');
            }
            ifr.doCleanup();
            ifr = null;
        };
        var mock_ri = {
            _options: {},
            _didClose: fun,
            _didMessage: fun
        };
        ifr.i_constructor(mock_ri, base_url, base_url);
    }
    if(!_document.body) {
        utils.attachEvent('load', go);
    } else {
        go();
    }
};
InfoReceiverIframe.prototype = new EventEmitter(['finish']);


var InfoReceiverFake = function() {
    // It may not be possible to do cross domain AJAX to get the info
    // data, for example for IE7. But we want to run JSONP, so let's
    // fake the response, with rtt=2s (rto=6s).
    var that = this;
    utils.delay(function() {
        that.emit('finish', {}, 2000);
    });
};
InfoReceiverFake.prototype = new EventEmitter(['finish']);

var createInfoReceiver = function(base_url) {
    if (utils.isSameOriginUrl(base_url)) {
        // If, for some reason, we have SockJS locally - there's no
        // need to start up the complex machinery. Just use ajax.
        return new InfoReceiver(base_url, utils.XHRLocalObject);
    }
    switch (utils.isXHRCorsCapable()) {
    case 1:
        // XHRLocalObject -> no_credentials=true
        return new InfoReceiver(base_url, utils.XHRLocalObject);
    case 2:
        return new InfoReceiver(base_url, utils.XDRObject);
    case 3:
        // Opera
        return new InfoReceiverIframe(base_url);
    default:
        // IE 7
        return new InfoReceiverFake();
    };
};


var WInfoReceiverIframe = FacadeJS['w-iframe-info-receiver'] = function(ri, _trans_url, base_url) {
    var ir = new InfoReceiver(base_url, utils.XHRLocalObject);
    ir.onfinish = function(info, rtt) {
        ri._didMessage('m'+JSON.stringify([info, rtt]));
        ri._didClose();
    }
};
WInfoReceiverIframe.prototype.doCleanup = function() {};
//         [*] End of lib/info.js


//         [*] Including lib/trans-iframe-eventsource.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var EventSourceIframeTransport = SockJS['iframe-eventsource'] = function () {
    var that = this;
    that.protocol = 'w-iframe-eventsource';
    that.i_constructor.apply(that, arguments);
};

EventSourceIframeTransport.prototype = new IframeTransport();

EventSourceIframeTransport.enabled = function () {
    return ('EventSource' in _window) && IframeTransport.enabled();
};

EventSourceIframeTransport.need_body = true;
EventSourceIframeTransport.roundTrips = 3; // html, javascript, eventsource


// w-iframe-eventsource
var EventSourceTransport = FacadeJS['w-iframe-eventsource'] = function(ri, trans_url) {
    this.run(ri, trans_url, '/eventsource', EventSourceReceiver, utils.XHRLocalObject);
}
EventSourceTransport.prototype = new AjaxBasedTransport();
//         [*] End of lib/trans-iframe-eventsource.js


//         [*] Including lib/trans-iframe-xhr-polling.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var XhrPollingIframeTransport = SockJS['iframe-xhr-polling'] = function () {
    var that = this;
    that.protocol = 'w-iframe-xhr-polling';
    that.i_constructor.apply(that, arguments);
};

XhrPollingIframeTransport.prototype = new IframeTransport();

XhrPollingIframeTransport.enabled = function () {
    return _window.XMLHttpRequest && IframeTransport.enabled();
};

XhrPollingIframeTransport.need_body = true;
XhrPollingIframeTransport.roundTrips = 3; // html, javascript, xhr


// w-iframe-xhr-polling
var XhrPollingITransport = FacadeJS['w-iframe-xhr-polling'] = function(ri, trans_url) {
    this.run(ri, trans_url, '/xhr', XhrReceiver, utils.XHRLocalObject);
};

XhrPollingITransport.prototype = new AjaxBasedTransport();
//         [*] End of lib/trans-iframe-xhr-polling.js


//         [*] Including lib/trans-iframe-htmlfile.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

// This transport generally works in any browser, but will cause a
// spinning cursor to appear in any browser other than IE.
// We may test this transport in all browsers - why not, but in
// production it should be only run in IE.

var HtmlFileIframeTransport = SockJS['iframe-htmlfile'] = function () {
    var that = this;
    that.protocol = 'w-iframe-htmlfile';
    that.i_constructor.apply(that, arguments);
};

// Inheritance.
HtmlFileIframeTransport.prototype = new IframeTransport();

HtmlFileIframeTransport.enabled = function() {
    return IframeTransport.enabled();
};

HtmlFileIframeTransport.need_body = true;
HtmlFileIframeTransport.roundTrips = 3; // html, javascript, htmlfile


// w-iframe-htmlfile
var HtmlFileTransport = FacadeJS['w-iframe-htmlfile'] = function(ri, trans_url) {
    this.run(ri, trans_url, '/htmlfile', HtmlfileReceiver, utils.XHRLocalObject);
};
HtmlFileTransport.prototype = new AjaxBasedTransport();
//         [*] End of lib/trans-iframe-htmlfile.js


//         [*] Including lib/trans-polling.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var Polling = function(ri, Receiver, recv_url, AjaxObject) {
    var that = this;
    that.ri = ri;
    that.Receiver = Receiver;
    that.recv_url = recv_url;
    that.AjaxObject = AjaxObject;
    that._scheduleRecv();
};

Polling.prototype._scheduleRecv = function() {
    var that = this;
    var poll = that.poll = new that.Receiver(that.recv_url, that.AjaxObject);
    var msg_counter = 0;
    poll.onmessage = function(e) {
        msg_counter += 1;
        that.ri._didMessage(e.data);
    };
    poll.onclose = function(e) {
        that.poll = poll = poll.onmessage = poll.onclose = null;
        if (!that.poll_is_closing) {
            if (e.reason === 'permanent') {
                that.ri._didClose(1006, 'Polling error (' + e.reason + ')');
            } else {
                that._scheduleRecv();
            }
        }
    };
};

Polling.prototype.abort = function() {
    var that = this;
    that.poll_is_closing = true;
    if (that.poll) {
        that.poll.abort();
    }
};
//         [*] End of lib/trans-polling.js


//         [*] Including lib/trans-receiver-eventsource.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var EventSourceReceiver = function(url) {
    var that = this;
    var es = new EventSource(url);
    es.onmessage = function(e) {
        that.dispatchEvent(new SimpleEvent('message',
                                           {'data': unescape(e.data)}));
    };
    that.es_close = es.onerror = function(e, abort_reason) {
        // ES on reconnection has readyState = 0 or 1.
        // on network error it's CLOSED = 2
        var reason = abort_reason ? 'user' :
            (es.readyState !== 2 ? 'network' : 'permanent');
        that.es_close = es.onmessage = es.onerror = null;
        // EventSource reconnects automatically.
        es.close();
        es = null;
        // Safari and chrome < 15 crash if we close window before
        // waiting for ES cleanup. See:
        //   https://code.google.com/p/chromium/issues/detail?id=89155
        utils.delay(200, function() {
                        that.dispatchEvent(new SimpleEvent('close', {reason: reason}));
                    });
    };
};

EventSourceReceiver.prototype = new REventTarget();

EventSourceReceiver.prototype.abort = function() {
    var that = this;
    if (that.es_close) {
        that.es_close({}, true);
    }
};
//         [*] End of lib/trans-receiver-eventsource.js


//         [*] Including lib/trans-receiver-htmlfile.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var _is_ie_htmlfile_capable;
var isIeHtmlfileCapable = function() {
    if (_is_ie_htmlfile_capable === undefined) {
        if ('ActiveXObject' in _window) {
            try {
                _is_ie_htmlfile_capable = !!new ActiveXObject('htmlfile');
            } catch (x) {}
        } else {
            _is_ie_htmlfile_capable = false;
        }
    }
    return _is_ie_htmlfile_capable;
};


var HtmlfileReceiver = function(url) {
    var that = this;
    utils.polluteGlobalNamespace();

    that.id = 'a' + utils.random_string(6, 26);
    url += ((url.indexOf('?') === -1) ? '?' : '&') +
        'c=' + escape(WPrefix + '.' + that.id);

    var constructor = isIeHtmlfileCapable() ?
        utils.createHtmlfile : utils.createIframe;

    var iframeObj;
    _window[WPrefix][that.id] = {
        start: function () {
            iframeObj.loaded();
        },
        message: function (data) {
            that.dispatchEvent(new SimpleEvent('message', {'data': data}));
        },
        stop: function () {
            that.iframe_close({}, 'network');
        }
    };
    that.iframe_close = function(e, abort_reason) {
        iframeObj.cleanup();
        that.iframe_close = iframeObj = null;
        delete _window[WPrefix][that.id];
        that.dispatchEvent(new SimpleEvent('close', {reason: abort_reason}));
    };
    iframeObj = constructor(url, function(e) {
                                that.iframe_close({}, 'permanent');
                            });
};

HtmlfileReceiver.prototype = new REventTarget();

HtmlfileReceiver.prototype.abort = function() {
    var that = this;
    if (that.iframe_close) {
        that.iframe_close({}, 'user');
    }
};
//         [*] End of lib/trans-receiver-htmlfile.js


//         [*] Including lib/trans-receiver-xhr.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var XhrReceiver = function(url, AjaxObject) {
    var that = this;
    var buf_pos = 0;

    that.xo = new AjaxObject('POST', url, null);
    that.xo.onchunk = function(status, text) {
        if (status !== 200) return;
        while (1) {
            var buf = text.slice(buf_pos);
            var p = buf.indexOf('\n');
            if (p === -1) break;
            buf_pos += p+1;
            var msg = buf.slice(0, p);
            that.dispatchEvent(new SimpleEvent('message', {data: msg}));
        }
    };
    that.xo.onfinish = function(status, text) {
        that.xo.onchunk(status, text);
        that.xo = null;
        var reason = status === 200 ? 'network' : 'permanent';
        that.dispatchEvent(new SimpleEvent('close', {reason: reason}));
    }
};

XhrReceiver.prototype = new REventTarget();

XhrReceiver.prototype.abort = function() {
    var that = this;
    if (that.xo) {
        that.xo.close();
        that.dispatchEvent(new SimpleEvent('close', {reason: 'user'}));
        that.xo = null;
    }
};
//         [*] End of lib/trans-receiver-xhr.js


//         [*] Including lib/test-hooks.js
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

// For testing
SockJS.getUtils = function(){
    return utils;
};

SockJS.getIframeTransport = function(){
    return IframeTransport;
};
//         [*] End of lib/test-hooks.js

                  return SockJS;
          })();
if ('_sockjs_onload' in window) setTimeout(_sockjs_onload, 1);

// AMD compliance
if (typeof define === 'function' && define.amd) {
    define('sockjs', [], function(){return SockJS;});
}
//     [*] End of lib/index.js

// [*] End of lib/all.js


// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.DDP = factory();
    }
}(this, function () {

    "use strict";

    var uniqueId = (function () {
        var i = 0;
        return function () {
            return (i++).toString();
        };
    })();

    var INIT_DDP_MESSAGE = "{\"server_id\":\"0\"}";
    var MAX_RECONNECT_ATTEMPTS = 10;
    var TIMER_INCREMENT = 500;
	var DDP_SERVER_MESSAGES = [
		"added", "changed", "connected", "error", "failed",
		"nosub", "ready", "removed", "result", "updated", "ping"
	];

    var DDP = function (options) {
        this._endpoint = options.endpoint;
        this._SocketConstructor = options.SocketConstructor;
        this._autoreconnect = !options.do_not_autoreconnect;
		this._debug = options.debug;
		// Subscriptions callbacks
        this._onReadyCallbacks   = {};
        this._onStopCallbacks   = {};
        this._onErrorCallbacks   = {};
		// Methods callbacks
        this._onResultCallbacks  = {};
        this._onUpdatedCallbacks = {};
        this._events = {};
		this._queue = [];
		this.readyState = -1;
		this._reconnect_count = 0;
		this._reconnect_incremental_timer = 0;
        if (!options.do_not_autoconnect) this.connect();
    };
    DDP.prototype.constructor = DDP;

    DDP.prototype.connect = function () {
		this.readyState = 0;
        this._socket = new this._SocketConstructor(this._endpoint);
        this._socket.onopen    = this._on_socket_open.bind(this);
        this._socket.onmessage = this._on_socket_message.bind(this);
        this._socket.onerror   = this._on_socket_error.bind(this);
        this._socket.onclose   = this._on_socket_close.bind(this);
    };

    DDP.prototype.method = function (name, params, onResult, onUpdated) {
        var id = uniqueId();
        this._onResultCallbacks[id] = onResult;
        this._onUpdatedCallbacks[id] = onUpdated;
        this._send({
            msg: "method",
            id: id,
            method: name,
            params: params
        });
		return id;
    };

    DDP.prototype.sub = function (name, params, onReady, onStop, onError) {
        var id = uniqueId();
        this._onReadyCallbacks[id] = onReady;
        this._onStopCallbacks[id] = onStop;
        this._onErrorCallbacks[id] = onError;
        this._send({
            msg: "sub",
            id: id,
            name: name,
            params: params
        });
		return id;
    };

    DDP.prototype.unsub = function (id) {
        this._send({
            msg: "unsub",
            id: id
        });
    };

    DDP.prototype.on = function (name, handler) {
        this._events[name] = this._events[name] || [];
        this._events[name].push(handler);
    };

    DDP.prototype.off = function (name, handler) {
        if (!this._events[name]) return;
        this._events[name].splice(this._events[name].indexOf(handler), 1);
    };

    DDP.prototype._emit = function (name /* , arguments */) {
        if (!this._events[name]) return;
        var args = arguments;
        var self = this;
        this._events[name].forEach(function (handler) {
            handler.apply(self, Array.prototype.slice.call(args, 1));
        });
    };

    DDP.prototype._send = function (object) {
		if (this.readyState !== 1 && object.msg !== "connect") {
			this._queue.push(object);
			return;
		}
        var message;
        if (typeof EJSON === "undefined") {
            message = JSON.stringify(object);
        } else {
            message = EJSON.stringify(object);
        }
        this._socket.send(message);
    };

    DDP.prototype._try_reconnect = function () {
        if (this._reconnect_count < MAX_RECONNECT_ATTEMPTS) {
            setTimeout(this.connect.bind(this), this._reconnect_incremental_timer);
        }
        this._reconnect_count += 1;
        this._reconnect_incremental_timer += TIMER_INCREMENT * this._reconnect_count;
    };

    DDP.prototype._on_result = function (data) {
		if (this._onResultCallbacks[data.id]) {
			this._onResultCallbacks[data.id](data.error, data.result);
			delete this._onResultCallbacks[data.id];
			if (data.error) delete this._onUpdatedCallbacks[data.id];
		} else {
			if (data.error) {
				delete this._onUpdatedCallbacks[data.id];
				throw data.error;
			}
		}
    };
    DDP.prototype._on_updated = function (data) {
        var self = this;
        data.methods.forEach(function (id) {
			if (self._onUpdatedCallbacks[id]) {
				self._onUpdatedCallbacks[id]();
				delete self._onUpdatedCallbacks[id];
			}
        });
    };
    DDP.prototype._on_nosub = function (data) {
		if (data.error) {
			if (!this._onErrorCallbacks[data.id]) {
				delete this._onReadyCallbacks[data.id];
				delete this._onStopCallbacks[data.id];
				throw new Error(data.error);
			}
			this._onErrorCallbacks[data.id](data.error);
			delete this._onReadyCallbacks[data.id];
			delete this._onStopCallbacks[data.id];
			delete this._onErrorCallbacks[data.id];
			return;
		}
		if (this._onStopCallbacks[data.id]) {
			this._onStopCallbacks[data.id]();
		}
		delete this._onReadyCallbacks[data.id];
		delete this._onStopCallbacks[data.id];
		delete this._onErrorCallbacks[data.id];
    };
    DDP.prototype._on_ready = function (data) {
        var self = this;
        data.subs.forEach(function (id) {
			if (self._onReadyCallbacks[id]) {
				self._onReadyCallbacks[id]();
				delete self._onReadyCallbacks[id];
			}
		});
    };

    DDP.prototype._on_error = function (data) {
        this._emit("error", data);
    };
    DDP.prototype._on_connected = function (data) {
		var firstCon = this._reconnect_count === 0;
		var eventName = firstCon ? "connected" : "reconnected";
		this.readyState = 1;
        this._reconnect_count = 0;
        this._reconnect_incremental_timer = 0;
		var length = this._queue.length;
		for (var i=0; i<length; i++) {
			this._send(this._queue.shift());
		}
		this._emit(eventName, data);
    };
    DDP.prototype._on_failed = function (data) {
		this.readyState = 4;
        this._emit("failed", data);
    };
    DDP.prototype._on_added = function (data) {
        this._emit("added", data);
    };
    DDP.prototype._on_removed = function (data) {
        this._emit("removed", data);
    };
    DDP.prototype._on_changed = function (data) {
        this._emit("changed", data);
    };
    DDP.prototype._on_ping = function (data) {
        this._send({
            msg: "pong",
            id: data.id
        });
    };

    DDP.prototype._on_socket_close = function () {
		this.readyState = 4;
        this._emit("socket_close");
        if (this._autoreconnect) this._try_reconnect();
    };
    DDP.prototype._on_socket_error = function (e) {
		this.readyState = 4;
        this._emit("socket_error", e);
    };
    DDP.prototype._on_socket_open = function () {
        this._send({
            msg: "connect",
            version: "pre1",
            support: ["pre1"]
        });
    };
    DDP.prototype._on_socket_message = function (message) {
        var data;
		if (this._debug) console.log(message);
        if (message.data === INIT_DDP_MESSAGE) return;
        try {
            if (typeof EJSON === "undefined") {
                data = JSON.parse(message.data);
            } else {
                data = EJSON.parse(message.data);
            }
			if (DDP_SERVER_MESSAGES.indexOf(data.msg) === -1) throw new Error();
        } catch (e) {
            console.warn("Non DDP message received:");
            console.warn(message.data);
			return;
		}
		this["_on_" + data.msg](data);
	};

	return DDP;

}));

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.Asteroid = factory();
    }
}(this, function () {
"use strict";

function clone (obj) {
	if (typeof EJSON !== "undefined") {
		return EJSON.clone(obj);
	}
	var type = typeof obj;
	switch (type) {
		case "undefined":
		case "function":
			return undefined;
		case "string":
		case "number":
		case "boolean":
			return obj;
		case "object":
			if (obj === null) {
				return null;
			}
			return JSON.parse(JSON.stringify(obj));
		default:
			return;
	}
}

var EventEmitter = function () {};

EventEmitter.prototype = {

	constructor: EventEmitter,

	on: function (name, handler) {
		if (!this._events) this._events = {};
		this._events[name] = this._events[name] || [];
		this._events[name].push(handler);
	},

	off: function (name, handler) {
		if (!this._events) this._events = {};
		if (!this._events[name]) return;
		this._events[name].splice(this._events[name].indexOf(handler), 1);
	},

	_emit: function (name /* , arguments */) {
		if (!this._events) this._events = {};
		if (!this._events[name]) return;
		var args = arguments;
		var self = this;
		this._events[name].forEach(function (handler) {
			handler.apply(self, Array.prototype.slice.call(args, 1));
		});
	}

};

function formQs (obj) {
	var qs = "";
	for (var key in obj) {
		qs += key + "=" + obj[key] + "&";
	}
	qs = qs.slice(0, -1);
	return qs;
}

function guid () {
	var ret = "";
	for (var i=0; i<8; i++) {
		ret += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return ret;
}

function isEmail (string) {
	return string.indexOf("@") !== -1;
}

function isEqual (obj1, obj2) {
	var str1 = JSON.stringify(obj1);
	var str2 = JSON.stringify(obj2);
	return str1 === str2;
}

var must = {};

must._toString = function (thing) {
	return Object.prototype.toString.call(thing).slice(8, -1);
};

must.beString = function (s) {
	var type = this._toString(s);
	if (type !== "String") {
		throw new Error("Assertion failed: expected String, instead got " + type);
	}
};

must.beArray = function (o) {
	var type = this._toString(o);
	if (type !== "Array") {
		throw new Error("Assertion failed: expected Array, instead got " + type);
	}
};

must.beObject = function (o) {
	var type = this._toString(o);
	if (type !== "Object") {
		throw new Error("Assertion failed: expected Object, instead got " + type);
	}
};

//////////////////////////
// Asteroid constructor //
//////////////////////////

var Asteroid = function (host, ssl, debug) {
	// Assert arguments type
	must.beString(host);
	// Configure the instance
	this._host = (ssl ? "https://" : "http://") + host;
	// If SockJS is available, use it, otherwise, use WebSocket
	// Note: SockJS is required for IE9 support
	if (typeof SockJS === "function") {
		this._ddpOptions = {
			endpoint: (ssl ? "https://" : "http://") + host + "/sockjs",
			SocketConstructor: SockJS,
			debug: debug
		};
	} else {
		this._ddpOptions = {
			endpoint: (ssl ? "wss://" : "ws://") + host + "/websocket",
			SocketConstructor: WebSocket,
			debug: debug
		};
	}
	// Reference containers
	this.collections = {};
	this.subscriptions = {};
	// Init the instance
	this._init();
};
// Asteroid instances are EventEmitter-s
Asteroid.prototype = Object.create(EventEmitter.prototype);
Asteroid.prototype.constructor = Asteroid;



////////////////////////////////
// Establishes the connection //
////////////////////////////////

Asteroid.prototype._init = function () {
	var self = this;
	// Creates the DDP instance, that will automatically
	// connect to the DDP server.
	self.ddp = new DDP(this._ddpOptions);
	// Register handlers
	self.ddp.on("connected", function () {
		// Upon connection try resuming login
		// Save the pormise it returns
		self.resumeLoginPromise = self._tryResumeLogin();
		// Subscribe to the meteor.loginServiceConfiguration
		// collection, which holds the configuration options
		// to login via third party services (oauth).
		self.ddp.sub("meteor.loginServiceConfiguration");
		// Emit the connected event
		self._emit("connected");
	});
	self.ddp.on("reconnected", function () {
		// Upon reconnection try resuming login
		// Save the pormise it returns
		self.resumeLoginPromise = self._tryResumeLogin();
		// Re-establish all previously established (and still active) subscriptions
		self._reEstablishSubscriptions();
		// Emit the reconnected event
		self._emit("reconnected");
	});
	self.ddp.on("added", function (data) {
		self._onAdded(data);
	});
	self.ddp.on("changed", function (data) {
		self._onChanged(data);
	});
	self.ddp.on("removed", function (data) {
		self._onRemoved(data);
	});
};



///////////////////////////////////////
// Handler for the ddp "added" event //
///////////////////////////////////////

Asteroid.prototype._onAdded = function (data) {
	// Get the name of the collection
	var cName = data.collection;
	// If the collection does not exist yet, create it
	if (!this.collections[cName]) {
		this.collections[cName] = new Asteroid._Collection(cName, this);
	}
	// data.fields can be undefined if the item added has only
	// the _id field . To avoid errors down the line, ensure item
	// is an object.
	var item = data.fields || {};
	item._id = data.id;
	// Perform the remote insert
	this.collections[cName]._remoteToLocalInsert(item);
};



/////////////////////////////////////////
// Handler for the ddp "removed" event //
/////////////////////////////////////////

Asteroid.prototype._onRemoved = function (data) {
	// Check the collection exists to avoid exceptions
	if (!this.collections[data.collection]) {
		return;
	}
	// Perform the reomte remove
	this.collections[data.collection]._remoteToLocalRemove(data.id);
};



/////////////////////////////////////////
// Handler for the ddp "changes" event //
/////////////////////////////////////////

Asteroid.prototype._onChanged = function (data) {
	// Check the collection exists to avoid exceptions
	if (!this.collections[data.collection]) {
		return;
	}
	// data.fields can be undefined if the update only
	// removed some properties in the item. Make sure
	// it's an object
	if (!data.fields) {
		data.fields = {};
	}
	// If there were cleared fields, explicitly set them
	// to undefined in the data.fields object. This will
	// cause those fields to be present in the for ... in
	// loop the remote update method of the collection
	// performs, causing then the fields to be actually
	// cleared from the item
	if (data.cleared) {
		data.cleared.forEach(function (key) {
			data.fields[key] = undefined;
		});
	}
	// Perform the remote update
	this.collections[data.collection]._remoteToLocalUpdate(data.id, data.fields);
};







////////////////////////////
// Call and apply methods //
////////////////////////////

Asteroid.prototype.call = function (method /* , param1, param2, ... */) {
	// Assert arguments type
	must.beString(method);
	// Get the parameters for apply
	var params = Array.prototype.slice.call(arguments, 1);
	// Call apply
	return this.apply(method, params);
};

Asteroid.prototype.apply = function (method, params) {
	// Assert arguments type
	must.beString(method);
	// If no parameters are given, use an empty array
	if (!Array.isArray(params)) {
		params = [];
	}
	// Create the result and updated promises
	var resultDeferred = Q.defer();
	var updatedDeferred = Q.defer();
	var onResult = function (err, res) {
		// The onResult handler takes care of errors
		if (err) {
			// If errors ccur, reject both promises
			resultDeferred.reject(err);
			updatedDeferred.reject();
		} else {
			// Otherwise resolve the result one
			resultDeferred.resolve(res);
		}
	};
	var onUpdated = function () {
		// Just resolve the updated promise
		updatedDeferred.resolve();
	};
	// Perform the method call
	this.ddp.method(method, params, onResult, onUpdated);
	// Return an object containing both promises
	return {
		result: resultDeferred.promise,
		updated: updatedDeferred.promise
	};
};



/////////////////////
// Syntactic sugar //
/////////////////////

Asteroid.prototype.createCollection = function (name) {
	// Assert arguments type
	must.beString(name);
	// Only create the collection if it doesn't exist
	if (!this.collections[name]) {
		this.collections[name] = new Asteroid._Collection(name, this);
	}
	return this.collections[name];
};

///////////////////////////////////////////
// Removal and update suffix for backups //
///////////////////////////////////////////

var mf_removal_suffix = "__del__";
var mf_update_suffix = "__upd__";
var is_backup = function (id) {
	var l1 = mf_removal_suffix.length;
	var l2 = mf_update_suffix.length;
	var s1 = id.slice(-1 * l1);
	var s2 = id.slice(-1 * l2);
	return s1 === mf_removal_suffix || s2 === mf_update_suffix;
};



/////////////////////////////////////////////
// Collection class constructor definition //
/////////////////////////////////////////////

var Collection = function (name, asteroidRef) {
	this.name = name;
	this.asteroid = asteroidRef;
	this._set = new Set();
};
Collection.prototype.constructor = Collection;



///////////////////////////////////////////////
// Insert-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalInsert = function (item) {
	// If an item by that id already exists, raise an exception
	if (this._set.contains(item._id)) {
		throw new Error("Item " + item._id + " already exists");
	}
	this._set.put(item._id, item);
	// Return a promise, just for api consistency
	return Q(item._id);
};
Collection.prototype._remoteToLocalInsert = function (item) {
	// The server is the SSOT, add directly
	this._set.put(item._id, item);
};
Collection.prototype._localToRemoteInsert = function (item) {
	var self = this;
	var deferred = Q.defer();
	// Construct the name of the method we need to call
	var methodName = "/" + self.name + "/insert";
	self.asteroid.ddp.method(methodName, [item], function (err, res) {
		if (err) {
			// On error restore the database and reject the promise
			self._set.del(item._id);
			deferred.reject(err);
		} else {
			// Else resolve the promise
			deferred.resolve(item._id);
		}
	});
	return deferred.promise;
};
Collection.prototype.insert = function (item) {
	// If the time has no id, generate one for it
	if (!item._id) {
		item._id = guid();
	}
	return {
		// Perform the local insert
		local: this._localToLocalInsert(item),
		// Send the insert request
		remote: this._localToRemoteInsert(item)
	};
};



///////////////////////////////////////////////
// Remove-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalRemove = function (id) {
	// Check if the item exists in the database
	var existing = this._set.get(id);
	if (existing) {
		// Create a backup of the object to delete
		this._set.put(id + mf_removal_suffix, existing);
		// Delete the object
		this._set.del(id);
	}
	// Return a promise, just for api consistency
	return Q(id);
};
Collection.prototype._remoteToLocalRemove = function (id) {
	// The server is the SSOT, remove directly (item and backup)
	this._set.del(id);
};
Collection.prototype._localToRemoteRemove = function (id) {
	var self = this;
	var deferred = Q.defer();
	// Construct the name of the method we need to call
	var methodName = "/" + self.name + "/remove";
	self.asteroid.ddp.method(methodName, [{_id: id}], function (err, res) {
		if (err) {
			// On error restore the database and reject the promise
			var backup = self._set.get(id + mf_removal_suffix);
			// Ensure there is a backup
			if (backup) {
				self._set.put(id, backup);
				self._set.del(id + mf_removal_suffix);
			}
			deferred.reject(err);
		} else {
			// Else, delete the (possible) backup and resolve the promise
			self._set.del(id + mf_removal_suffix);
			deferred.resolve(id);
		}
	});
	return deferred.promise;
};
Collection.prototype.remove = function (id) {
	return {
		// Perform the local remove
		local: this._localToLocalRemove(id),
		// Send the remove request
		remote: this._localToRemoteRemove(id)
	};
};



///////////////////////////////////////////////
// Update-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalUpdate = function (id, fields) {
	// Ensure the item actually exists
	var existing = this._set.get(id);
	if (!existing) {
		throw new Error("Item " + id + " doesn't exist");
	}
	// Ensure the _id property won't get modified
	if (fields._id && fields._id !== id) {
		throw new Error("Modifying the _id of a document is not allowed");
	}
	// Create a backup
	this._set.put(id + mf_update_suffix, existing);
	// Perform the update
	for (var field in fields) {
		existing[field] = fields[field];
	}
	this._set.put(id, existing);
	// Return a promise, just for api consistency
	return Q(id);
};
Collection.prototype._remoteToLocalUpdate = function (id, fields) {
	// Ensure the item exixts in the database
	var existing = this._set.get(id);
	if (!existing) {
		console.warn("Server misbehaviour: item " + id + " doesn't exist");
		return;
	}
	for (var field in fields) {
		// Ensure the server is not trying to moify the item _id
		if (field === "_id" && fields._id !== id) {
			console.warn("Server misbehaviour: modifying the _id of a document is not allowed");
			return;
		}
		existing[field] = fields[field];
	}
	// Perform the update
	this._set.put(id, existing);
};
Collection.prototype._localToRemoteUpdate = function (id, fields) {
	var self = this;
	var deferred = Q.defer();
	// Construct the name of the method we need to call
	var methodName = "/" + self.name + "/update";
	// Construct the selector
	var sel = {
		_id: id
	};
	// Construct the modifier
	var mod = {
		$set: fields
	};
	self.asteroid.ddp.method(methodName, [sel, mod], function (err, res) {
		if (err) {
			// On error restore the database and reject the promise
			var backup = self._set.get(id + mf_update_suffix);
			self._set.put(id, backup);
			self._set.del(id + mf_update_suffix);
			deferred.reject(err);
		} else {
			// Else, delete the (possible) backup and resolve the promise
			self._set.del(id + mf_update_suffix);
			deferred.resolve(id);
		}
	});
	return deferred.promise;
};
Collection.prototype.update = function (id, fields) {
	return {
		// Perform the local update
		local: this._localToLocalUpdate(id, fields),
		// Send the update request
		remote: this._localToRemoteUpdate(id, fields)
	};
};



//////////////////////////////
// Reactive queries methods //
//////////////////////////////

var ReactiveQuery = function (set) {
	var self = this;
	self.result = [];

	self._set = set;
	self._getResult();

	self._set.on("put", function (id) {
		self._getResult();
		self._emit("change", id);
	});
	self._set.on("del", function (id) {
		self._getResult();
		self._emit("change", id);
	});

};
ReactiveQuery.prototype = Object.create(EventEmitter.prototype);
ReactiveQuery.constructor = ReactiveQuery;

ReactiveQuery.prototype._getResult = function () {
	this.result = this._set.toArray();
};

var getFilterFromSelector = function (selector) {
	// Return the filter function
	return function (id, item) {

		// Filter out backups
		if (is_backup(id)) {
			return false;
		}

		// Get the value of the object from a compund key
		// (e.g. "profile.name.first")
		var getItemVal = function (item, key) {
			return key.split(".").reduce(function (prev, curr) {
				if (!prev) return prev;
				prev = prev[curr];
				return prev;
			}, item);
		};

		// Iterate all the keys in the selector. The first that
		// doesn't match causes the item to be filtered out.
		for (var key in selector) {
			var itemVal = getItemVal(item, key);
			if (itemVal !== selector[key]) {
				return false;
			}
		}

		// At this point the item matches the selector
		return true;

	};
};

Collection.prototype.reactiveQuery = function (selectorOrFilter) {
	var filter;
	if (typeof selectorOrFilter === "function") {
		filter = selectorOrFilter;
	} else {
		filter = getFilterFromSelector(selectorOrFilter);
	}
	var subset = this._set.filter(filter);
	return new ReactiveQuery(subset);
};



Asteroid._Collection = Collection;

Asteroid.prototype._getOauthClientId = function (serviceName) {
	var loginConfigCollectionName = "meteor_accounts_loginServiceConfiguration";
	var loginConfigCollection = this.collections[loginConfigCollectionName];
	var service = loginConfigCollection.reactiveQuery({service: serviceName}).result[0];
	return service.clientId || service.consumerKey || service.appId;
};

Asteroid.prototype._initOauthLogin = function (service, credentialToken, loginUrl) {
	var popup = window.open(loginUrl, "Login");
	var self = this;
	return Q()
		.then(function () {
			var deferred = Q.defer();
			if (popup.focus) popup.focus();
			var intervalId = setInterval(function () {
				if (popup.closed || popup.closed === undefined) {
					clearInterval(intervalId);
					deferred.resolve();
				}
			}, 100);
			return deferred.promise;
		})
		.then(function () {
			var deferred = Q.defer();
			var loginParameters = {
				oauth: {
					credentialToken: credentialToken
				}
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) {
					delete self.userId;
					delete self.loggedIn;
					delete localStorage[self._host + "__login_token__"];
					deferred.reject(err);
					self._emit("loginError", err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					localStorage[self._host + "__login_token__"] = res.token;
					self._emit("login", res.id);
					deferred.resolve(res.id);
				}
			});
			return deferred.promise;
		});
};

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	var deferred = Q.defer();
	var token = localStorage[self._host + "__login_token__"];
	if (!token) {
		deferred.reject("No login token");
		return deferred.promise;
	}
	var loginParameters = {
		resume: token
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			delete localStorage[self._host + "__login_token__"];
			self._emit("loginError", err);
			deferred.reject(err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorage[self._host + "__login_token__"] = res.token;
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.loginWithFacebook = function (scope) {
	var credentialToken = guid();
	var query = {
		client_id:		this._getOauthClientId("facebook"),
		redirect_uri:	this._host + "/_oauth/facebook?close",
		state:			credentialToken,
		scope:			scope || "email"
	};
	var loginUrl = "https://www.facebook.com/dialog/oauth?" + formQs(query);
	return this._initOauthLogin("facebook", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithGoogle = function (scope) {
	var credentialToken = guid();
	var query = {
		response_type:	"code",
		client_id:		this._getOauthClientId("google"),
		redirect_uri:	this._host + "/_oauth/google?close",
		state:			credentialToken,
		scope:			scope || "openid email"
	};
	var loginUrl = "https://accounts.google.com/o/oauth2/auth?" + formQs(query);
	return this._initOauthLogin("google", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithGithub = function (scope) {
	var credentialToken = guid();
	var query = {
		client_id:		this._getOauthClientId("github"),
		redirect_uri:	this._host + "/_oauth/github?close",
		state:			credentialToken,
		scope:			scope || "email"
	};
	var loginUrl = "https://github.com/login/oauth/authorize?" + formQs(query);
	return this._initOauthLogin("github", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithTwitter = function (scope) {
	var credentialToken = guid();
	var callbackUrl = this._host + "/_oauth/twitter?close&state=" + credentialToken;
	var query = {
		requestTokenAndRedirect:	encodeURIComponent(callbackUrl),
		state:						credentialToken
	};
	var loginUrl = this._host + "/_oauth/twitter/?" + formQs(query);
	return this._initOauthLogin("twitter", credentialToken, loginUrl);
};

Asteroid.prototype.createUser = function (usernameOrEmail, password, profile) {
	var self = this;
	var deferred = Q.defer();
	var options = {
		username: isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
		email: isEmail(usernameOrEmail) ? usernameOrEmail : undefined,
		password: password,
		profile: profile
	};
	self.ddp.method("createUser", [options], function (err, res) {
		if (err) {
			self._emit("createUserError", err);
			deferred.reject(err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorage[self._host + "__login_token__"] = res.token;
			self._emit("createUser", res.id);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.loginWithPassword = function (usernameOrEmail, password) {
	var self = this;
	var deferred = Q.defer();
	var loginParameters = {
		password: password,
		user: {
			username: isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
			email: isEmail(usernameOrEmail) ? usernameOrEmail : undefined
		}
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			delete localStorage[self._host + "__login_token__"];
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorage[self._host + "__login_token__"] = res.token;
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.logout = function () {
	var self = this;
	var deferred = Q.defer();
	self.ddp.method("logout", [], function (err, res) {
		if (err) {
			self._emit("logoutError", err);
			deferred.reject(err);
		} else {
			delete self.userId;
			delete self.loggedIn;
			delete localStorage[self._host + "__login_token__"];
			self._emit("logout");
			deferred.resolve();
		}
	});
	return deferred.promise;
};

var Set = function (readonly) {
	// Allow readonly sets
	if (readonly) {
		// Make the put and del methods private
		this._put = this.put;
		this._del = this.del;
		// Replace them with a throwy function
		this.put = this.del = function () {
			throw new Error("Attempt to modify readonly set");
		};
	}
	this._items = {};
};
// Inherit from EventEmitter
Set.prototype = Object.create(EventEmitter.prototype);
Set.constructor = Set;

Set.prototype.put = function (id, item) {
	// Assert arguments type
	must.beString(id);
	must.beObject(item);
	// Save a clone to avoid collateral damage
	this._items[id] = clone(item);
	this._emit("put", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.del = function (id) {
	// Assert arguments type
	must.beString(id);
	delete this._items[id];
	this._emit("del", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.get = function (id) {
	// Assert arguments type
	must.beString(id);
	// Return a clone to avoid collateral damage
	return clone(this._items[id]);
};

Set.prototype.contains = function (id) {
	// Assert arguments type
	must.beString(id);
	return !!this._items[id];
};

Set.prototype.filter = function (belongFn) {

	// Creates the subset
	var sub = new Set(true);

	// Keep a reference to the _items hash
	var items = this._items;

	// Performs the initial puts
	var ids = Object.keys(items);
	ids.forEach(function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = clone(items[id]);
		var belongs = belongFn(id, itemClone);
		if (belongs) {
			sub._items[id] = items[id];
		}
	});

	// Listens to the put and del events
	// to automatically update the subset
	this.on("put", function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = clone(items[id]);
		var belongs = belongFn(id, itemClone);
		if (belongs) {
			sub._put(id, items[id]);
		}
	});
	this.on("del", function (id) {
		sub._del(id);
	});

	// Returns the subset
	return sub;
};

Set.prototype.toArray = function () {
	var array = [];
	var items = this._items;
	var ids = Object.keys(this._items);
	ids.forEach(function (id) {
		array.push(items[id]);
	});
	// Return a clone to avoid collateral damage
	return clone(array);
};

Set.prototype.toHash = function () {
	// Return a clone to avoid collateral damage
	return clone(this._items);
};

Asteroid.Set = Set;

////////////////////////
// Subscription class //
////////////////////////

var Subscription = function (name, params, asteroid) {
	this._name = name;
	this._params = params;
	this._asteroid = asteroid;
	// Subscription promises
	this._ready = Q.defer();
	this.ready = this._ready.promise;
	// Subscribe via DDP
	var or = this._onReady.bind(this);
	var os = this._onStop.bind(this);
	var oe = this._onError.bind(this);
	this.id = asteroid.ddp.sub(name, params, or, os, oe);
};
Subscription.constructor = Subscription;

Subscription.prototype.stop = function () {
	this._asteroid.ddp.unsub(this.id);
};

Subscription.prototype._onReady = function () {
	this._ready.resolve();
};

Subscription.prototype._onStop = function () {
	delete this._asteroid.subscriptions[this.id];
};

Subscription.prototype._onError = function (err) {
	if (this.ready.isPending()) {
		this._ready.reject(err);
	}
	delete this._asteroid.subscriptions[this.id];
};



//////////////////////
// Subscribe method //
//////////////////////

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	// Assert arguments type
	must.beString(name);
	// Collect arguments into array
	var params = Array.prototype.slice.call(arguments, 1);
	var sub = new Subscription(name, params, this);
	this.subscriptions[sub.id] = sub;
	return sub;
};

Asteroid.prototype._reEstablishSubscriptions = function () {
	var subs = this.subscriptions;
	for (var id in subs) {
		subs[id] = new Subscription(subs[id]._name, subs[id]._params, this);
	}
};

return Asteroid;

}));

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

if (typeof module === 'object') {
    module.exports = MediumEditor;
}

(function (window, document) {
    'use strict';

    function extend(b, a) {
        var prop;
        if (b === undefined) {
            return a;
        }
        for (prop in a) {
            if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop) === false) {
                b[prop] = a[prop];
            }
        }
        return b;
    }

    // http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
    // by Tim Down
    function saveSelection() {
        var i,
            len,
            ranges,
            sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            ranges = [];
            for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
        return null;
    }

    function restoreSelection(savedSel) {
        var i,
            len,
            sel = window.getSelection();
        if (savedSel) {
            sel.removeAllRanges();
            for (i = 0, len = savedSel.length; i < len; i += 1) {
                sel.addRange(savedSel[i]);
            }
        }
    }

    // http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
    // by You
    function getSelectionStart() {
        var node = document.getSelection().anchorNode,
            startNode = (node && node.nodeType === 3 ? node.parentNode : node);
        return startNode;
    }

    // http://stackoverflow.com/questions/4176923/html-of-selected-text
    // by Tim Down
    function getSelectionHtml() {
        var i,
            html = '',
            sel,
            len,
            container;
        if (window.getSelection !== undefined) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                container = document.createElement('div');
                for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (document.selection !== undefined) {
            if (document.selection.type === 'Text') {
                html = document.selection.createRange().htmlText;
            }
        }
        return html;
    }

    // https://github.com/jashkenas/underscore
    function isElement(obj) {
        return !!(obj && obj.nodeType === 1);
    }

    MediumEditor.prototype = {
        defaults: {
            allowMultiParagraphSelection: true,
            anchorInputPlaceholder: 'Paste or type a link',
            anchorPreviewHideDelay: 500,
            buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
            buttonLabels: false,
            checkLinkFormat: false,
            cleanPastedHTML: false,
            delay: 0,
            diffLeft: 0,
            diffTop: -10,
            disableReturn: false,
            disableDoubleReturn: false,
            disableToolbar: false,
            disableEditing: false,
            elementsContainer: false,
            firstHeader: 'h3',
            forcePlainText: true,
            placeholder: 'Type your text',
            secondHeader: 'h4',
            targetBlank: false,
            extensions: {}
        },

        // http://stackoverflow.com/questions/17907445/how-to-detect-ie11#comment30165888_17907562
        // by rg89
        isIE: ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null))),

        init: function (elements, options) {
            this.setElementSelection(elements);
            if (this.elements.length === 0) {
                return;
            }
            this.parentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'];
            this.id = document.querySelectorAll('.medium-editor-toolbar').length + 1;
            this.options = extend(options, this.defaults);
            return this.setup();
        },

        setup: function () {
            this.isActive = true;
            this.initElements()
                .bindSelect()
                .bindPaste()
                .setPlaceholders()
                .bindWindowActions();
        },

        initElements: function () {
            this.updateElementList();
            var i,
                addToolbar = false;
            for (i = 0; i < this.elements.length; i += 1) {
                if (!this.options.disableEditing && !this.elements[i].getAttribute('data-disable-editing')) {
                    this.elements[i].setAttribute('contentEditable', true);
                }
                if (!this.elements[i].getAttribute('data-placeholder')) {
                    this.elements[i].setAttribute('data-placeholder', this.options.placeholder);
                }
                this.elements[i].setAttribute('data-medium-element', true);
                this.bindParagraphCreation(i).bindReturn(i).bindTab(i);
                if (!this.options.disableToolbar && !this.elements[i].getAttribute('data-disable-toolbar')) {
                    addToolbar = true;
                }
            }
            // Init toolbar
            if (addToolbar) {
                if (!this.options.elementsContainer) {
                    this.options.elementsContainer = document.body;
                }
                this.initToolbar()
                    .bindButtons()
                    .bindAnchorForm()
                    .bindAnchorPreview();
            }
            return this;
        },

        setElementSelection: function (selector) {
            this.elementSelection = selector;
            this.updateElementList();
        },

        updateElementList: function () {
            this.elements = typeof this.elementSelection === 'string' ? document.querySelectorAll(this.elementSelection) : this.elementSelection;
            if (this.elements.nodeType === 1) {
                this.elements = [this.elements];
            }
        },

        serialize: function () {
            var i,
                elementid,
                content = {};
            for (i = 0; i < this.elements.length; i += 1) {
                elementid = (this.elements[i].id !== '') ? this.elements[i].id : 'element-' + i;
                content[elementid] = {
                    value: this.elements[i].innerHTML.trim()
                };
            }
            return content;
        },

        /**
         * Helper function to call a method with a number of parameters on all registered extensions.
         * The function assures that the function exists before calling.
         *
         * @param {string} funcName name of the function to call
         * @param [args] arguments passed into funcName
         */
        callExtensions: function (funcName) {
            if (arguments.length < 1) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                ext,
                name;

            for (name in this.options.extensions) {
                if (this.options.extensions.hasOwnProperty(name)) {
                    ext = this.options.extensions[name];
                    if (ext[funcName] !== undefined) {
                        ext[funcName].apply(ext, args);
                    }
                }
            }
        },

        bindParagraphCreation: function (index) {
            var self = this;
            this.elements[index].addEventListener('keypress', function (e) {
                var node = getSelectionStart(),
                    tagName;
                if (e.which === 32) {
                    tagName = node.tagName.toLowerCase();
                    if (tagName === 'a') {
                        document.execCommand('unlink', false, null);
                    }
                }
            });

            this.elements[index].addEventListener('keyup', function (e) {
                var node = getSelectionStart(),
                    tagName;
                if (node && node.getAttribute('data-medium-element') && node.children.length === 0 && !(self.options.disableReturn || node.getAttribute('data-disable-return'))) {
                    document.execCommand('formatBlock', false, 'p');
                }
                if (e.which === 13) {
                    node = getSelectionStart();
                    tagName = node.tagName.toLowerCase();
                    if (!(self.options.disableReturn || this.getAttribute('data-disable-return')) &&
                        tagName !== 'li' && !self.isListItemChild(node)) {
                        if (!e.shiftKey) {
                            document.execCommand('formatBlock', false, 'p');
                        }
                        if (tagName === 'a') {
                            document.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        },

        isListItemChild: function (node) {
            var parentNode = node.parentNode,
                tagName = parentNode.tagName.toLowerCase();
            while (this.parentElements.indexOf(tagName) === -1 && tagName !== 'div') {
                if (tagName === 'li') {
                    return true;
                }
                parentNode = parentNode.parentNode;
                if (parentNode && parentNode.tagName) {
                    tagName = parentNode.tagName.toLowerCase();
                } else {
                    return false;
                }
            }
            return false;
        },

        bindReturn: function (index) {
            var self = this;
            this.elements[index].addEventListener('keypress', function (e) {
                if (e.which === 13) {
                    if (self.options.disableReturn || this.getAttribute('data-disable-return')) {
                        e.preventDefault();
                    } else if (self.options.disableDoubleReturn || this.getAttribute('data-disable-double-return')) {
                        var node = getSelectionStart();
                        if (node && node.innerText === '\n') {
                            e.preventDefault();
                        }
                    }
                }
            });
            return this;
        },

        bindTab: function (index) {
            this.elements[index].addEventListener('keydown', function (e) {
                if (e.which === 9) {
                    // Override tab only for pre nodes
                    var tag = getSelectionStart().tagName.toLowerCase();
                    if (tag === 'pre') {
                        e.preventDefault();
                        document.execCommand('insertHtml', null, '    ');
                    }
                }
            });
            return this;
        },

        buttonTemplate: function (btnType) {
            var buttonLabels = this.getButtonLabels(this.options.buttonLabels),
                buttonTemplates = {
                    'bold': '<button class="medium-editor-action medium-editor-action-bold" data-action="bold" data-element="b">' + buttonLabels.bold + '</button>',
                    'italic': '<button class="medium-editor-action medium-editor-action-italic" data-action="italic" data-element="i">' + buttonLabels.italic + '</button>',
                    'underline': '<button class="medium-editor-action medium-editor-action-underline" data-action="underline" data-element="u">' + buttonLabels.underline + '</button>',
                    'strikethrough': '<button class="medium-editor-action medium-editor-action-strikethrough" data-action="strikethrough" data-element="strike"><strike>A</strike></button>',
                    'superscript': '<button class="medium-editor-action medium-editor-action-superscript" data-action="superscript" data-element="sup">' + buttonLabels.superscript + '</button>',
                    'subscript': '<button class="medium-editor-action medium-editor-action-subscript" data-action="subscript" data-element="sub">' + buttonLabels.subscript + '</button>',
                    'anchor': '<button class="medium-editor-action medium-editor-action-anchor" data-action="anchor" data-element="a">' + buttonLabels.anchor + '</button>',
                    'image': '<button class="medium-editor-action medium-editor-action-image" data-action="image" data-element="img">' + buttonLabels.image + '</button>',
                    'header1': '<button class="medium-editor-action medium-editor-action-header1" data-action="append-' + this.options.firstHeader + '" data-element="' + this.options.firstHeader + '">' + buttonLabels.header1 + '</button>',
                    'header2': '<button class="medium-editor-action medium-editor-action-header2" data-action="append-' + this.options.secondHeader + '" data-element="' + this.options.secondHeader + '">' + buttonLabels.header2 + '</button>',
                    'quote': '<button class="medium-editor-action medium-editor-action-quote" data-action="append-blockquote" data-element="blockquote">' + buttonLabels.quote + '</button>',
                    'orderedlist': '<button class="medium-editor-action medium-editor-action-orderedlist" data-action="insertorderedlist" data-element="ol">' + buttonLabels.orderedlist + '</button>',
                    'unorderedlist': '<button class="medium-editor-action medium-editor-action-unorderedlist" data-action="insertunorderedlist" data-element="ul">' + buttonLabels.unorderedlist + '</button>',
                    'pre': '<button class="medium-editor-action medium-editor-action-pre" data-action="append-pre" data-element="pre">' + buttonLabels.pre + '</button>',
                    'indent': '<button class="medium-editor-action medium-editor-action-indent" data-action="indent" data-element="ul">' + buttonLabels.indent + '</button>',
                    'outdent': '<button class="medium-editor-action medium-editor-action-outdent" data-action="outdent" data-element="ul">' + buttonLabels.outdent + '</button>'
                };
            return buttonTemplates[btnType] || false;
        },

        // TODO: break method
        getButtonLabels: function (buttonLabelType) {
            var customButtonLabels,
                attrname,
                buttonLabels = {
                    'bold': '<b>B</b>',
                    'italic': '<b><i>I</i></b>',
                    'underline': '<b><u>U</u></b>',
                    'superscript': '<b>x<sup>1</sup></b>',
                    'subscript': '<b>x<sub>1</sub></b>',
                    'anchor': '<b>#</b>',
                    'image': '<b>image</b>',
                    'header1': '<b>H1</b>',
                    'header2': '<b>H2</b>',
                    'quote': '<b>&ldquo;</b>',
                    'orderedlist': '<b>1.</b>',
                    'unorderedlist': '<b>&bull;</b>',
                    'pre': '<b>0101</b>',
                    'indent': '<b>&rarr;</b>',
                    'outdent': '<b>&larr;</b>'
                };
            if (buttonLabelType === 'fontawesome') {
                customButtonLabels = {
                    'bold': '<i class="fa fa-bold"></i>',
                    'italic': '<i class="fa fa-italic"></i>',
                    'underline': '<i class="fa fa-underline"></i>',
                    'superscript': '<i class="fa fa-superscript"></i>',
                    'subscript': '<i class="fa fa-subscript"></i>',
                    'anchor': '<i class="fa fa-link"></i>',
                    'image': '<i class="fa fa-picture-o"></i>',
                    'quote': '<i class="fa fa-quote-right"></i>',
                    'orderedlist': '<i class="fa fa-list-ol"></i>',
                    'unorderedlist': '<i class="fa fa-list-ul"></i>',
                    'pre': '<i class="fa fa-code fa-lg"></i>',
                    'indent': '<i class="fa fa-indent"></i>',
                    'outdent': '<i class="fa fa-outdent"></i>'
                };
            } else if (typeof buttonLabelType === 'object') {
                customButtonLabels = buttonLabelType;
            }
            if (typeof customButtonLabels === 'object') {
                for (attrname in customButtonLabels) {
                    if (customButtonLabels.hasOwnProperty(attrname)) {
                        buttonLabels[attrname] = customButtonLabels[attrname];
                    }
                }
            }
            return buttonLabels;
        },

        initToolbar: function () {
            if (this.toolbar) {
                return this;
            }
            this.toolbar = this.createToolbar();
            this.keepToolbarAlive = false;
            this.anchorForm = this.toolbar.querySelector('.medium-editor-toolbar-form-anchor');
            this.anchorInput = this.anchorForm.querySelector('input');
            this.toolbarActions = this.toolbar.querySelector('.medium-editor-toolbar-actions');
            this.anchorPreview = this.createAnchorPreview();

            return this;
        },

        createToolbar: function () {
            var toolbar = document.createElement('div');
            toolbar.id = 'medium-editor-toolbar-' + this.id;
            toolbar.className = 'medium-editor-toolbar';
            toolbar.appendChild(this.toolbarButtons());
            toolbar.appendChild(this.toolbarFormAnchor());
            this.options.elementsContainer.appendChild(toolbar);
            return toolbar;
        },

        //TODO: actionTemplate
        toolbarButtons: function () {
            var btns = this.options.buttons,
                ul = document.createElement('ul'),
                li,
                i,
                btn,
                ext;

            ul.id = 'medium-editor-toolbar-actions';
            ul.className = 'medium-editor-toolbar-actions clearfix';

            for (i = 0; i < btns.length; i += 1) {
                if (this.options.extensions.hasOwnProperty(btns[i])) {
                    ext = this.options.extensions[btns[i]];
                    btn = ext.getButton !== undefined ? ext.getButton() : null;
                } else {
                    btn = this.buttonTemplate(btns[i]);
                }

                if (btn) {
                    li = document.createElement('li');
                    if (isElement(btn)) {
                        li.appendChild(btn);
                    } else {
                        li.innerHTML = btn;
                    }
                    ul.appendChild(li);
                }
            }

            return ul;
        },

        toolbarFormAnchor: function () {
            var anchor = document.createElement('div'),
                input = document.createElement('input'),
                a = document.createElement('a');

            a.setAttribute('href', '#');
            a.innerHTML = '&times;';

            input.setAttribute('type', 'text');
            input.setAttribute('placeholder', this.options.anchorInputPlaceholder);

            anchor.className = 'medium-editor-toolbar-form-anchor';
            anchor.id = 'medium-editor-toolbar-form-anchor';
            anchor.appendChild(input);
            anchor.appendChild(a);

            return anchor;
        },

        bindSelect: function () {
            var self = this,
                timer = '',
                i;

            this.checkSelectionWrapper = function (e) {

                // Do not close the toolbar when bluring the editable area and clicking into the anchor form
                if (e && self.clickingIntoArchorForm(e)) {
                    return false;
                }

                clearTimeout(timer);
                timer = setTimeout(function () {
                    self.checkSelection();
                }, self.options.delay);
            };

            document.documentElement.addEventListener('mouseup', this.checkSelectionWrapper);

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('keyup', this.checkSelectionWrapper);
                this.elements[i].addEventListener('blur', this.checkSelectionWrapper);
            }
            return this;
        },

        checkSelection: function () {
            var newSelection,
                selectionElement;

            if (this.keepToolbarAlive !== true && !this.options.disableToolbar) {
                newSelection = window.getSelection();
                if (newSelection.toString().trim() === '' ||
                    (this.options.allowMultiParagraphSelection === false && this.hasMultiParagraphs())) {
                    this.hideToolbarActions();
                } else {
                    selectionElement = this.getSelectionElement();
                    if (!selectionElement || selectionElement.getAttribute('data-disable-toolbar')) {
                        this.hideToolbarActions();
                    } else {
                        this.checkSelectionElement(newSelection, selectionElement);
                    }
                }
            }
            return this;
        },

        clickingIntoArchorForm: function (e) {
            var self = this;
            if (e.type && e.type.toLowerCase() === 'blur' && e.relatedTarget && e.relatedTarget === self.anchorInput) {
                return true;
            }
            return false;
        },

        hasMultiParagraphs: function () {
            var selectionHtml = getSelectionHtml().replace(/<[\S]+><\/[\S]+>/gim, ''),
                hasMultiParagraphs = selectionHtml.match(/<(p|h[0-6]|blockquote)>([\s\S]*?)<\/(p|h[0-6]|blockquote)>/g);

            return (hasMultiParagraphs ? hasMultiParagraphs.length : 0);
        },

        checkSelectionElement: function (newSelection, selectionElement) {
            var i;
            this.selection = newSelection;
            this.selectionRange = this.selection.getRangeAt(0);
            for (i = 0; i < this.elements.length; i += 1) {
                if (this.elements[i] === selectionElement) {
                    this.setToolbarButtonStates()
                        .setToolbarPosition()
                        .showToolbarActions();
                    return;
                }
            }
            this.hideToolbarActions();
        },

        getSelectionElement: function () {
            var selection = window.getSelection(),
                range, current, parent,
                result,
                getMediumElement = function (e) {
                    var localParent = e;
                    try {
                        while (!localParent.getAttribute('data-medium-element')) {
                            localParent = localParent.parentNode;
                        }
                    } catch (errb) {
                        return false;
                    }
                    return localParent;
                };
            // First try on current node
            try {
                range = selection.getRangeAt(0);
                current = range.commonAncestorContainer;
                parent = current.parentNode;

                if (current.getAttribute('data-medium-element')) {
                    result = current;
                } else {
                    result = getMediumElement(parent);
                }
                // If not search in the parent nodes.
            } catch (err) {
                result = getMediumElement(parent);
            }
            return result;
        },

        setToolbarPosition: function () {
            var buttonHeight = 50,
                selection = window.getSelection(),
                range = selection.getRangeAt(0),
                boundary = range.getBoundingClientRect(),
                defaultLeft = (this.options.diffLeft) - (this.toolbar.offsetWidth / 2),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth = this.toolbar.offsetWidth / 2;
            if (boundary.top < buttonHeight) {
                this.toolbar.classList.add('medium-toolbar-arrow-over');
                this.toolbar.classList.remove('medium-toolbar-arrow-under');
                this.toolbar.style.top = buttonHeight + boundary.bottom - this.options.diffTop + window.pageYOffset - this.toolbar.offsetHeight + 'px';
            } else {
                this.toolbar.classList.add('medium-toolbar-arrow-under');
                this.toolbar.classList.remove('medium-toolbar-arrow-over');
                this.toolbar.style.top = boundary.top + this.options.diffTop + window.pageYOffset - this.toolbar.offsetHeight + 'px';
            }
            if (middleBoundary < halfOffsetWidth) {
                this.toolbar.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((window.innerWidth - middleBoundary) < halfOffsetWidth) {
                this.toolbar.style.left = window.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                this.toolbar.style.left = defaultLeft + middleBoundary + 'px';
            }

            this.hideAnchorPreview();

            return this;
        },

        setToolbarButtonStates: function () {
            var buttons = this.toolbarActions.querySelectorAll('button'),
                i;
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].classList.remove('medium-editor-button-active');
            }
            this.checkActiveButtons();
            return this;
        },

        checkActiveButtons: function () {
            var elements = Array.prototype.slice.call(this.elements),
                parentNode = this.getSelectedParentElement();
            while (parentNode.tagName !== undefined && this.parentElements.indexOf(parentNode.tagName.toLowerCase) === -1) {
                this.activateButton(parentNode.tagName.toLowerCase());
                this.callExtensions('checkState', parentNode);

                // we can abort the search upwards if we leave the contentEditable element
                if (elements.indexOf(parentNode) !== -1) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
        },

        activateButton: function (tag) {
            var el = this.toolbar.querySelector('[data-element="' + tag + '"]');
            if (el !== null && el.className.indexOf('medium-editor-button-active') === -1) {
                el.className += ' medium-editor-button-active';
            }
        },

        bindButtons: function () {
            var buttons = this.toolbar.querySelectorAll('button'),
                i,
                self = this,
                triggerAction = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (self.selection === undefined) {
                        self.checkSelection();
                    }
                    if (this.className.indexOf('medium-editor-button-active') > -1) {
                        this.classList.remove('medium-editor-button-active');
                    } else {
                        this.className += ' medium-editor-button-active';
                    }
                    if (this.hasAttribute('data-action')) {
                        self.execAction(this.getAttribute('data-action'), e);
                    }
                };
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].addEventListener('click', triggerAction);
            }
            this.setFirstAndLastItems(buttons);
            return this;
        },

        setFirstAndLastItems: function (buttons) {
            if (buttons.length > 0) {
                buttons[0].className += ' medium-editor-button-first';
                buttons[buttons.length - 1].className += ' medium-editor-button-last';
            }
            return this;
        },

        execAction: function (action, e) {
            if (action.indexOf('append-') > -1) {
                this.execFormatBlock(action.replace('append-', ''));
                this.setToolbarPosition();
                this.setToolbarButtonStates();
            } else if (action === 'anchor') {
                this.triggerAnchorAction(e);
            } else if (action === 'image') {
                document.execCommand('insertImage', false, window.getSelection());
            } else {
                document.execCommand(action, false, null);
                this.setToolbarPosition();
            }
        },

        // http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
        rangeSelectsSingleNode: function (range) {
            var startNode = range.startContainer;
            return startNode === range.endContainer &&
                startNode.hasChildNodes() &&
                range.endOffset === range.startOffset + 1;
        },

        getSelectedParentElement: function () {
            var selectedParentElement = null,
                range = this.selectionRange;
            if (this.rangeSelectsSingleNode(range)) {
                selectedParentElement = range.startContainer.childNodes[range.startOffset];
            } else if (range.startContainer.nodeType === 3) {
                selectedParentElement = range.startContainer.parentNode;
            } else {
                selectedParentElement = range.startContainer;
            }
            return selectedParentElement;
        },

        triggerAnchorAction: function () {
            var selectedParentElement = this.getSelectedParentElement();
            if (selectedParentElement.tagName &&
                    selectedParentElement.tagName.toLowerCase() === 'a') {
                document.execCommand('unlink', false, null);
            } else {
                if (this.anchorForm.style.display === 'block') {
                    this.showToolbarActions();
                } else {
                    this.showAnchorForm();
                }
            }
            return this;
        },

        execFormatBlock: function (el) {
            var selectionData = this.getSelectionData(this.selection.anchorNode);
            // FF handles blockquote differently on formatBlock
            // allowing nesting, we need to use outdent
            // https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
            if (el === 'blockquote' && selectionData.el &&
                selectionData.el.parentNode.tagName.toLowerCase() === 'blockquote') {
                return document.execCommand('outdent', false, null);
            }
            if (selectionData.tagName === el) {
                el = 'p';
            }
            // When IE we need to add <> to heading elements and
            //  blockquote needs to be called as indent
            // http://stackoverflow.com/questions/10741831/execcommand-formatblock-headings-in-ie
            // http://stackoverflow.com/questions/1816223/rich-text-editor-with-blockquote-function/1821777#1821777
            if (this.isIE) {
                if (el === 'blockquote') {
                    return document.execCommand('indent', false, el);
                }
                el = '<' + el + '>';
            }
            return document.execCommand('formatBlock', false, el);
        },

        getSelectionData: function (el) {
            var tagName;

            if (el && el.tagName) {
                tagName = el.tagName.toLowerCase();
            }

            while (el && this.parentElements.indexOf(tagName) === -1) {
                el = el.parentNode;
                if (el && el.tagName) {
                    tagName = el.tagName.toLowerCase();
                }
            }

            return {
                el: el,
                tagName: tagName
            };
        },

        getFirstChild: function (el) {
            var firstChild = el.firstChild;
            while (firstChild !== null && firstChild.nodeType !== 1) {
                firstChild = firstChild.nextSibling;
            }
            return firstChild;
        },

        hideToolbarActions: function () {
            this.keepToolbarAlive = false;
            if (this.toolbar !== undefined) {
                this.toolbar.classList.remove('medium-editor-toolbar-active');
            }
        },

        showToolbarActions: function () {
            var self = this,
                timer;
            this.anchorForm.style.display = 'none';
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (self.toolbar && !self.toolbar.classList.contains('medium-editor-toolbar-active')) {
                    self.toolbar.classList.add('medium-editor-toolbar-active');
                }
            }, 100);
        },

        showAnchorForm: function (link_value) {
            this.toolbarActions.style.display = 'none';
            this.savedSelection = saveSelection();
            this.anchorForm.style.display = 'block';
            this.keepToolbarAlive = true;
            this.anchorInput.focus();
            this.anchorInput.value = link_value || '';
        },

        bindAnchorForm: function () {
            var linkCancel = this.anchorForm.querySelector('a'),
                self = this;
            this.anchorForm.addEventListener('click', function (e) {
                e.stopPropagation();
            });
            this.anchorInput.addEventListener('keyup', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    self.createLink(this);
                }
            });
            this.anchorInput.addEventListener('click', function (e) {
                // make sure not to hide form when cliking into the input
                e.stopPropagation();
                self.keepToolbarAlive = true;
            });
            this.anchorInput.addEventListener('blur', function () {
                self.keepToolbarAlive = false;
                self.checkSelection();
            });
            linkCancel.addEventListener('click', function (e) {
                e.preventDefault();
                self.showToolbarActions();
                restoreSelection(self.savedSelection);
            });
            return this;
        },


        hideAnchorPreview: function () {
            this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
        },

        // TODO: break method
        showAnchorPreview: function (anchorEl) {
            if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                return true;
            }

            var self = this,
                buttonHeight = 40,
                boundary = anchorEl.getBoundingClientRect(),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth,
                defaultLeft,
                timer;

            self.anchorPreview.querySelector('i').textContent = anchorEl.href;
            halfOffsetWidth = self.anchorPreview.offsetWidth / 2;
            defaultLeft = self.options.diffLeft - halfOffsetWidth;

            clearTimeout(timer);
            timer = setTimeout(function () {
                if (self.anchorPreview && !self.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                    self.anchorPreview.classList.add('medium-editor-anchor-preview-active');
                }
            }, 100);

            self.observeAnchorPreview(anchorEl);

            self.anchorPreview.classList.add('medium-toolbar-arrow-over');
            self.anchorPreview.classList.remove('medium-toolbar-arrow-under');
            self.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - self.options.diffTop + window.pageYOffset - self.anchorPreview.offsetHeight) + 'px';
            if (middleBoundary < halfOffsetWidth) {
                self.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((window.innerWidth - middleBoundary) < halfOffsetWidth) {
                self.anchorPreview.style.left = window.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                self.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
            }

            return this;
        },

        // TODO: break method
        observeAnchorPreview: function (anchorEl) {
            var self = this,
                lastOver = (new Date()).getTime(),
                over = true,
                stamp = function () {
                    lastOver = (new Date()).getTime();
                    over = true;
                },
                unstamp = function (e) {
                    if (!e.relatedTarget || !/anchor-preview/.test(e.relatedTarget.className)) {
                        over = false;
                    }
                },
                interval_timer = setInterval(function () {
                    if (over) {
                        return true;
                    }
                    var durr = (new Date()).getTime() - lastOver;
                    if (durr > self.options.anchorPreviewHideDelay) {
                        // hide the preview 1/2 second after mouse leaves the link
                        self.hideAnchorPreview();

                        // cleanup
                        clearInterval(interval_timer);
                        self.anchorPreview.removeEventListener('mouseover', stamp);
                        self.anchorPreview.removeEventListener('mouseout', unstamp);
                        anchorEl.removeEventListener('mouseover', stamp);
                        anchorEl.removeEventListener('mouseout', unstamp);

                    }
                }, 200);

            self.anchorPreview.addEventListener('mouseover', stamp);
            self.anchorPreview.addEventListener('mouseout', unstamp);
            anchorEl.addEventListener('mouseover', stamp);
            anchorEl.addEventListener('mouseout', unstamp);
        },

        createAnchorPreview: function () {
            var self = this,
                anchorPreview = document.createElement('div');

            anchorPreview.id = 'medium-editor-anchor-preview-' + this.id;
            anchorPreview.className = 'medium-editor-anchor-preview';
            anchorPreview.innerHTML = this.anchorPreviewTemplate();
            this.options.elementsContainer.appendChild(anchorPreview);

            anchorPreview.addEventListener('click', function () {
                self.anchorPreviewClickHandler();
            });

            return anchorPreview;
        },

        anchorPreviewTemplate: function () {
            return '<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">' +
                '    <i class="medium-editor-toolbar-anchor-preview-inner"></i>' +
                '</div>';
        },

        anchorPreviewClickHandler: function (e) {
            if (this.activeAnchor) {

                var self = this,
                    range = document.createRange(),
                    sel = window.getSelection();

                range.selectNodeContents(self.activeAnchor);
                sel.removeAllRanges();
                sel.addRange(range);
                setTimeout(function () {
                    if (self.activeAnchor) {
                        self.showAnchorForm(self.activeAnchor.href);
                    }
                    self.keepToolbarAlive = false;
                }, 100 + self.options.delay);

            }

            this.hideAnchorPreview();
        },

        editorAnchorObserver: function (e) {
            var self = this,
                overAnchor = true,
                leaveAnchor = function () {
                    // mark the anchor as no longer hovered, and stop listening
                    overAnchor = false;
                    self.activeAnchor.removeEventListener('mouseout', leaveAnchor);
                };

            if (e.target && e.target.tagName.toLowerCase() === 'a') {

                // Detect empty href attributes
                // The browser will make href="" or href="#top"
                // into absolute urls when accessed as e.targed.href, so check the html
                if (!/href=["']\S+["']/.test(e.target.outerHTML) || /href=["']#\S+["']/.test(e.target.outerHTML)) {
                    return true;
                }

                // only show when hovering on anchors
                if (this.toolbar.classList.contains('medium-editor-toolbar-active')) {
                    // only show when toolbar is not present
                    return true;
                }
                this.activeAnchor = e.target;
                this.activeAnchor.addEventListener('mouseout', leaveAnchor);
                // show the anchor preview according to the configured delay
                // if the mouse has not left the anchor tag in that time
                setTimeout(function () {
                    if (overAnchor) {
                        self.showAnchorPreview(e.target);
                    }
                }, self.options.delay);


            }
        },

        bindAnchorPreview: function (index) {
            var i, self = this;
            this.editorAnchorObserverWrapper = function (e) {
                self.editorAnchorObserver(e);
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('mouseover', this.editorAnchorObserverWrapper);
            }
            return this;
        },

        checkLinkFormat: function (value) {
            var re = /^https?:\/\//;
            if (value.match(re)) {
                return value;
            }
            return "http://" + value;
        },

        setTargetBlank: function () {
            var el = getSelectionStart(),
                i;
            if (el.tagName.toLowerCase() === 'a') {
                el.target = '_blank';
            } else {
                el = el.getElementsByTagName('a');
                for (i = 0; i < el.length; i += 1) {
                    el[i].target = '_blank';
                }
            }
        },

        createLink: function (input) {
            restoreSelection(this.savedSelection);
            if (this.options.checkLinkFormat) {
                input.value = this.checkLinkFormat(input.value);
            }
            document.execCommand('createLink', false, input.value);
            if (this.options.targetBlank) {
                this.setTargetBlank();
            }
            this.checkSelection();
            this.showToolbarActions();
            input.value = '';
        },

        bindWindowActions: function () {
            var timerResize,
                self = this;
            this.windowResizeHandler = function () {
                clearTimeout(timerResize);
                timerResize = setTimeout(function () {
                    if (self.toolbar && self.toolbar.classList.contains('medium-editor-toolbar-active')) {
                        self.setToolbarPosition();
                    }
                }, 100);
            };
            window.addEventListener('resize', this.windowResizeHandler);
            return this;
        },

        activate: function () {
            if (this.isActive) {
                return;
            }

            this.setup();
        },

        // TODO: break method
        deactivate: function () {
            var i;
            if (!this.isActive) {
                return;
            }
            this.isActive = false;

            if (this.toolbar !== undefined) {
                this.options.elementsContainer.removeChild(this.anchorPreview);
                this.options.elementsContainer.removeChild(this.toolbar);
                delete this.toolbar;
                delete this.anchorPreview;
            }

            document.documentElement.removeEventListener('mouseup', this.checkSelectionWrapper);
            window.removeEventListener('resize', this.windowResizeHandler);

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].removeEventListener('mouseover', this.editorAnchorObserverWrapper);
                this.elements[i].removeEventListener('keyup', this.checkSelectionWrapper);
                this.elements[i].removeEventListener('blur', this.checkSelectionWrapper);
                this.elements[i].removeEventListener('paste', this.pasteWrapper);
                this.elements[i].removeAttribute('contentEditable');
                this.elements[i].removeAttribute('data-medium-element');
            }

        },

        htmlEntities: function (str) {
            // converts special characters (like <) into their escaped/encoded values (like &lt;).
            // This allows you to show to display the string without the browser reading it as HTML.
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        bindPaste: function () {
            var i, self = this;
            this.pasteWrapper = function (e) {
                var paragraphs,
                    html = '',
                    p;

                this.classList.remove('medium-editor-placeholder');
                if (!self.options.forcePlainText && !self.options.cleanPastedHTML) {
                    return this;
                }

                if (e.clipboardData && e.clipboardData.getData && !e.defaultPrevented) {
                    e.preventDefault();

                    if (self.options.cleanPastedHTML && e.clipboardData.getData('text/html')) {
                        return self.cleanPaste(e.clipboardData.getData('text/html'));
                    }
                    if (!(self.options.disableReturn || this.getAttribute('data-disable-return'))) {
                        paragraphs = e.clipboardData.getData('text/plain').split(/[\r\n]/g);
                        for (p = 0; p < paragraphs.length; p += 1) {
                            if (paragraphs[p] !== '') {
                                if (navigator.userAgent.match(/firefox/i) && p === 0) {
                                    html += self.htmlEntities(paragraphs[p]);
                                } else {
                                    html += '<p>' + self.htmlEntities(paragraphs[p]) + '</p>';
                                }
                            }
                        }
                        document.execCommand('insertHTML', false, html);
                    } else {
                        document.execCommand('insertHTML', false, e.clipboardData.getData('text/plain'));
                    }
                }
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('paste', this.pasteWrapper);
            }
            return this;
        },

        setPlaceholders: function () {
            var i,
                activatePlaceholder = function (el) {
                    if (!(el.querySelector('img')) &&
                            el.textContent.replace(/^\s+|\s+$/g, '') === '') {
                        el.classList.add('medium-editor-placeholder');
                    }
                },
                placeholderWrapper = function (e) {
                    this.classList.remove('medium-editor-placeholder');
                    if (e.type !== 'keypress') {
                        activatePlaceholder(this);
                    }
                };
            for (i = 0; i < this.elements.length; i += 1) {
                activatePlaceholder(this.elements[i]);
                this.elements[i].addEventListener('blur', placeholderWrapper);
                this.elements[i].addEventListener('keypress', placeholderWrapper);
            }
            return this;
        },

        cleanPaste: function (text) {

            /*jslint regexp: true*/
            /*
                jslint does not allow character negation, because the negation
                will not match any unicode characters. In the regexes in this
                block, negation is used specifically to match the end of an html
                tag, and in fact unicode characters *should* be allowed.
            */
            var i, elList, workEl,
                el = this.getSelectionElement(),
                multiline = /<p|<br|<div/.test(text),
                replacements = [

                    // replace two bogus tags that begin pastes from google docs
                    [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ""],
                    [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ""],

                     // un-html spaces and newlines inserted by OS X
                    [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '],
                    [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

                    // replace google docs italics+bold with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*(font-style:italic;font-weight:bold|font-weight:bold;font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

                    // replace google docs italics with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

                    //[replace google docs bolds with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-weight:bold[^>]*>/gi), '<span class="replace-with bold">'],

                     // replace manually entered b/i/a tags with real ones
                    [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

                     // replace manually a tags with real ones, converting smart-quotes from google docs
                    [new RegExp(/&lt;a\s+href=(&quot;|&rdquo;|&ldquo;|“|”)([^&]+)(&quot;|&rdquo;|&ldquo;|“|”)&gt;/gi), '<a href="$2">']

                ];
            /*jslint regexp: false*/

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (multiline) {

                // double br's aren't converted to p tags, but we want paragraphs.
                elList = text.split('<br><br>');

                this.pasteHTML('<p>' + elList.join('</p><p>') + '</p>');
                document.execCommand('insertText', false, "\n");

                // block element cleanup
                elList = el.querySelectorAll('p,div,br');
                for (i = 0; i < elList.length; i += 1) {

                    workEl = elList[i];

                    switch (workEl.tagName.toLowerCase()) {
                    case 'p':
                    case 'div':
                        this.filterCommonBlocks(workEl);
                        break;
                    case 'br':
                        this.filterLineBreak(workEl);
                        break;
                    }

                }


            } else {

                this.pasteHTML(text);

            }

        },

        pasteHTML: function (html) {
            var elList, workEl, i, fragmentBody, pasteBlock = document.createDocumentFragment();

            pasteBlock.appendChild(document.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody);

            elList = fragmentBody.querySelectorAll('*');
            for (i = 0; i < elList.length; i += 1) {

                workEl = elList[i];

                // delete ugly attributes
                workEl.removeAttribute('class');
                workEl.removeAttribute('style');
                workEl.removeAttribute('dir');

                if (workEl.tagName.toLowerCase() === 'meta') {
                    workEl.parentNode.removeChild(workEl);
                }

            }
            document.execCommand('insertHTML', false, fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },
        isCommonBlock: function (el) {
            return (el && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div'));
        },
        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.innerText)) {
                el.parentNode.removeChild(el);
            }
        },
        filterLineBreak: function (el) {
            if (this.isCommonBlock(el.previousElementSibling)) {

                // remove stray br's following common block elements
                el.parentNode.removeChild(el);

            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {

                // remove br's just inside open or close tags of a div/p
                el.parentNode.removeChild(el);

            } else if (el.parentNode.childElementCount === 1) {

                // and br's that are the only child of a div/p
                this.removeWithParent(el);

            }

        },

        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el.parentNode);
                }
            }
        },

        cleanupSpans: function (container_el) {

            var i,
                el,
                new_el,
                spans = container_el.querySelectorAll('.replace-with');

            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];
                new_el = document.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {

                    // add an i tag as well if this has both italics and bold
                    new_el.innerHTML = '<i>' + el.innerHTML + '</i>';

                } else {

                    new_el.innerHTML = el.innerHTML;

                }
                el.parentNode.replaceChild(new_el, el);

            }

            spans = container_el.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];

                // remove empty spans, replace others with their contents
                if (/^\s*$/.test()) {
                    el.parentNode.removeChild(el);
                } else {
                    el.parentNode.replaceChild(document.createTextNode(el.innerText), el);
                }

            }

        }

    };

}(window, document));
