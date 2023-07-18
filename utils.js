const fs = require('fs');

function setEnv(GitHubToken){
    fs.writeFileSync('.env', `GitHubToken=${GitHubToken}`);    
};

module.exports = {setEnv};