# README

## What

- For cases in which you need to create releases in a large organization but your dependency graph requires a specific release order. This project will generate a `release-order.md` file in the `/output` directory with the list of repositories in the correct order. Repos which don't have any upstream or downstream dependencies will be at the very top, followed by the most upstream ones, so on and so forth.

- Due to the potential large size of the log output, the github requests are logged to the `/logs/get-repos.log` file.

## Setup

- You will need to place a `.env` file at the root of the project and put your github API key inside if you're fetching from private repositories.

  - `GITHUB_API_KEY=<api key here>`

- If there are repositories you wish to exclude from the output, put each repository name, separated by newlines at `/repositories/exclusions.txt`.
- For example:

  ```text
  repo1
  repo2
  repo3
  ```

## Running the project

- It is required to set your organization name for this project to work
  - On linux and MacOS
    - `ORG=<organization name> yarn run gen`
