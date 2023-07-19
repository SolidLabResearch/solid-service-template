# Solid service template

This template helps you to get started with creating a Solid service.
We rely on the [Client Credentials](https://communitysolidserver.github.io/CommunitySolidServer/6.x/usage/client-credentials/) 
offered by the [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer) (CSS).
The advantage is that it allows the service to work without user interaction for authentication.
The disadvantage is that it doesn't work with other Solid servers.
This only applies to authentication.
Once authentication is done, 
everything else works as expected when you follow the Solid protocol.
When there is a specification on how to do this type of authentication with every Solid server,
we will update this template.

## Features

- Community Solid Server to test with pods locally.
- [Comunica](https://comunica.dev/) for querying pods and other data sources.

## Usage

1. Clone this repository via
   ```shell
   git clone https://github.com/SolidLabResearch/solid-service-template.git
   ```
2. Install the dependencies via 
   ```shell
   npm i
   ```
3. Prepare the pods via
   ```shell
   npm run prepare:pods
   ```
4. Start Solid server with the pods via
   ```shell
   npm run start:pods
   ```
   Keep this process running.
5. In another terminal start the service via
   ```shell
   npm start
   ```
6. The service does the following things.
   1. GET a public resource with an unauthenticated fetch.
   2. GET a private resource with an authenticated fetch.
   3. Query a private resource with Comunica using an authenticated fetch.

If at some point you want to reset the pod data,
you do 
```shell
npm run reset:pods
```

## Pod data

You find the initial pod data in the folder `initial-pod-data`.
It has two resources:
- `favourite-books`: this list contains the favourite books of the user. 
   This list is private. only the user has read, write, and control access.
   This is specified in `favourite-books.acl`.
- `wish-list`: this list contains the wish list of book of the user.
   This list is public: everybody can read the list, but only the user can write and control it.
   This is specified in `wish-list.acl`.

You find the shape to which the above two resources adhere in `shapes/book-list.ttl`.

## License

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/) and
released under the [MIT license](http://opensource.org/licenses/MIT).
