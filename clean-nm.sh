find ./node_modules -type f |egrep "(.idea|.vscode|benchmark.js|.eslintrc.js|changelog|AUTHORS|license|LICENSE|LICENCE|.travis.yml|.eslintrc.json|.eslintrc.yml|Makefile|.npmignore|.DS_Store|.jshintrc|.eslintrc.BSD|.editorconfig|tsconfig.json|.coveralls.yml|appveyor.yml|.gitattributes|.eslintignore|.eslintrc|.eslintignore.BSD|.babelrc)" |xargs rm -rf;
find node_modules -type f | egrep "\.(md|mdon|markdown|log|ts|swp|jst|coffee|txt|BSD|m?js.map)$" | xargs rm -f;
find node_modules -type d | egrep "(test|docs|doc|examples|example|.githubs|@types)" | xargs rm -rf;
