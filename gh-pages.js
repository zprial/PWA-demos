const ghpages = require('gh-pages');

ghpages.publish('demos', function(err) {
  console.log(err)
});
