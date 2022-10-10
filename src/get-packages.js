const { readdir, readFileSync } = require('fs');
const path = require('path');

const REPO_PATH = '../repositories';

const getDirectories = (source, callback) => readdir(
  path.resolve(__dirname, source),
  { withFileTypes: true },
  (err, files) => {
    if (err) {
      callback(err)
    }

    const directoryNames = files.reduce(
      (acc, curr) => {
        if (!curr.isDirectory()) {
          return acc;
        }

        return [...acc, curr.name];
      },
      [],
    );

    callback(directoryNames);
  },
);

const readJsonFile = (source) => {
  return JSON.parse(readFileSync(path.resolve(__dirname, source)));
};

const getPackages = (callback) => {
  return getDirectories(REPO_PATH, (dirs) => {
    return callback(
      dirs.map((d) => readJsonFile(`${REPO_PATH}/${d}/package.json`))
    )
  });
};

const getBlacklist = () => {
  try {
    return readFileSync(path.resolve(__dirname, `${REPO_PATH}/exclusions.txt`))
      .toString()
      .split('\n')
      .reduce((acc, curr) => !!curr ? [...acc, curr.trim()] : acc, []);
  }
  catch (_) {
    return '';
  }
};

exports.getPackages = getPackages;
exports.getBlacklist = getBlacklist;
