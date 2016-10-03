# Game On! Webapp Service

[![Codacy Badge](https://api.codacy.com/project/badge/grade/97dba9bf5a944578b56831a974f225fa)](https://www.codacy.com/app/gameontext/gameon-webapp)

See the Swagger service [information page](https://gameontext.gitbooks.io/gameon-gitbook/content/microservices/webapp.html) in the Game On! Docs for more information on how to use this service.

## Contributing

Want to help! Pile On! 

[Contributing to Game On!](https://github.com/gameontext/gameon/blob/master/CONTRIBUTING.md)

## Run tests:
From the project's root:

    npm install (only once)
    npm test

Then go to the webpage mentioned in the console's output on your browser. That will kick off continuous testing by karma, so any save to a .js file in the scripts (or bower_components) folder, or to a test file in the /test folder, will trigger re-run of the test suite.
