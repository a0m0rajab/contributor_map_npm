// yes, the code is not clean.

const { Octokit } = require("octokit");
const cities = require("./cities.json");
const synonyms = require("./synonyms.json");
const fs = require('fs');
require('dotenv').config()

function getAllContributorsList(name, auth){
  const octokit = new Octokit({ auth: auth });

  let contributors = [];
  name = name.split("/");

  const iterator = octokit.paginate.iterator(octokit.rest.repos.listContributors, {
    owner: name[0],
    repo: name[1],
    per_page: 100,
  });

  for await (const { data: users } of iterator) {
    for (const user of users) {
      if (user.type !== "User") continue;
      contributors.push(user.login);
    }
  }

  return contributors;
};

function getGraphQlQuery(contributors) {
  let query = `{`;
  contributors.forEach((user, i) => {
    query += `user${i++}: user(login: "${user.login}") {location login}`;
  });
  query += `}`;
  return query;
}

function getLocationsMap(locations){
  let locationCount = {};
  let unknownLocation = new Set();
  let userLocation;

  for (const user in locations) {
    userLocation = locationNormalisation(locations[user].location);
    if (userLocation == 'not found') {
      unknownLocation.add(locations[user].location);
    }
    if (locationCount[userLocation]) {
      locationCount[userLocation]++;
    } else {
      locationCount[userLocation] = 1;
    }
  }
  
  return {locationCount, unknownLocation};
}

async function getContributorsStats(name, auth) {
  const octokit = new Octokit({ auth: auth });
  let contributors = getAllContributorsList(name, auth);
  let query = getGraphQlQuery(contributors);
  let locations = await octokit.graphql(query);
  let {locationCount, unknownLocation} = getLocationsMap(locations);

  let unknownLocations = new Array(...unknownLocation).join('\n');
  let contributorsCount = Object.keys(locations).length;

  // let locationList = Object.keys(locationCount);
  // locationList.forEach(location => {
  //   let norm = locationNormalisation(location);
  //   if (norm == 'unknown') {
  //     nullCount++;
  //     console.log(location, " country code ", locationNormalisation(location));
  //   }
  // });
  console.log("Null Count", locationCount["null"]);
  console.log("Unknown Locations ", unknownLocations);
  console.log("Locations Count", locationCount);
  console.log("Number of contributors", contributorsCount);

  return {
    locationCount: locationCount,
    unknownCount: unknownCount,
    nullCount: locationCount["null"],
    locationsString: unknownLocations,
    contributorsCount: contributorsCount,
  };
}

function drawMap(locations, name) {
  var data = fs.readFileSync('map.svg', 'utf-8');
  let legendDetails = [];
  let legend = new Set(Object.values(locations.locationCount).sort((a, b) => a - b))
  var highest = Array.from(legend).pop();
  let step = Math.round(highest / 10);
  let paletteColors = ``;
  for (let i = 0; i <= 10; i++) {
    let numbers = i * step;
    legendDetails[i] = numbers;
    paletteColors += `.palette-color-${i} { fill: rgba(250,0,0, ${numbers / highest}) !important; }\n`;

  }
  let style = "<style>\n";
  style += paletteColors;

  for (const location in locations.locationCount) {
    let transparencyStep = getStep(locations.locationCount[location] / highest);
    style += `\t .${location.toLocaleLowerCase()} { fill: rgba(250,0,0, ${transparencyStep}); }\n`
  }
  style += "#legend9 { display: inline !important; }";

  style += "</style>";

  var newValue = data.replace(/<!-- map_style -->/g, style);

  for (let i = 0; i <= 10; i++) {
    newValue = newValue.replace(new RegExp(`>%${i}<`, 'g'), `>${legendDetails[i]}<`);
  }

  for (const location in locations.locationCount) {
    let lowerCase = location.toLocaleLowerCase();
    newValue = newValue.replace(new RegExp(`<!-- ${lowerCase}_contributions -->`, "g"), ` ${locations.locationCount[location]} Contributors`);
  };

  fs.writeFileSync(name.replace(/\//g, '_') + '.svg', newValue, 'utf-8');

  console.log('readFileSync complete');
}

function getStep(number) {
  return Math.ceil(number * 10) / 10;
}

function locationNormalisation(location) {
  if (!location) return "null";
  location = location.replace(/[\(\)/|-]/g, ",");
  let parts = location.split(",");
  parts = parts.map(part => {
    part = part.trim().toLowerCase();
    if (synonyms[part]) {
      part = synonyms[part];
    }
    part = part.split(" ").map(part => {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(" ");
    return part;
  });

  let spaceBreaks = location.split(" ");
  let countryCode = 'not found';
  let cityInfo;

  cities.every(city => {
    cityInfo = Object.keys(city);
    return cityInfo.every(info => {

      return parts.every(part => {
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

async function drawMapWrapper(name, auth) {
  if (typeof process !== 'object'){
    return console.log("Not running in node");
  }
  let locations = await getContributorsStats(name, auth);
  drawMap(locations, name);
}
// drawMapWrapper("calcom/cal.com");
// let projects = [
//   "tensorflow/tensorflow",
//   "facebook/react",
//   "vuejs/vue",
//   "angular/angular",
//   "microsoft/vscode",
//   "microsoft/TypeScript",
//   "denoland/deno",
//   "nodejs/node",
// ];
// projects.forEach(project => {
//   drawMapWrapper(project);
// });
// console.log(locationNormalisation("Dresden"))
// console.log(locationNormalisation("San Francisco"))
// console.log(locationNormalisation("HangZhou"))
// console.log(process.title)
// console.log()

module.exports = {drawMapWrapper, getContributorsStats, drawMap, locationNormalisation};

// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
// https://github.com/tunaitis/contributor-map/blob/master/internal/github/github.go
// https://api.github.com/repos/tensorflow/tensorflow/contributors?per_page=100&page=5
// https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/

// octokit:
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods
// https://github.com/octokit/plugin-rest-endpoint-methods.js/blob/main/docs/repos/listContributors.md
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods

// write a function that takes: accessToken, name, page and returns a list of contributors
// https://developer.github.com/v3/repos/#list-contributors
// https://stackoverflow.com/questions/34550890/how-to-detect-if-script-is-running-in-browser-or-in-node-js
// https://levelup.gitconnected.com/how-to-build-a-cli-npm-package-3ba98d6f9d4e