Bi-Directional Adapter
=========================

[![npm version](https://img.shields.io/npm/v/bidirectional-adapter.svg?style=flat-square)](https://www.npmjs.com/package/bidirectional-adapter)
[![npm downloads](https://img.shields.io/npm/dm/bidirectional-adapter.svg?style=flat-square)](https://www.npmjs.com/package/bidirectional-adapter)

Factory to create bi-directional adapters that can convert between two distinct data structures.
Using adapters helps to decouple systems which share common data structures and may need to alter them
independently without introducing conflicts in each other.

## Why?

You have multiple services which each operate on a single shared resource but want to represent the data
differently in each service or want to isolate each service from data structure changes required by the other.

With `bidirectional-adapter` you can define a simple entity which can be used to transform data between two formats.

```ts
const adapter = createAdapter<string, number>(
    (stringValue) => parseInt(stringValue, 10),
    (numericValue) => String(numericValue)
);
```

## Example

```ts
import axios from 'axios';
import createAdapter from 'bidirectional-adapter';

const accountAdapter = createAdapter(
    (dbAccount) => ({
        id: dbAccount.user_id,
        name: `${dbAccount.user.firstName} ${dbAccount.user.lastName}`,
        email: dbAccount.user.email
    }),
    (appAccount) => ({
        user_id: appAcount.id,
        user: {
            firstName: appAccount.name.split(' ')[0],
            lastName: appAccount.name.split(' ')[1]
        },
        email: appAccount.email
    })
);

const fetchAccount = (userID) => {
    // state is in the shape of propertyTwo
    // do reducer stuff here
    return axios.get(`/account/${userID}`).then(res => accountAdapter.fromDB(res.data));
};

const updateAccount = (account) => {
    // state is in the shape of propertyTwo
    // do reducer stuff here
    return axios.post(`/account/${userID}`, accountAdapter.toDB(account));
};
```

## Installation

To use `bidirectional-adapter`, install it as a dependency:

```bash
# If you use npm:
npm install bidirectional-adapter

# Or if you use Yarn:
yarn add bidirectional-adapter
```

This assumes that you’re using a package manager such as [npm](http://npmjs.com/).

## License

[ISC](LICENSE.md)