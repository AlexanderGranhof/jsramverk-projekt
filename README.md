![CI](https://github.com/AlexanderGranhof/jsramverk-projekt/workflows/CI/badge.svg?branch=master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/AlexanderGranhof/jsramverk-projekt/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/AlexanderGranhof/jsramverk-projekt/?branch=master)

# Tagalong
Tagalong is a simulated realtime forex-like exchange websites for virtual coins named after common programming languages. The name tagalong stems from the disney movie Robinhood, where tagalong is a character. Why Robinhood? There is a popular stock exchange app called robinhood.

## Setup
1. Have `docker` and `docker-compose` installed
2. Have the ports 80 and 3001 open, or change the ports in the `docker-compose.prod.yml` file
3. Run `docker-compose -f docker-compose.prod.yml up` to start the application
4. Visit [http://localhost](http://localhost) to view the application

## Requirement 1 - Backend
For my backend i chose to use node.js written in Typescript as my choice of language along with the express http library. For authentication i chose to use JWT that are stored in cookies. My reasoning behind my choices are that i have used express many times before and i am comfortable with it. I was considering using fastify as its more modern that express and is much faster, but i knew i would be spending most of my time on the chart, so i chose the safe option and went with express. Lastly for JWT ive grown to like it over the cookies. Before i had to deal with caching the JWT in localstorage. But i've learnt that you should only store it in a httpOnly cookie and nowhere else as it is very unsafe. And you do not have to deal with the session storage in the backend, which makes it easier.

I've also chosen to use typescript on both frontend and backend. It makes the intellisense much better and prevents countless bugs from occuring since it has typechecking.

## Requirement 2 - Frontend
For the frontend i chose to use react written in Typescript, i am already familiar with React and i chose to use it so i can deepen my knowledge about react. For the chart i chose to built it from scratch with the help of d3.js. d3 provides data scaling tools which are really helpful when making charts. I made the chart using svg. The combination of d3, svg and react makes it very easy to have a realtime chart.

## Requirement 3 - Realtime
I chose to use socket.io as i have used this library before this course and its easy to use. I chose to do most of the transactions through sockets, even selling and purchasing. What i dont know how to do properly yet is how you should structure the event names. How can you avoid event name clashing when you have >100 events. This I do not know yet and wish to learn more about.

## Requirement 4 - Backend testing
For testing the backend i chose to use jest. The main reasoning behind to use jest is that the react library uses this testing library, makes it easier to have the same testing library for backend and frontend. For my continous integration i chose to use Github Actions. This is something completely new to me and found it to be relatively easy to get started with. Github Actions supports docker and containers, along with network natively and there is no additional confugration you need to do to support docker. In the scope of this project i found no limitation on Github Actions as of yet.

## Requirement 5 - Frontend testing
I chose to not use selenium for testing, rather opting for the testing environment that is provided by react. Since react renders a virtual DOM you do not need to have a client running and a headless browser to directly access it. With react you can test and render a virtual DOM that can be easily tested with tools that are provided by react. The react virtual DOM can provide everything selenium does in terms of testing. The only missing thing missing from react testing is visual reporting of the website. In the scenario where a test fails, you want to take a screenshot perhaps and send that to some logging server.

I created tests for each view i had in the application, those are the following:

#### Home
This is the view that every user can see. This test in particular is quite simple. I verify that the title, subtitle and logo is visble after the animation and is not stuck on not being visible. This was an issue before where the animation got stuck.

#### Market
This is the view where a signed in user can see the market. Im simulation a fake user and i verify that the chart actually gets rendered along with the title and subtitle

#### Profile
In the profile view, the user can see their balance where they can also add $100 to their balance. In the test i mocked a fake user and the fetch API to return a fake request from the server. I then verify that the balance text gets updated and is formatted correctly and verify that all the elements are rendered and not hidden.

#### Register
In register a user can create an account that they can use to trade with. In the test i write to the input fields and mock the fetch api to send a fake request. I verify that the form actually sends a request and that the form does not error with the input.

#### SignIn
This view is very similar to register and practically does the same tests. But they are seperate components so it still needs to be tested.