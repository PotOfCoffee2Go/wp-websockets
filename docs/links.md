## Resource names

A  resource name (or *'path'*) syntax is **/route/service/collection/resourceId/...**

 * route - system that implements this resource
 * service - the service that processes your request
 * collection - a collection of similar items
 * resourceId - id of the item of interest
 * ... - drills down into the fields of the item


Route and service can be thought of as working together. **All path names** have a route and service as the first two fields. Each Route has it's own set of predefined Services.

Examples
 * /db/storage
 * /api/auctions
 * /api/users
 * /mysql/db

Collections and ResourceIds work together. A **collection** is a set of items that usually have similar properties. For example a collection of Users, or collection of Cars, or collection of Dogs. A **resourceId** is the unique identifier of an individual in a collection. For example, in a collection of Dogs there might be resourceIds of *Fido*, *Buddy*, *Daisy*, *Max*, and *Molly*. Thus the path to get information about Fido would be  '/db/storage/dogs/Fido'. That path would return the data about the dog named *Fido* that is stored on the server.

#### Uniform Resource Identifier
A generic URI is of the form -   protocol://domain:port/path?query#fragment

The *path* is already discussed above.  The protocol is the underlying scheme used to transmit information. FTP, HTTP, HTTPS, FILE, IRC, MAILTO, and DATA are but a few of the schemes out there. Regardless of the scheme, the *path* would remains the same.
The domain:port is the registered name or IP address of the host running the server software.
The *query#fragment* part allows the requester to provide parameters to the *Service - (see above)* that is handling the request.

----

The current routes are :

 * db - direct database access
 * api - common functions programmed on the server-side
 * mysql - access to the CMS mysql database
 
----

### Auction resource
The auction resource 

 * Complete auction database
   * [/api/auctions](https://wp-websockets-potofcoffee2go.c9users.io/api/auctions)
 * All auction system users 
   * [/api/auctions/user](https://wp-websockets-potofcoffee2go.c9users.io/api/auctions/user)
 * All auctions in the auction system
   * [/api/auctions/auction](https://wp-websockets-potofcoffee2go.c9users.io/api/auctions/auction)
 * Auction item with resourceId of 'a122'
   * [/api/auctions/auction/a122](https://wp-websockets-potofcoffee2go.c9users.io/api/auctions/auction/a122)
 * Auction user with resourceId of 'u3'
  * [/api/auctions/user/u3](https://wp-websockets-potofcoffee2go.c9users.io/api/auctions/user/u3)


### Message database
 * Complete message database
   * [/api/messages](https://wp-websockets-potofcoffee2go.c9users.io/api/messages)
 * Auction Bid messages for auction item '117'
   * [/api/messages/bids/117](https://wp-websockets-potofcoffee2go.c9users.io/api/messages/bids/117)

### Storage database

An easy way to get data is via JQuery's $.getJSON() function.

```js
var host = 'https://wp-websockets-potofcoffee2go.c9users.io';
$.getJSON( host + '/api/auctions/user/u1', function( auctions ) {
    // do something with data
    alert('User u1 is: ' + auctions.user.u1.display_name);
}
```

