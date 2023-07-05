// write a function that takes: accessToken, name, page and returns a list of contributors
// https://developer.github.com/v3/repos/#list-contributors

const { Octokit, App } = require("octokit");
const octokit = new Octokit({ auth: `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` });


async function getContributors(name) {
    const {
        data: { login },
      } = await octokit.rest.users.getAuthenticated();
      console.log("Hello, %s", login);
      const iterator = octokit.paginate.iterator(octokit.rest.repos.listContributors, {
        owner: "tensorflow",
        repo: "tensorflow",
        per_page: 100,
      });
      
      // iterate through each response
      for await (const { data: users } of iterator) {
        for (const user of users) {
          console.log("User #%d: %s", user.id, user.login);
        }
      }
    let page = 1;
    let contributors = [];
    let list = [];
   
    do {
        let x = await fetch(`https://api.github.com/repos/${name}/contributors?per_page=100&page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                
            }});   
        // print data from the fetch on screen
        list = await x.json();
        contributors = contributors.concat(list);
        debugger;
        page++;
    } while (list.length%100 == 0 && list.length != 0);
    console.log(contributors.length);
    return contributors;
}

async function getContributors2(name) {
    let contributors = await getContributors("tensorflow/tensorflow")
    let locations = getLocations(contributors);
debugger;
}

function getLocations(contributors) {
    let locations = [];
    for (let i = 0; i < contributors.length; i++) {
        
    };}

getContributors2("tensorflow/tensorflow");

// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
// https://github.com/tunaitis/contributor-map/blob/master/internal/github/github.go
// https://api.github.com/repos/tensorflow/tensorflow/contributors?per_page=100&page=5
// https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/

// octokit: 
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods
// https://github.com/octokit/plugin-rest-endpoint-methods.js/blob/main/docs/repos/listContributors.md
// https://github.com/octokit/octokit.js#octokitrest-endpoint-methods