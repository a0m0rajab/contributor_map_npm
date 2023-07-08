// write a function that takes: accessToken, name, page and returns a list of contributors
// https://developer.github.com/v3/repos/#list-contributors

const { Octokit, App } = require("octokit");
const { graphql } = require("@octokit/graphql");
const octokit = new Octokit({ auth: `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` });
const cities = require("./cities.json");
const synonyms = require("./synonyms.json");
const fs = require('fs');


async function getContributors(name) {
  name = name.split("/");
  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();
  // console.log("Hello, %s", login);
  const iterator = octokit.paginate.iterator(octokit.rest.repos.listContributors, {
    owner: name[0],
    repo: name[1],
    per_page: 100,
  });

  // iterate through each response
  let i = 0;
  let query = `{`;
  for await (const { data: users } of iterator) {
    for (const user of users) {
      if (user.login.includes("[bot]")) continue;
      // console.log("User #%d: %d %s ", i++ ,user.id, user.login);
      query += `user${i++}: user(login: "${user.login}") {location login}`;
    }
  }
  query += `}`;
  debugger;
  let locations = await octokit.graphql(query);
  console.log("Number of contributors", Object.keys(locations).length);
  debugger;
  let locationCount = {};
  let unknownLocation = new Set();
  let userLocation;
  let emptyCounter = 0;
  for (const user in locations) {
    userLocation = locationNormalisation(locations[user].location);
    if (userLocation == 'unknown') {
      emptyCounter++;
      unknownLocation.add(locations[user].location);
      continue;
    }
    if (locationCount[userLocation]) {
      locationCount[userLocation]++;
    } else {
      locationCount[userLocation] = 1;
    }
  }

  // let locationList = Object.keys(locationCount);
  // locationList.forEach(location => {
  //   let norm = locationNormalisation(location);
  //   if (norm == 'unknown') {
  //     emptyCounter++;
  //     console.log(location, " country code ", locationNormalisation(location));
  //   }
  // });
  console.log("empty counter ", emptyCounter);
  console.log(new Array(...unknownLocation).join('\n'));
  console.log("Locations", locationCount);
  debugger;
  return {
    locationCount: locationCount,
    unknownCount: emptyCounter,
    locationsString: new Array(...unknownLocation).join('\n'),
  };
}

function drawMap(locations, name) {
  var data = fs.readFileSync('map.svg', 'utf-8');
  let legend = new Set(Object.values(locations.locationCount).sort((a, b) => a- b))
  var highest = Array.from(legend).pop();
  let style = "<style>";
  for (const location in locations.locationCount){
    style += `\t .${location.toLocaleLowerCase()} { fill: rgba(250,0,0, ${locations.locationCount[location]/highest}); }\n`
  }
  style += "</style>"

  var newValue = data.replace(`<!-- map_style -->`, style);

  fs.writeFileSync( name.replace('/','_') + '.svg', newValue, 'utf-8');

  console.log('readFileSync complete');
}

function locationNormalisation(location) {
  if (!location) return "unknown";
  location = location.replace(/[\(\)/|-]/g, ",");
  let parts = location.split(",");
  let spaceBreaks = location.split(" ");
  let countryCode = 'unknown';
  let cityInfo;

  cities.every(city => {
    cityInfo = Object.keys(city);
    return cityInfo.every(info => {

      return parts.every(part => {
        part = part.trim();
        if (synonyms[part]) {
          part = synonyms[part];
        }
        if (part === city[info]) {
          countryCode = city.country_code;
          return false;
        }
        return true;
      });

      // spaceBreaks.forEach(part => {
      //   part = part.trim();
      //   if (synonyms[part]) {
      //     part = synonyms[part];
      //   }
      //   if (part === city[info]) {
      //     countryCode = city.country_code;
      //     return;
      //   }
      // });
    });

  });
  return countryCode;
}

async function drawMapWrapper(name) {
  let locations = await getContributors(name);
  drawMap(locations, name);
}
drawMapWrapper("vuejs/core");
console.log(locationNormalisation("Dresden"))
console.log(locationNormalisation("San Francisco"))

// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
// https://github.com/tunaitis/contributor-map/blob/master/internal/github/github.go
// https://api.github.com/repos/tensorflow/tensorflow/contributors?per_page=100&page=5
// https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/

// octokit:
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods
// https://github.com/octokit/plugin-rest-endpoint-methods.js/blob/main/docs/repos/listContributors.md
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods