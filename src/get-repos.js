require('dotenv').config();

const octokit = require('octokit');
const { exec } = require('child_process');

const { getBlacklist } = require('./get-packages');

// const ORGANIZATION_NAME = 'sensource';
const GITHUB_REPOS_URL = '/orgs/{org}/repos';

const [ORGANIZATION_NAME] = process.argv.slice(2);

const REPO_BLACKLIST = getBlacklist();

const oct = new octokit.Octokit({ auth: process.env.GITHUB_API_KEY });

const getRepos = async (page, perPage = 100) => oct.request(
  `GET ${GITHUB_REPOS_URL}`,
  {
    page,
    org: ORGANIZATION_NAME,
    per_page: perPage,
  },
).then((repos) => repos.data);

const shouldRepoBeExcluded = (conds) => conds.some((c) => c);

const getPackageJsonForRepo = async (repoName, sshUrl) => {
  console.log(`git clone -n _ --depth 1  [${repoName}]`);

  exec(`git clone -n ${sshUrl} --depth 1`, { cwd: `./repositories` }, (err) => {
    if (err) {
      console.log(err);

      return;
    }

    console.log(`git checkout HEAD package.json [${repoName}]`);

    exec('git checkout HEAD package.json', { cwd: `./repositories/${repoName}` }, (err) => {
      if (err) {
        console.log(err);

        return;
      }
    });
  });
}

const getPageOfRepos = async (page, totalRepos) => {
  const repos = await getRepos(page);

  if (!repos.length) {

    if (page === 1) {
      console.error('No repos were found. Make sure your Github API key is correct and that repos exist within your organization')

      return;
    }

    console.log(`*** Processed ${totalRepos} total repositories ***`);

    return;
  }

  for (let idx = 0; idx < repos.length; idx += 1) {
    const { name, ssh_url, fork } = repos[idx];

    if (
      shouldRepoBeExcluded([
        fork,
        REPO_BLACKLIST.some((r) => r === name),
      ])
    ) {
      continue;
    }

    await getPackageJsonForRepo(name, ssh_url);
  }

  await getPageOfRepos(page + 1, totalRepos + repos.length)
}


const work = async () => {
  getPageOfRepos(1, 0);
}

work().catch(console.error);
