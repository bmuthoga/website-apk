(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('root.html',
    '<div mnd-sidebar ng-controller="SidebarController">\n' +
    '	<div name="before">\n' +
    '		<div id="mnd-sidebar-user">\n' +
    '			<div ng-if="user" class="row">\n' +
    '				<a class="col-xs-4 mnd-undecorated-a" ui-sref="profile()">\n' +
    '					<div mnd-cig-image source="user.profile.pictureUrl" size="70"></div>\n' +
    '				</a>\n' +
    '				<div class="col-xs-8">\n' +
    '					<div class="mnd-vsp-6"></div>\n' +
    '					<a class="mnd-undecorated-a" ui-sref="profile()">{{user.profile.name}}</a>\n' +
    '					<br />\n' +
    '					<span ng-click="logout()" class="logout mnd-clickable">\n' +
    '						<small><i>Logout</i></small>\n' +
    '					</span>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '			<div ng-if="!user" ng-click="login()" class="login">\n' +
    '				<i class="fa fa-twitter"></i> Sign in with twitter\n' +
    '			</div>\n' +
    '		</div>	\n' +
    '	</div>\n' +
    '	<div name="after">\n' +
    '		<div id="mnd-sidebar-footer">\n' +
    '			<span>\n' +
    '				MONDORA Srl\n' +
    '			</span>\n' +
    '			<br />\n' +
    '			<span class="mnd-sidebar-footer-address">\n' +
    '				Milano, Morbegno, Novara, St. Moritz (CH)<br />\n' +
    '				Via Cornalia 7 - 20154, Milano <br />\n' +
    '				PIVA 03680680968 <br />\n' +
    '			</span>\n' +
    '		</div>	\n' +
    '	</div>	\n' +
    '</div>\n' +
    '<div mnd-toggle-sidebar>\n' +
    '	<div name="center">\n' +
    '		<div id="mnd-sidebar-logo">\n' +
    '			<div class="mnd-mondora-logo">\n' +
    '				<img src="http://mnd-website.s3.amazonaws.com/img/mondora-logo.png" />\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '<div mnd-content>\n' +
    '	<div ui-view class="mnd-content"></div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('components/menu-editor/menu-editor.html',
    '<accordion class="mnd-menu-accordion">\n' +
    '	<div ng-repeat="item in items">\n' +
    '\n' +
    '		<accordion-group class="mnd-menu-accordion-heading">\n' +
    '			<accordion-heading>\n' +
    '\n' +
    '				{{item.title}}\n' +
    '\n' +
    '				<span class="pull-right mnd-clickable mnd-width-20 text-center" ng-click="menu.deleteItem($index)">\n' +
    '					<i class="fa fa-trash-o"></i>\n' +
    '				</span>\n' +
    '				<span class="pull-right mnd-width-20">\n' +
    '					&nbsp;\n' +
    '				</span>\n' +
    '				<span class="pull-right mnd-clickable mnd-width-20 text-center" ng-click="menu.moveUp($index, $event)">\n' +
    '					<i ng-if="$index !== 0" class="fa fa-caret-up"></i>\n' +
    '					<i ng-if="$index === 0">&nbsp;</i>\n' +
    '				</span>\n' +
    '				<span class="pull-right mnd-clickable mnd-width-20 text-center" ng-click="menu.moveDown($index, $event)">\n' +
    '					<i ng-if="$index !== (items.length - 1)" class="fa fa-caret-down"></i>\n' +
    '					<i ng-if="$index === (items.length - 1)">&nbsp;</i>\n' +
    '				</span>\n' +
    '\n' +
    '			</accordion-heading>\n' +
    '\n' +
    '			<div class="col-sm-12 form-group">\n' +
    '				<label>\n' +
    '					<i class="fa fa-font"></i>\n' +
    '					&nbsp;\n' +
    '					Title\n' +
    '				</label>\n' +
    '				<input type="text" class="form-control" placeholder="Title" ng-model="item.title" />\n' +
    '			</div>\n' +
    '\n' +
    '			<div class="col-sm-12 form-group">\n' +
    '				<div class="checkbox">\n' +
    '					<label>\n' +
    '						<input type="checkbox" ng-model="item.loginRequired">\n' +
    '						Only display to logged-in users\n' +
    '					</label>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '\n' +
    '			<div class="col-sm-12 form-group">\n' +
    '				<label>\n' +
    '					<i class="fa fa-user"></i>\n' +
    '					&nbsp;\n' +
    '					Restrict to roles\n' +
    '				</label>\n' +
    '				<input type="text" class="form-control" placeholder="blog, admin, ..." ng-model="item.roles" />\n' +
    '			</div>\n' +
    '\n' +
    '			<div class="col-sm-12">\n' +
    '				<label>\n' +
    '					<i class="fa fa-dot-circle-o"></i>\n' +
    '					&nbsp;\n' +
    '					Type\n' +
    '				</label>\n' +
    '			</div>\n' +
    '			<div class="col-sm-12 form-group">\n' +
    '					<div class="col-sm-4">\n' +
    '					<label class="radio-inline">\n' +
    '						<input type="radio" name="{{\'type\' + $index}}" ng-model="item.type" value="link" /> Link\n' +
    '					</label>\n' +
    '				</div>\n' +
    '				<div class="col-sm-4">\n' +
    '					<label class="radio-inline">\n' +
    '						<input type="radio" name="{{\'type\' + $index}}" ng-model="item.type" value="action" /> Action\n' +
    '					</label>\n' +
    '				</div>\n' +
    '				<div class="col-sm-4">\n' +
    '					<label class="radio-inline">\n' +
    '						<input type="radio" name="{{\'type\' + $index}}" ng-model="item.type" value="submenu" /> Sumbenu\n' +
    '					</label>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '\n' +
    '			<div class="col-sm-12 form-group" ng-if="item.type === \'link\'">\n' +
    '				<label>\n' +
    '					<i class="fa fa-link"></i>\n' +
    '					&nbsp;\n' +
    '					Link\n' +
    '				</label>\n' +
    '				<input type="text" class="form-control" placeholder="Absolute or relative path" ng-model="item.link" />\n' +
    '			</div>\n' +
    '			<div class="col-sm-12 form-group" ng-if="item.type === \'action\'">\n' +
    '				<label>\n' +
    '					<i class="fa fa-bolt"></i>\n' +
    '					&nbsp;\n' +
    '					Action\n' +
    '				</label>\n' +
    '				<select class="form-control" ng-model="item.action" ng-options="action for action in availableActions"></select>\n' +
    '			</div>\n' +
    '			<div class="col-sm-12 form-group" ng-if="item.type === \'submenu\'">\n' +
    '				<button type="button" class="btn btn-default btn-block" ng-click="menu.addSubitem(item)">Add subitem</button>\n' +
    '			</div>\n' +
    '\n' +
    '		</accordion-group>\n' +
    '\n' +
    '		<accordion-group ng-if="item.type === \'submenu\'" ng-repeat="subitem in item.items" class="mnd-menu-accordion-heading mnd-menu-accordion-indented">\n' +
    '			<accordion-heading>\n' +
    '\n' +
    '				{{subitem.title}}\n' +
    '\n' +
    '				<span class="pull-right mnd-clickable mnd-width-20 text-center" ng-click="menu.deleteSubitem(item, $index)">\n' +
    '					<i class="fa fa-trash-o"></i>\n' +
    '				</span>\n' +
    '				<span class="pull-right mnd-width-20">\n' +
    '					&nbsp;\n' +
    '				</span>\n' +
    '				<span class="pull-right mnd-clickable mnd-width-20 text-center" ng-click="menu.moveSubitemUp(item, $index, $event)">\n' +
    '					<i ng-if="$index !== 0" class="fa fa-caret-up"></i>\n' +
    '					<i ng-if="$index === 0">&nbsp;</i>\n' +
    '				</span>\n' +
    '				<span class="pull-right mnd-clickable mnd-width-20 text-center" ng-click="menu.moveSubitemDown(item, $index, $event)">\n' +
    '					<i ng-if="$index !== (item.items.length - 1)" class="fa fa-caret-down"></i>\n' +
    '					<i ng-if="$index === (item.items.length - 1)">&nbsp;</i>\n' +
    '				</span>\n' +
    '\n' +
    '			</accordion-heading>\n' +
    '\n' +
    '			<div class="col-sm-12 form-group">\n' +
    '				<label>\n' +
    '					<i class="fa fa-font"></i>\n' +
    '					&nbsp;\n' +
    '					Title\n' +
    '				</label>\n' +
    '				<input type="text" class="form-control" placeholder="Title" ng-model="subitem.title" />\n' +
    '			</div>\n' +
    '\n' +
    '			<div class="col-sm-12 form-group">\n' +
    '				<label>\n' +
    '					<i class="fa fa-link"></i>\n' +
    '					&nbsp;\n' +
    '					Link\n' +
    '				</label>\n' +
    '				<input type="text" class="form-control" placeholder="Absolute or relative path" ng-model="subitem.link" />\n' +
    '			</div>\n' +
    '\n' +
    '		</accordion-group>\n' +
    '\n' +
    '	</div>\n' +
    '</accordion>\n' +
    '\n' +
    '<br />\n' +
    '\n' +
    '<button type="button" class="btn btn-default" ng-click="menu.addItem()">Add item</button>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('components/mindmap/mindmap.html',
    '<div class="tree">\n' +
    '	<ul>\n' +
    '		<div mnd-mind-map-recursive map="map" edit="edit" child="true"></div>\n' +
    '	</ul>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('components/mindmap/mindmaprecursive.html',
    '<li>\n' +
    '	<a ng-if="!edit" href="{{map.href}}">{{map.text}}</a>\n' +
    '	<input ng-if="edit" type="text" ng-model="map.text" placeholder="Text" />\n' +
    '	<input ng-if="edit" type="text" ng-model="map.href" placeholder="Url" />\n' +
    '	<i ng-if="edit && child" class="fa fa-times mnd-clickable" ng-click="autodestroy()"></i>\n' +
    '	<i ng-if="edit" class="fa fa-plus mnd-clickable" ng-click="addChild()"></i>\n' +
    '	<ul ng-show="map.children.length">\n' +
    '		<div ng-repeat="child in map.children" mnd-mind-map-recursive map="child" edit="edit" child="true"></div>\n' +
    '	</ul>\n' +
    '</li>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('components/pomodoro/pomodoro-summary.html',
    '<div class="mnd-pomodoro-summary mnd-inline-block">\n' +
    '	<div mnd-pomodoro-timer pomodoro="pomodoro" size="150"></div>\n' +
    '	<div class="mnd-pomodoro-summary-participants">\n' +
    '		<div class="mnd-inline-block" ng-repeat="participant in pomodoro.participants" mnd-cig-image source="participant.pictureUrl" size="45"></div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('components/pomodoro/pomodoro-timer.html',
    '<div class="mnd-pomodoro-timer">\n' +
    '	<svg>\n' +
    '		<path />\n' +
    '		<circle />\n' +
    '	</svg>\n' +
    '	<div>\n' +
    '		{{remaining | date: format}}\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('components/user-input/user-input.html',
    '<a>\n' +
    '	<div mnd-cig-image source="match.model.profile.pictureUrl" size="16" class="mnd-inline-block"></div>\n' +
    '	<span bind-html-unsafe="match.label | typeaheadHighlight:query"></span>\n' +
    '</a>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/admin/admin.html',
    '<div class="col-sm-8 col-sm-offset-2">\n' +
    '\n' +
    '	<br />\n' +
    '	<br />\n' +
    '\n' +
    '	<div class="row">\n' +
    '\n' +
    '		<div class="col-sm-12">\n' +
    '			<h3>Menu configuration</h3>\n' +
    '		</div>\n' +
    '\n' +
    '		<div class="col-sm-8">\n' +
    '			<h4>Items</h4>\n' +
    '			<div mnd-menu-editor items="menuConfig.items"></div>\n' +
    '		</div>\n' +
    '\n' +
    '	</div>\n' +
    '\n' +
    '	<br />\n' +
    '	<br />\n' +
    '\n' +
    '\n' +
    '	<div class="row">\n' +
    '		<div class="col-sm-12">\n' +
    '			<h3>Home configuration</h3>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '	<div class="row">\n' +
    '		<div class="col-sm-6">\n' +
    '			<h4>Sprinkle text</h4>\n' +
    '			<textarea class="form-control" rows="4" ng-model="homeConfig.sprinkleText"></textarea>\n' +
    '		</div>\n' +
    '		<div class="col-sm-6">\n' +
    '			<h4>Banner</h4>\n' +
    '			<div class="mnd-input-vertical-group">\n' +
    '				<input type="text" class="form-control" ng-model="homeConfig.banner.title" placeholder="Title" />\n' +
    '				<input type="text" class="form-control" ng-model="homeConfig.banner.date" placeholder="Date" />\n' +
    '				<input type="text" class="form-control" ng-model="homeConfig.banner.text" placeholder="Text" />\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '	<div class="row">\n' +
    '		<div class="col-sm-6">\n' +
    '			<h4>Payoff</h4>\n' +
    '			<div class="mnd-input-vertical-group">\n' +
    '				<input type="text" class="form-control" ng-model="homeConfig.payoff.firstLine" placeholder="First line" />\n' +
    '				<input type="text" class="form-control" ng-model="homeConfig.payoff.secondLine" placeholder="Second line" />\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '\n' +
    '	<br />\n' +
    '	<br />\n' +
    '\n' +
    '	<h3>AmazonS3 configuration</h3>\n' +
    '\n' +
    '	<div class="form-group">\n' +
    '		<label>Post URL (to upload)</label>\n' +
    '		<input type="text" class="form-control" ng-model="amazonS3Config.postUrl" />\n' +
    '	</div>\n' +
    '\n' +
    '	<div class="form-group">\n' +
    '		<label>Get URL (to download)</label>\n' +
    '		<input type="text" class="form-control" ng-model="amazonS3Config.getUrl" />\n' +
    '	</div>\n' +
    '\n' +
    '\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/home/home.html',
    '<div id="mnd-home-container">\n' +
    '	<div id="mnd-sign-in">\n' +
    '		<span ng-if="!signedIn" ng-click="login()"><i class="fa fa-twitter"></i> Sign In</span>\n' +
    '		<span ng-if="signedIn" ng-click="logout()"><i class="fa fa-twitter"></i> Sign Out</span>\n' +
    '	</div>\n' +
    '\n' +
    '	<div id="mnd-hidden-payoff">\n' +
    '		{{payoff.firstLine}}\n' +
    '		<br />\n' +
    '		{{payoff.secondLine}}\n' +
    '	</div>\n' +
    '\n' +
    '	<div id="mnd-sprinkle-container">\n' +
    '		<div mnd-sprinkle autoplay="true" autoplay-delay="3" text="{{sprinkleText}}"></div>\n' +
    '	</div>\n' +
    '\n' +
    '	<div id="mnd-home-bottom">\n' +
    '		<div id="mnd-home-logo">\n' +
    '			<div class="mnd-mondora-logo">\n' +
    '				<img src="http://mnd-website.s3.amazonaws.com/img/mondora-logo.png" alt="logo" />\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<div id="mnd-home-banner">\n' +
    '			<div id="mnd-home-banner-content" class="home-shadow">\n' +
    '				<h1 ng-bind-html="banner.title"></h1>\n' +
    '				<h4 ng-bind-html="banner.text"></h4>\n' +
    '				<div class="guest-notify">\n' +
    '					<div class="guest-notify-icon">\n' +
    '						<i class="fa fa-envelope-o"></i><br />inbox\n' +
    '						<div class="guest-notification">9+</div>\n' +
    '					</div>\n' +
    '					<div class="guest-notify-icon">\n' +
    '						<i class="fa fa-book"></i><br />new posts\n' +
    '						<div class="guest-notification">36</div>\n' +
    '					</div>\n' +
    '					<div class="guest-notify-icon">\n' +
    '						<i class="fa fa-calendar"></i><br />events\n' +
    '					</div>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '			<div id="mnd-home-banner-arrow"></div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '\n' +
    '<div id="mnd-video-background">\n' +
    '	<div class="mnd-video-overlay"></div>\n' +
    '	<video muted autoplay="1" loop="1" ng-src="{{videoSource}}" ng-attr-poster="{{videoPoster}}"> \n' +
    '	</video>\n' +
    '	<img ng-src="{{videoPoster}}" />\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/notFound/notFound.html',
    '<div>\n' +
    '	La pagina che cerchi non è disponibile.\n' +
    '	<a ui-sref="home()">Torna alla home</a>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/page/page.html',
    '<div class="img-background">\n' +
    '		<div class="mnd-page-overlay"></div>\n' +
    '		<img src="https://s3.amazonaws.com/mnd-website/img/456512_3454297838885_57042764_o.jpg" />\n' +
    '	</div>\n' +
    '<div class="page-page-container">\n' +
    '	<div class="col-sm-8 col-sm-offset-2 page-content">\n' +
    '		<br />\n' +
    '		<br />\n' +
    '		<p style="text-transform:uppercase">\n' +
    '			While others may be confused, <span class="page-highlight">our customers exhibit clarity.</span>\n' +
    '			<br />\n' +
    '			While others are constrained, <span class="page-highlight">we are flexible.</span>\n' +
    '			<br />\n' +
    '			While others chase fads, <span class="page-highlight">we discover trends.</span>\n' +
    '			<br />\n' +
    '			While others see adversity, <span class="page-highlight">we uncover opportunity.</span>\n' +
    '		</p>\n' +
    '\n' +
    '		<br />\n' +
    '		<h3>\n' +
    '			We are a software development company\n' +
    '			working with select clients who subscribe to\n' +
    '			our unique approach on agile, cloud\n' +
    '			development and cloud governance.\n' +
    '		</h3>\n' +
    '		<br /><br />\n' +
    '\n' +
    '		<p>\n' +
    '			Simply, our team is dedicated to uncovering ideas through\n' +
    '			creativity — in both thinking and implementation. Our process\n' +
    '			and services are supported by an intense global search for\n' +
    '			idiosyncratic opportunities on Cloud and Agile software\n' +
    '			development.\n' +
    '		<br /><br />\n' +
    '			We view the world differently, and this makes all the\n' +
    '			difference.\n' +
    '		<br /><br />\n' +
    '			To contact us for information on our services, mondora.com\n' +
    '			and sensible cloud please send a message to <a href="mailto:info@mondora.com">info@mondora.com</a>.\n' +
    '		<br />\n' +
    '\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/personalHome/personalHome.html',
    '<div class="personal-home-container radial-background">\n' +
    '	<div class="col-sm-8 col-sm-offset-2">\n' +
    '		<br />\n' +
    '		<br />\n' +
    '		<h2 class="personalHome-h2">Hello {{user.profile.screenName}}!</h2>\n' +
    '\n' +
    '		<br />\n' +
    '\n' +
    '		<br />\n' +
    '		<div class="app-box">\n' +
    '			<a ui-sref="profile()" class="personalHomeApp">\n' +
    '				<i class="fa fa-user"></i>\n' +
    '			</a>\n' +
    '			<div class="notification">999</div>\n' +
    '		</div>\n' +
    '		<div class="app-box">\n' +
    '			<a ui-sref="admin()" ng-if="isAdmin()" class="personalHomeApp">\n' +
    '				<i class="fa fa-dashboard"></i>\n' +
    '			</a>\n' +
    '		</div>\n' +
    '		<div class="app-box">	\n' +
    '			<a ui-sref="pomodoroList()" class="personalHomeApp">\n' +
    '				<i class="fa fa-clock-o"></i>\n' +
    '			</a>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/profile/profile.html',
    '<div class="post-top-buttons">\n' +
    '	<a ui-sref="user({userId: user._id})" class="btn btn-default">\n' +
    '		Anteprima\n' +
    '	</a>\n' +
    '</div>\n' +
    '\n' +
    '<div class="col-sm-8 col-sm-offset-2">\n' +
    '\n' +
    '	<br />\n' +
    '	<br />\n' +
    '	<div class="row">\n' +
    '		<div class="col-sm-4">\n' +
    '			<input id="profilePictureFileInput" type="file" ng-file-select="onFileSelect($files)" class="hidden" />\n' +
    '			<div mnd-cig-image source="user.profile.pictureUrl" size="200" class="mnd-clickable" ng-click="clickFileInput()"></div>\n' +
    '			<div id="profilePictureProgressbar" ng-show="isUploading">\n' +
    '				<progressbar value="uploadProgress"></progressbar>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<div class="col-sm-8">\n' +
    '			<h2 class="simplebox" id="profileNameEditor"></h2>\n' +
    '			<i><h3 class="simplebox" id="profileScreenNameEditor"></h3></i>\n' +
    '			<h4 class="simplebox" id="profileEmailEditor"></h4>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '	<br />\n' +
    '	<h3>Social links</h3>\n' +
    '	<div class="profileSocialRow">\n' +
    '		<span class="icon"><i class="fa fa-facebook"></i></span>\n' +
    '		<span class="simplebox" id="profileFacebookEditor"></span>\n' +
    '	</div>\n' +
    '	<div class="profileSocialRow">\n' +
    '		<span class="icon"><i class="fa fa-twitter"></i></span>\n' +
    '		<span class="simplebox" id="profileTwitterEditor"></span>\n' +
    '	</div>\n' +
    '	<div class="profileSocialRow">\n' +
    '		<span class="icon"><i class="fa fa-linkedin"></i></span>\n' +
    '		<span class="simplebox" id="profileLinkedInEditor"></span>\n' +
    '	</div>\n' +
    '	<div class="profileSocialRow">\n' +
    '		<span class="icon"><i class="fa fa-github"></i></span>\n' +
    '		<span class="simplebox" id="profileGithubEditor"></span>\n' +
    '	</div>\n' +
    '	<br />\n' +
    '	<h3>Motto</h3>\n' +
    '	<div class="simplebox" id="profileMottoEditor"></div>\n' +
    '	<br />\n' +
    '	<h3>Short bio</h3>\n' +
    '	<div class="simplebox" id="profileBioEditor"></div>\n' +
    '\n' +
    '\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/serverProblems/serverProblems.html',
    '<div>\n' +
    '	Il server ha problemi\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/staticHome/staticHome.html',
    '<div id="mnd-home-container">\n' +
    '\n' +
    '	<div id="mnd-static-hidden-payoff">\n' +
    '		ONE STEP AHEAD<br />THE FUTURE\n' +
    '	</div>\n' +
    '\n' +
    '	<div id="mnd-static-sprinkle-container">\n' +
    '		<div mnd-sprinkle autoplay="true" autoplay-delay="3" text="{{sprinkleText}}"></div>\n' +
    '	</div>\n' +
    '\n' +
    '	<div id="mnd-home-bottom">\n' +
    '		<div id="mnd-home-logo">\n' +
    '			<div class="mnd-mondora-logo">\n' +
    '				<img src="http://mnd-website.s3.amazonaws.com/img/mondora-logo.png" alt="logo" />\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '\n' +
    '<div id="mnd-video-background">\n' +
    '	<div class="mnd-video-overlay"></div>\n' +
    '	<video muted autoplay="1" loop="1" ng-src="{{videoSource}}" ng-attr-poster="{{videoPoster}}"> \n' +
    '	</video>\n' +
    '	<img ng-src="{{videoPoster}}" />\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/team/team.html',
    '<div class="team-page-container radial-background">\n' +
    '<div id="teamMembersList" class="col-sm-10 col-sm-offset-1">\n' +
    '	<br />\n' +
    '	<a ng-repeat="member in team" ui-sref="user({userId: member._id})" class="teamMember">\n' +
    '		<div mnd-cig-image source="member.profile.pictureUrl" size="100" class="mnd-inline-block"></div>\n' +
    '		<p class="teamMemberText">\n' +
    '			<b ng-bind-html="member.profile.name"></b>\n' +
    '			<br />\n' +
    '			<i ng-bind-html="member.profile.motto"></i>\n' +
    '		</p>\n' +
    '	</a>\n' +
    '	<!-- Add some space at the bottom to allow full scrolling -->\n' +
    '	<br /><br /><br /><br /><br />\n' +
    '	<br /><br />\n' +
    '</div>\n' +
    '\n' +
    '<div ng-if="!user.mondoraTeamMember" id="workWithUsBannerStripe">\n' +
    '	<div class="col-sm-6 col-sm-offset-2" ng-if="!user || !user.mondoraTeamMember">\n' +
    '		<div id="joinUsUserPicture">\n' +
    '			<div mnd-cig-image source="user.profile.pictureUrl" size="80" ng-if="user"></div>\n' +
    '			<i ng-if="!user" class="fa fa-question-circle"></i>\n' +
    '		</div>\n' +
    '		<div id="joinUsText">\n' +
    '			<div ng-if="user">\n' +
    '				<div ng-if="!linkSent">\n' +
    '					<h4>Want to join us?</h4>\n' +
    '					<p>Send us a link to your LinkedIn profile!</p>\n' +
    '					<div class="input-group">\n' +
    '						<input type="text" class="form-control" ng-model="LinkedInProfileUrl">\n' +
    '						<span class="input-group-btn">\n' +
    '							<button class="btn btn-default" ng-class="{disabled: !checkLink(LinkedInProfileUrl)}" type="button" ng-click="sendLinkedInProfile(LinkedInProfileUrl)">Send</button>\n' +
    '						</span>\n' +
    '					</div>\n' +
    '				</div>\n' +
    '				<div ng-if="linkSent">\n' +
    '					<h4>Thank you!</h4>\n' +
    '					<p>We\'ll let you know soon!</p>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '			<div ng-if="!user" ng-click="login()" class="mnd-clickable">\n' +
    '				<br />\n' +
    '				<h4>The next could be you!</h4>\n' +
    '				<a class="mnd-undecorated-a">\n' +
    '					<i class="fa fa-twitter"></i>&nbsp;&nbsp;Sign in to submit your resume\n' +
    '				</a>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/topic/topic.html',
    '<div class="post-title-image">\n' +
    '	<img ng-src="{{topic.imageUrl}}" />\n' +
    '	<div class="post-overlay"></div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="mnd-mind-container">\n' +
    '	<div mnd-mind-map map="topic.map" mnd-center></div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="post-header topic-no-margin">\n' +
    '	<div class="col-sm-8 col-sm-offset-3">\n' +
    '		<h1 class="color-me-white post-title">{{topic.name}}</span>\n' +
    '	</div>\n' +
    '</div>\n' +
    ' \n' +
    '\n' +
    '<div class="post-scroll-to-content" ng-show="isMobile"><i class="fa fa-chevron-down"></i></div>\n' +
    '\n' +
    '<div class="topic-body col-sm-6 col-sm-offset-3">\n' +
    '	<div ng-repeat="post in topic.posts" class="found-posts" >\n' +
    '		<a ui-sref="postView({postId: post._id})" class="title-topiclist mnd-undecorated-a">\n' +
    '			<h2>{{post.title}}</h2>\n' +
    '			<h4>{{post.subtitle}}</h4>\n' +
    '		</a>\n' +
    '		<div class="post-author-topiclist">\n' +
    '			<a ui-sref="user({userId: post.author._id})" >\n' +
    '				<div mnd-cig-image source="post.author.pictureUrl" size="30" class="mnd-inline-block mnd-valign-middle"></div>\n' +
    '				{{post.author.name}}\n' +
    '			</a>\n' +
    '			<span class="reading-topiclist">Reading time {{post.readingLength}} min</span>\n' +
    '		</div>\n' +
    '		<div class="topic-bottom"></div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/user/user.html',
    '<div class="user-page-container radial-background">\n' +
    '	<div class="post-top-buttons" ng-if="isUser()">\n' +
    '		<a ui-sref="profile()" class="btn btn-default">\n' +
    '			Modifica\n' +
    '		</a>\n' +
    '	</div>\n' +
    '\n' +
    '	<div class="col-sm-12">\n' +
    '\n' +
    '		<br />\n' +
    '		<br />\n' +
    '		<div class="col-xs-12 col-md-6 col-md-offset-1">\n' +
    '			<div class="row">\n' +
    '				<div class="col-xs-5 col-sm-3 col-md-5 col-lg-4">\n' +
    '					<div mnd-cig-image source="user.profile.pictureUrl" size="200" class="hidden-xs"></div>\n' +
    '					<div mnd-cig-image source="user.profile.pictureUrl" size="150" class="visible-xs"></div>\n' +
    '				</div>\n' +
    '				<div class="col-xs-6 col-xs-offset-1 col-sm-5 col-sm-offset-1 col-md-6 col-md-offset-1 col-lg-7 col-lg-offset-1">\n' +
    '					<h2 ng-bind-html="user.profile.name"></h2>\n' +
    '					<h3>\n' +
    '						<i>\n' +
    '							@<span ng-bind-html="user.profile.screenName"></span>\n' +
    '						</i>\n' +
    '					</h3>\n' +
    '					<a href="mailto:{{user.profile.email}}">{{user.profile.email}}</a>\n' +
    '					<h4>\n' +
    '						<a ng-if="user.profile.facebookUrl" ng-href="{{user.profile.facebookUrl}}" class="mnd-undecorated-a"><i class="fa fa-facebook"></i></a>\n' +
    '						<a ng-if="user.profile.twitterUrl" ng-href="{{user.profile.twitterUrl}}" class="mnd-undecorated-a"><i class="fa fa-twitter"></i></a>\n' +
    '						<a ng-if="user.profile.githubUrl" ng-href="{{user.profile.githubUrl}}" class="mnd-undecorated-a"><i class="fa fa-github"></i></a>\n' +
    '						<a ng-if="user.profile.linkedInUrl" ng-href="{{user.profile.linkedInUrl}}" class="mnd-undecorated-a"><i class="fa fa-linkedin"></i></a>\n' +
    '					</h4>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '\n' +
    '			<br />\n' +
    '			<br />\n' +
    '			<div class="user-profile-motto">\n' +
    '				<h2>Motto</h2>\n' +
    '				<h4 ng-bind-html="user.profile.motto"></h4>\n' +
    '			</div>\n' +
    '\n' +
    '			<br />\n' +
    '			<div class="user-profile-short-bio">\n' +
    '				<h2>Short bio</h2>\n' +
    '				<div ng-bind-html="user.profile.bio"></div>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '\n' +
    '		<div class="col-xs-12 col-md-3 col-md-offset-1">\n' +
    '			<div class="user-profile-posts">\n' +
    '				<h2>Articles</h2>\n' +
    '				<div ng-repeat="post in posts" class="found-posts">\n' +
    '					<a ui-sref="postView({postId: post._id})" class="mnd-undecorated-a">\n' +
    '						<h3>{{post.title}}</h3>\n' +
    '						<h4>{{post.subtitle}}</h4>\n' +
    '					</a>\n' +
    '					<div class="post-author-topiclist">\n' +
    '						<span class="reading-topiclist">Reading time {{post.readingLength}} min</span>\n' +
    '					</div>\n' +
    '					<div class="topic-bottom"></div>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/channel/edit/channelView.html',
    'Hello world!\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/channel/view/channelView.html',
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/pomodoro/list/pomodoroList.html',
    '<div class="pomodoro-page-container radial-background">\n' +
    '	<a ng-repeat="pomodoro in pomodoros" ui-sref="pomodoroView({pomodoroId: pomodoro._id})">\n' +
    '		<div mnd-pomodoro-summary></div>\n' +
    '	</a>\n' +
    '	<div class="add-pomodoro" ng-click="addPomodoro()">\n' +
    '		<i class="fa fa-plus-circle"></i>\n' +
    '	</div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/pomodoro/view/pomodoroView.html',
    '<div class="pomodoro-page-container">\n' +
    '	<div class="pomodoro-left-pane">\n' +
    '	</div>\n' +
    '	<div class="pomodoro-right-pane">\n' +
    '		<br />\n' +
    '		<div class="col-sm-9 col-sm-offset-1">\n' +
    '			<div mnd-pomodoro-timer size="200" pomodoro="pomodoro"></div>\n' +
    '\n' +
    '			<br />\n' +
    '			<button type="button" class="btn btn-default mnd-width-80" ng-click="plusFiveMinutes()">+ 5 min</button>\n' +
    '			<button type="button" class="btn btn-default mnd-width-80" ng-click="minusFiveMinutes()">- 5 min</button>\n' +
    '			<br />\n' +
    '			<button type="button" class="btn btn-default mnd-width-80" ng-if="pomodoro.status === \'paused\'" ng-click="start()">Start</button>\n' +
    '			<button type="button" class="btn btn-default mnd-width-80" ng-if="pomodoro.status === \'running\'" ng-click="pause()">Pause</button>\n' +
    '			<button type="button" class="btn btn-default mnd-width-80 pull-right" ng-click="stop()">Stop</button>\n' +
    '\n' +
    '			<br />\n' +
    '			<br />\n' +
    '			<div ng-repeat="participant in pomodoro.participants">\n' +
    '				<div class="mnd-inline-block" mnd-cig-image source="participant.pictureUrl" size="50"></div>\n' +
    '				<span>{{participant.name}}</span>\n' +
    '			</div>\n' +
    '\n' +
    '			<br />\n' +
    '			<br />\n' +
    '			<div class="input-group">\n' +
    '				<input type="text" class="form-control" placeholder="Invite" mnd-user-input user-model="participant" />\n' +
    '				<span class="input-group-btn">\n' +
    '					<button class="btn btn-default" type="button" ng-click="addParticipant()">Add</button>\n' +
    '				</span>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '\n' +
    '</div>\n' +
    '\n' +
    '\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/post/edit/postEdit.html',
    '<!--modale eliminiazione post-->\n' +
    '<div class="modal-background" ng-if="showDelete">\n' +
    '	<div id="delete-post-modal" class="modal-dialog" ng-if="showDelete">\n' +
    '		<div class="modal-content">\n' +
    '	    	<div class="modal-header">\n' +
    '				Sei sicuro di voler eliminare il post?\n' +
    '			</div>\n' +
    '			<div class="modal-body">\n' +
    '				<button type="button" class="btn btn-default yes" ng-click="deletePost()">\n' +
    '					Sì\n' +
    '				</button>\n' +
    '				<button type="button" class="btn btn-default no" ng-click="toggleDelete()">\n' +
    '					No\n' +
    '				</button>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="post-cant-edit" ng-show="isMobile"> Contenuto non accessibile da dispositivi mobile.</div> \n' +
    '<div class="post-title-image" ng-show="!isMobile">\n' +
    '	<img ng-src="{{post.titleImageUrl}}" ng-if="titleImageIsDisplayed()" alt="Immagine principale" />\n' +
    '</div>\n' +
    '\n' +
    '<div class="post-top-buttons" ng-if="isOwner()" ng-show="!isMobile">\n' +
    '	<button type="button" class="btn btn-default" ng-click="toggleDelete()" ng-if="!showDelete">\n' +
    '		Elimina\n' +
    '	</button>\n' +
    '	<button type="button" class="btn btn-default" ng-click="publishPost()" ng-if="!post.published">\n' +
    '		Pubblica\n' +
    '	</button>\n' +
    '	<button type="button" class="btn btn-default" ng-click="unpublishPost()" ng-if="post.published">\n' +
    '		Rendi privato\n' +
    '	</button>\n' +
    '	<a ui-sref="postView({postId: post._id})" class="btn btn-default">\n' +
    '		Anteprima\n' +
    '	</a>\n' +
    '</div>\n' +
    '\n' +
    '<div class="mnd-mind-container grey-border" ng-class="{\'black-connections\': !titleImageIsDisplayed()}" ng-show="!isMobile">\n' +
    '	<div mnd-mind-map map="post.map" edit="true"></div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="post-header" ng-show="!isMobile">\n' +
    '	<div class="col-sm-2 col-sm-offset-2" id="post-edit-image-upload">\n' +
    '		<input type="file" id="titleImage" ng-file-select="onFileSelect($files, \'titleImage\')" class="hidden" />\n' +
    '		<i class="fa fa-picture-o" ng-click="clickFileInput(\'titleImage\')"></i>\n' +
    '	</div>\n' +
    '	<div class="col-sm-5" id="post-edit-image-upload-progressbar">\n' +
    '		<br />\n' +
    '		<br />\n' +
    '		<span ng-show="isUploading.titleImage">\n' +
    '			<div progressbar value="uploadProgress.titleImage"></div>\n' +
    '		</span>\n' +
    '	</div>\n' +
    '	<div class="col-sm-1" id="post-edit-image-upload-abort">\n' +
    '		<br />\n' +
    '		<br />\n' +
    '		<i class="fa fa-times" ng-show="isUploading.titleImage" ng-click="abortUpload(\'titleImage\')"></i>\n' +
    '	</div>\n' +
    '	<div class="col-sm-8 col-sm-offset-2">\n' +
    '		<h1 class="simplebox post-title" ng-class="{\'color-me-white\': titleImageIsDisplayed()}" id="postTitleEditor"></h1>\n' +
    '		<h2 class="simplebox post-subtitle" ng-class="{\'color-me-white\': titleImageIsDisplayed()}" id="postSubtitleEditor"></h2>\n' +
    '	</div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="post-body" ng-show="!isMobile">\n' +
    '	<div class="col-sm-8 col-sm-offset-2">\n' +
    '		<div class="simplebox" id="postBodyEditor"></div>\n' +
    '		<div class="post-body-bottom-spacer"></div>\n' +
    '		<!-- Image upload toolbar -->\n' +
    '		<div id="rightClickToolbar" class="extraToolbar medium-editor-toolbar medium-toolbar-arrow-under medium-editor-toolbar-active">\n' +
    '			<input type="file" id="bodyImage" ng-file-select="onFileSelect($files, \'bodyImage\')" class="hidden" />\n' +
    '			<ul id="medium-editor-toolbar-actions" class="medium-editor-toolbar-actions clearfix">\n' +
    '				<li>\n' +
    '					<button class="medium-editor-action medium-editor-button-first" ng-click="clickFileInput(\'bodyImage\')">\n' +
    '						<i class="fa fa-picture-o"></i>\n' +
    '					</button>\n' +
    '				</li>\n' +
    '				<li>\n' +
    '					<button class="medium-editor-action medium-editor-button-last">\n' +
    '						<i class="fa fa-twitter"></i>\n' +
    '					</button>\n' +
    '				</li>\n' +
    '			</ul>\n' +
    '		</div>\n' +
    '		<!-- Image positioning toolbar -->\n' +
    '		<div id="imagePositioningToolbar" class="extraToolbar medium-editor-toolbar medium-toolbar-arrow-under medium-editor-toolbar-active">\n' +
    '			<ul id="medium-editor-toolbar-actions" class="medium-editor-toolbar-actions clearfix">\n' +
    '				<li>\n' +
    '					<button class="medium-editor-action medium-editor-button-first" ng-click="moveImage.left()">\n' +
    '						<i class="fa fa-align-left"></i>\n' +
    '					</button>\n' +
    '				</li>\n' +
    '				<li>\n' +
    '					<button class="medium-editor-action" ng-click="moveImage.center()">\n' +
    '						<i class="fa fa-align-justify"></i>\n' +
    '					</button>\n' +
    '				</li>\n' +
    '				<li>\n' +
    '					<button class="medium-editor-action" ng-click="moveImage.right()">\n' +
    '						<i class="fa fa-align-right"></i>\n' +
    '					</button>\n' +
    '				</li>\n' +
    '				<li>\n' +
    '					<button class="medium-editor-action medium-editor-button-last" ng-click="removeImage()">\n' +
    '						<i class="fa fa-trash-o"></i>\n' +
    '					</button>\n' +
    '				</li>\n' +
    '			</ul>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="post-end-spacer" ng-show="!isMobile"></div>\n' +
    '\n' +
    '<!-- Image upload progressbar -->\n' +
    '<script type="text/ng-template" id="pages/post/edit/progressbar.html">\n' +
    '	<div class="bodyImageProgressbar" ng-class="{hidden: !isUploading.bodyImage}" progressbar value="uploadProgress.bodyImage"></div>\n' +
    '</script>\n' +
    '\n' +
    '<script type="text/ng-template" id="pages/post/edit/bodyImage.html">\n' +
    '	<img class="bodyImageCenter" ng-src="{{url}}" />\n' +
    '</script>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/post/list/postList.html',
    '<div class="col-sm-8 col-sm-offset-4">\n' +
    '	<div ng-repeat="post in posts">\n' +
    '		<a ui-sref="postEdit({postId: post._id})">\n' +
    '			<h4>Titolo: {{post.title}}</h4>\n' +
    '		</a>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('mnd-web.templates');
} catch (e) {
  module = angular.module('mnd-web.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pages/post/view/postView.html',
    '<div class="post-page-container">	\n' +
    '	<div class="post-title-image">\n' +
    '		<img ng-src="{{post.titleImageUrl}}" ng-if="titleImageIsDisplayed()" alt="Immagine principale" />\n' +
    '		<div class="post-overlay" ng-if="titleImageIsDisplayed()"/></div>\n' +
    '	</div>\n' +
    '\n' +
    '	<div ng-if="isAuthor()" class="post-top-buttons">\n' +
    '		<a ui-sref="postEdit({postId: post._id})" class="btn btn-default">Modifica</a>\n' +
    '	</div>\n' +
    '\n' +
    '	<div id="mnd-post-sprinkle-container">\n' +
    '		<div mnd-sprinkle html="{{post.body}}" time="estimateReadingTime"></div>\n' +
    '		<div class="pull-right read-time">Reading time {{estimateReadingTime}} min</div>\n' +
    '	</div>\n' +
    '\n' +
    '	<div class="mnd-mind-container">\n' +
    '		<div mnd-mind-map map="post.map" mnd-center></div>\n' +
    '	</div>\n' +
    '\n' +
    '	<div class="post-header">\n' +
    '		<div class="col-sm-8 col-sm-offset-2">\n' +
    '			<h1 ng-bind-html="post.title" class="post-title" ng-class="{\'color-me-white\': titleImageIsDisplayed()}"></h1>\n' +
    '			<h2 ng-bind-html="post.subtitle" class="post-subtitle" ng-class="{\'color-me-white\': titleImageIsDisplayed()}"></h2>\n' +
    '			<a class="post-author" ng-if="!post.repost" ng-repeat="author in post.authors" ui-sref="user({userId: author.userId})">\n' +
    '				<div mnd-cig-image source="author.pictureUrl" size="40" class="mnd-inline-block mnd-valign-middle"></div>\n' +
    '				&nbsp;&nbsp;Author {{author.name || author.screenName}}\n' +
    '			</a>\n' +
    '			<a class="post-author" ng-if="post.repost" href="{{post.original.url}}">\n' +
    '				By {{post.original.author}}, reposted by {{post.authors.0.name || post.author.0.screenName}} \n' +
    '			</a>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '\n' +
    '	<div class="post-scroll-to-content" ng-show="isMobile"><i class="fa fa-chevron-down"></i></div>\n' +
    '\n' +
    '	<div class="post-body">\n' +
    '		<div class="first-level-html-container" ng-repeat="child in bodyChildren() track by $index">\n' +
    '			<div class="col-sm-8" ng-class="{\'col-sm-offset-2\': !commentBarIsOpen, \'col-sm-offset-1\': commentBarIsOpen, \'p-mobile\' : isMobile}">\n' +
    '				<div class="simplebox" readonly-editor data-disable-editing></div>\n' +
    '			</div>\n' +
    '			<div class="col-sm-2" ng-class="{\'comment-pop\': isMobile}">\n' +
    '				<i class="fa fa-comment comment-bubble" ng-if="!paragraphHasComments($index)" ng-click="closeCommentBar(); openCommentBarAt($index, $event)"></i>\n' +
    '				<span class="badge comment-badge" ng-if="paragraphHasComments($index)" ng-click="closeCommentBar(); openCommentBarAt($index, $event)">\n' +
    '					{{paragraphCommentsLength($index)}}\n' +
    '				</span>\n' +
    '			</div>\n' +
    '			<div ng-class="{\'hidden\': !commentBarIsOpen, \'col-sm-3\': !isMobile, \'modal-dialog\': isMobile} ">\n' +
    '				<div ng-class="{hidden: !commentBarIsOpenAt($index), \'side-comment-container\': !isMobile, \'modal-content mobile-comment\': isMobile}">\n' +
    '					<div class="col-sm-12 close-comment-bar">\n' +
    '						<i class="fa fa-times-circle" ng-click="closeCommentBar()"></i>\n' +
    '					</div>\n' +
    '\n' +
    '					<div class="col-sm-2" ng-repeat-start="comment in post.comments | filterCommentsByParagraph:$index | filterCommentsByUser:user:isAuthor()">\n' +
    '						<img class="img-circle avatar" ng-src="{{comment.userPictureUrl}}" width="32" />\n' +
    '					</div>\n' +
    '					<div class="col-sm-10 mnd-top-most" ng-mouseenter="setHighlight(comment)" ng-mouseleave="clearHighlight(comment)" ng-repeat-end>\n' +
    '	                    <p>\n' +
    '	                        <span class="comment-author">{{comment.userScreenName}}</span>\n' +
    '	                        {{comment.text}}\n' +
    '	                    </p>\n' +
    '	                    <a class="mnd-clickable" ng-if="ownsComment(comment)" ng-click="deleteComment(comment)">Elimina</a>\n' +
    '	                    <a class="mnd-clickable" ng-if="isAuthor() && !comment.approved" ng-click="publishComment(comment)">Rendi pubblico</a>\n' +
    '						<hr />\n' +
    '					</div>\n' +
    '\n' +
    '					<div ng-if="user" class="col-sm-2">\n' +
    '						<img class="img-circle avatar" ng-src="{{user.profile.pictureUrl}}" width="32" />\n' +
    '					</div>\n' +
    '					<div ng-if="user" class="col-sm-10 mnd-top-most">\n' +
    '						<p><b>{{user.profile.screenName}}</b></p>\n' +
    '						<textarea ng-model="comment.text" class="form-control" placeholder="Lascia un commento" rows="3"></textarea>\n' +
    '	                    <a class="mnd-clickable" ng-click="saveCommentAt($index)">Salva</a>\n' +
    '						<hr class="hr-comment"/>\n' +
    '						<p class="comment-warning">\n' +
    '							Questo commento è solo visibile da te e dall\'autore,\n' +
    '							a meno che l\'autore decida di renderlo pubblico\n' +
    '						</p>\n' +
    '					</div>\n' +
    '					<div ng-if="!user" class="col-sm-8">\n' +
    '						<a class="mnd-undecorated-a mnd-clickable" ng-click="login()">\n' +
    '							<i class="fa fa-question-circle fa-32"></i>\n' +
    '							<br />\n' +
    '							Login to leave a comment\n' +
    '						</a>\n' +
    '					</div>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<div class="post-body-bottom-spacer"></div>\n' +
    '	</div>\n' +
    '</div>');
}]);
})();
