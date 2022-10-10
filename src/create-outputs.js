const fs = require('fs');
const path = require('path');

const toposort = require('toposort');

const { getPackages } = require('./get-packages');

const getAllDependencies = (pkg) => ([
  ...Object.keys(pkg.dependencies ?? []),
  ...Object.keys(pkg.devDependencies ?? []),
  ...Object.keys(pkg.peerDependencies ?? []),
]);

const writeReleaseOrderMarkdown = (graph) => {
  const fileData = [
    '# Release Order',
    '',
    ...graph.map((n) => `- ${n}`),
  ].join('\n');

  fs.writeFile(
    path.resolve(__dirname, '../output/release-order.md'),
    // append final newline
    `${fileData}\n`,
    (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );
};

getPackages((packages) => {
  const firstOrderDependencyLookup = packages.reduce(
    (acc, { name }) => {
      if (!acc[name]) {
        acc[name] = true;

        return acc;
      }

      return acc;
    },
    {},
  );

  const graph = packages.flatMap((pkg) => getAllDependencies(pkg).reduce(
    // if the dependency is inside our list of repositories, we want to add it
    (acc, dependency) => firstOrderDependencyLookup[dependency]
      ? [...acc, [dependency, pkg.name]]
      : acc,
    [],
  ));

  const sortedGraph = toposort(graph);

  return writeReleaseOrderMarkdown(sortedGraph);
});

