# Contributing to FinCoach AI

First off, thank you for considering contributing to FinCoach AI! It's people like you that make FinCoach AI such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/ardamoustafa1/FinCoach-AI/issues) page to see if someone else has already created a ticket. If not, go ahead and make one!

## Fork & create a branch

If this is something you think you can fix, then fork FinCoach AI and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-dark-mode
```

## Get the test suite running

Make sure to run the tests to ensure everything is working correctly before submitting your PR.
```sh
npm run test:unit
npm run test:e2e
```

## Implement your fix or feature

At this point, you're ready to make your changes. Feel free to ask for help; everyone is a beginner at first.

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with FinCoach AI's master branch:

```sh
git remote add upstream git@github.com:ardamoustafa1/FinCoach-AI.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-dark-mode
git rebase master
git push --set-upstream origin 325-add-dark-mode
```

Finally, go to GitHub and make a Pull Request.
