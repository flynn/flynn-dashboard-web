(function () {
"use strict";

FlynnDashboard.GithubClient = Marbles.Utils.createClass({
	displayName: "GithubClient",

	mixins: [{
		ctor: {
			middleware: [
				Marbles.HTTP.Middleware.SerializeJSON
			]
		}
	}],

	willInitialize: function (clientId, accessToken) {
		if ( !clientId || !accessToken ) {
			throw new Error(this.constructor.displayName +": Invalid client: "+ JSON.stringify(clientId) +", "+ JSON.stringify(accessToken));
		}
		this.clientId = clientId;
		this.accessToken = accessToken;
	},

	performRequest: function (method, path, args) {
		args = args || {};

		if ( !path ) {
				var err = new Error(this.constructor.displayName +".prototype.performRequest(): Can't make request without path");
			setTimeout(function () {
				throw err;
			}.bind(this), 0);
			return Promise.reject(err);
		}

		var middleware = args.middleware || [];
		delete args.middleware;

		middleware = middleware.concat([{
			willSendRequest: function (request) {
				request.setRequestHeader("Authorization", "token "+ this.accessToken);
			}.bind(this)
		}]);

		return Marbles.HTTP(Marbles.Utils.extend({
			method: method,
			middleware: [].concat(this.constructor.middleware).concat(middleware),
			headers: Marbles.Utils.extend({
				Accept: 'application/json'
			}, args.headers || {}),
			url: "https://api.github.com" + path
		}, args)).then(function (args) {
			var res = args[0];
			var xhr = args[1];
			return new Promise(function (resolve, reject) {
				if (xhr.status >= 200 && xhr.status < 400) {
					resolve([res, xhr]);
				} else {
					reject([res, xhr]);
				}
			});
		});
	},

	getUser: function () {
		return this.performRequest('GET', '/user');
	},

	getOrgs: function () {
		return this.performRequest('GET', '/user/orgs');
	},

	getRepos: function (params) {
		return this.performRequest('GET', '/user/repos', { params: params });
	}
});

})();