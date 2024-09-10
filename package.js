/* global Package */
Package.describe({
    name: 'socialize:likeable',
    summary: 'A package implementing social "liking" or "starring"',
    version: '1.0.6',
    git: 'https://github.com/copleykj/socialize-likeable.git',
});

Package.onUse(function _(api) {
    api.versionsFrom(['1.10.2', '2.3','3.0']);

    api.use([
        'socialize:user-blocking',
        'reywood:publish-composite',
    ]);

    api.imply('socialize:user-blocking');

    api.mainModule('server/server.js', 'server');
    api.mainModule('common/common.js', 'client');
});
