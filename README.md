# DHIS2 Metadata Integrity App
This app will help you to assess your metadata quality 
using the built-in checks in DHIS2.

## License
© Copyright 2023 University of Oslo


## Getting started

### Install dependencies
To install app dependencies:

```
yarn install
```

### Compile to zip
To compile the app to a .zip file that can be installed in DHIS2:

```
yarn run zip
```

### Start dev server
To start the webpack development server:

```
yarn start
```

By default, webpack will start on port 8081, and assumes DHIS2 is running on 
http://localhost:8080/dhis with `admin:district` as the user and password.

A different DHIS2 instance can be used to develop against by adding a `d2auth.json` file like this:

```
{
    "baseUrl": "localhost:9000/dev",
    "username": "john_doe",
    "password": "District1!"
}
```
