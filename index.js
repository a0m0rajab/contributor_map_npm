// write a function that takes: accessToken, name, page and returns a list of contributors
// https://developer.github.com/v3/repos/#list-contributors


async function  getContributors(name, page) {
    const url = `https://api.github.com/repos/${name}/contributors?per_page=100&page=${page}`;
    const contributors = [];
    let x = await fetch(url);   
    // print data from the fetch on screen
    
    console.log(x)
    do {
        contributors.concat(await fetch(url)) ;
        const filtered = contributors.filter(c => c.login === "octocat");
        if (filtered.length > 0) {
            return filtered;
        }
    } while (false);
}

getContributors("tensorflow/tensorflow", 1)


// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
// https://github.com/tunaitis/contributor-map/blob/master/internal/github/github.go
// https://api.github.com/repos/tensorflow/tensorflow/contributors?per_page=100&page=5
// https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/