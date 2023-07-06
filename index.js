// write a function that takes: accessToken, name, page and returns a list of contributors
// https://developer.github.com/v3/repos/#list-contributors

const { Octokit, App } = require("octokit");
const { graphql } = require("@octokit/graphql");
const octokit = new Octokit({ auth: `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` });
const cities = require("./cities.json");

async function getContributors(name) {
  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();
  // console.log("Hello, %s", login);
  const iterator = octokit.paginate.iterator(octokit.rest.repos.listContributors, {
    owner: "tensorflow",
    repo: "tensorflow",
    per_page: 100,
  });

  // iterate through each response
  let i = 0;
  let query = `{`;
  for await (const { data: users } of iterator) {
    for (const user of users) {
      // console.log("User #%d: %d %s ", i++ ,user.id, user.login);
      query += `user${i++}: user(login: "${user.login}") {location login}`;
    }
  }
  query += `}`;
  debugger;
  let locations = await octokit.graphql(query);
  debugger;
  let locationCount = {};
  let userLocation;
  for (const user in locations) {
    userLocation = locations[user].location;
    if (locationCount[userLocation]) {
      locationCount[userLocation]++;
    } else {
      locationCount[userLocation] = 1;
    }
  }

  let locationList = Object.keys(locationCount);
  let emptyCounter = 0;
  locationList.forEach(location => {
    let norm = locationNormalisation(location);
    if(norm == 'unknown') {
    emptyCounter++;
    console.log(location, " country code " ,  locationNormalisation(location));
    }
  });
  console.log("empty counter ", emptyCounter);
  debugger;

}

function locationNormalisation(location) {
  location = location || "";
  let parts = location.split(",");
  let countryCode = 'unknown';
  cities.forEach(city => {
    if (parts.length == 3) {
      if (parts[0] === city.name || parts[0] === city.country_name || parts[0] === city.region_name) {
        countryCode = city.country_code
        return; 
      }
    } else if (parts.length == 2) {
      if (parts[0] === city.name || parts[0] === city.country_name || parts[0] === city.region_name) {
        countryCode = city.country_code
        return;
      }

    } else if (parts.length == 1) {
      if (parts[0] === city.name || parts[0] === city.country_name || parts[0] === city.region_name){
        countryCode = city.country_code
        return;
      }
    }
  })
  return countryCode;
}

getContributors("tensorflow/tensorflow");
// console.log(locationNormalisation("Dresden"))

// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
// https://github.com/tunaitis/contributor-map/blob/master/internal/github/github.go
// https://api.github.com/repos/tensorflow/tensorflow/contributors?per_page=100&page=5
// https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/

// octokit:
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods
// https://github.com/octokit/plugin-rest-endpoint-methods.js/blob/main/docs/repos/listContributors.md
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods