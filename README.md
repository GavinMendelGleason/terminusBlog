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

```shell
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

And since I hate writing HTML, and write all of my blogs in Markdown,
I'm going to use a Markdown renderer.

```shell
npm install react-markdown
npm install remark-gfm
npm install react-syntax-highlighter
npm install parse-numeric-range
```

React markdown is really great. It makes your source code look very
readable and deals with a wide variety of formats.


Now we're basically ready to go, we just need to edit our [App.js](../assets/App.js) file
and give ourselves a river of news.

```jsx
function PostRiver() {
  const offsets = get_offsets()
  const { loading, error, data } = useQuery(POSTS_QUERY, {variables:offsets});
  if (loading) return <Loading />;
  if (error) return `Error! ${error.message}`;
  return (
    <div>
      <div name='post_river'>
      {data.Post.map((post) => {
          console.log(post)
          const date_time_obj = new Date(post.date);
          var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          var date_time = date_time_obj.toLocaleDateString("en-US", options)
          var id = post.id.replace(/^iri:\/\/data/, '')
          var path = `${id}`
          var content = snippit(post.content) + `... **[see more](${path})**`
          var image = post.feature ? Image(post.feature) : ''
          return (
           <div key={id} id={id} name='BlogCard'>
             <table className='blogTable'>
              <tr>
                <td className='blogData'>
                  <span><h2><a href={path}>{post.title}</a></h2></span><em>{date_time}</em>
                  <ReactMarkdown components={MarkdownComponents}>
                  {content}
                  </ReactMarkdown>
                </td>
                {image}
              </tr>
             </table>
             <hr />
          </div>
          )})}
      </div>
      <More />
    </div>
  );
}
```

Ok, so that has a lot in it.

## Router

```shell
npm install react-router-dom
```

We can also make use of a router. First install 

My [App.js](../assets/App.js) file, I've edited it to use a router.

```js
function App() {
  let routes = useRoutes([
    { path: "/", element: <Posts /> },
    { path: "p", children : [
       { path: ":page", element: <Posts /> }]},
    { path: "Post", children : [
       { path: ":id", element: <SinglePost /> }]},
    { path: "Page", children : [
       { path: ":id", element: <SinglePage /> }]}
  ]);
  return routes;
}
```

###

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
