var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var path = require('path');

function req(link) {
  console.log(link);
  return new Promise((resolve, reject) => {
    request(link, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(err);
      }
    })
  });
}

function append(file, text) {
  return new Promise((resolve, reject) => {
    fs.appendFile(path.join(__dirname, file), text, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  });
}

function sleep(delay) {
  return () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, delay)
    })
  };
}

req('http://ncode.syosetu.com/n2267be/')
  .then((body) => {
    var $ = cheerio.load(body);
    var chapters = $('.subtitle');
    return chapters.map((i, e) => {
      return 'http://ncode.syosetu.com' + $(e).children().attr('href');
    })
    .get()
    .map((href) => Promise.resolve(href))
    .reduce((prev, next) => {
      return prev
        .then((href) => {
          return req(href);
        })
        .then((body) => {
          var $ = cheerio.load(body);
          var text = $('#novel_honbun').text();
          return append('rezero.txt', text);
        })
        .then(sleep(2000))
        .then(() => {
          return next;
        });
    })
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });