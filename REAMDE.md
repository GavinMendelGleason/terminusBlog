# Terminus Blog

How easy is it to make a blog-focused CMS in TerminusDB?

Very!

This project is designed to show how you can build a custom web-app
using TerminusDB from scratch with little effort.

## The Schema

What do we want to store in a blog?  Typically we have: Authors, Posts, SiteMap,
and Pages. Let's start with those...

```javascript
{ "@type" : "Class",
  "@id" : "Author",
  "name" : "xsd:string",
  "avatar" : "xsd:anyURI"
  "bio" : "xsd:string" }
```

Our author is just a name, a bit of text describing who they are, and
a URI which we will use to display an image.

```javascript
{ "@type" : "Class",
  "@id" : "Post",
  "title" : "xsd:string",
  "content" : "xsd:string",
  "date" : "xsd:dateTime",
  "author" : { "@type" : "Set", "@class" : "Author" } }
```

Posts have a title, the actual content of the blog post, and a set of
possible authors (since sometimes you have more than one person
writing a piece) and when it was made.

```
{ "@type" : "Class",
  "@id" : "Page",
  "title" : "xsd:string",
  "content" : "xsd:string" }
```

Not much to a page! Just a timeless post.

```javascript
{ "@type" : "Class",
  "@id" : "SiteMap",
  "items" : { "@type" : "Set", "@class" : "SiteItem" }}

{ "@type" : "Class",
  "@id" : "SiteItem",
  "name" : "xsd:string",
  "location" : "xsd:anyURI" }
```

And a site map is just a set of items, with a name and location.

We can put all of this in a file, [schema.json](schema.json) and then (assuming we've already installed TerminusDB) load it with the command:

```shell
terminusdb store init
terminusdb db create admin/blog
terminusdb doc insert admin/blog -g schema -f < schema.json
```

Terminus will respond with:

```
Documents inserted:
 1: Author
 2: Post
 3: Page
 4: SiteMap
 5: SiteItem
```

## Layout

Now we want to actually design our website. First, let's create a
basic structure.

Assuming you have [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed, you can run the following to start a react app.

```shell
npx create-react-app blog
```

I would also like to use GraphQL, so I'll install the Apollo client.

```shell
npm install @apollo/client
```

Now we're basically ready to go, we just need to edit or `App.js` file
and give ourselves a river of news.

My App.js file, I've edited to look like this:

```js
```

Ok, so there is some boiler plate.

Notice, we've imported some Apollo client stuff. We also set our
graphql server to be where we will put our TerminusDB server, at
localhost, with the endpoint pointing at our data product
(`admin/blog`).

The query for posts is the following bit of GraphQL:

```graphql
 query PostsQuery($offset: Int, $limit: Int) {
    Post(offset: $offset, limit: $limit, orderBy: { date : DESC }) {
        id
        date
        title
        content
    }
}
```

The function `Posts` retrieves the data, and returns it as renderable
elements.

## Getting Some Data In

Now, we need to get some data in. The easiest way is probably to just
go to the TerminusDB dashboard and enter it there at
[http://127.0.0.1:6363/dashboard/admin/blog](http://127.0.0.1:6363/dashboard/admin/blog).

We can click over to our documents panel, which is available from the
document icon on the left, and then click posts and start editing!

## Routing
```shell
npm install react-router-dom
```

## Rendering

However, I'd like to be able to write my blogs with some
formatting. To do this, I'm going to use a markdown formatter, since I
hate word processors and HTML equally.

We will use react markdown

```shell
npm install react-markdown
```

## Syntax highlighting


```
npm install remark-gfm
npm install react-syntax-highlighter
npm install parse-numeric-range
```
