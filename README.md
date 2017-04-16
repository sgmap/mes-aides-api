[![Stories in Ready](https://badge.waffle.io/sgmap/mes-aides-api.png?label=ready&title=Ready)](https://waffle.io/sgmap/mes-aides-api)
A mapping interface between the [mes-aides](https://mes-aides.gouv.fr) [user interface](https://github.com/sgmap/mes-aides-ui) and the [OpenFisca](http://openfisca.fr) simulation engine.

> Une interface de lien entre l'interface utilisateur de mes-aides et OpenFisca.

If you want to run the mes-aides application, you should run [`mes-aides-ui`](https://github.com/sgmap/mes-aides-ui).


Installing
==========

System dependencies
-------------------

### Ubuntu

Make sure `build-essential`, `mongodb` and `node` v0.10 are installed on your machine

```sh
sudo apt-get install build-essential
sudo apt-get install mongodb
sudo apt-get install libkrb5-dev
```

### For all platforms

The runtime is Node 0.10.

You can for example use [`nvm`](https://github.com/creationix/nvm) to install this specific version.


Application
-----------

```sh
git clone https://github.com/sgmap/mes-aides-api.git
cd mes-aides-api
npm install
```

### Development mode

If you need to add features to the API but want to see the impact on the application, follow the `mes-aides-ui` installation procedure.


Usage
-----

First, start a Mongo server:

```sh
mongod --dbpath db
```

Then, start the server:

```sh
npm start
```
