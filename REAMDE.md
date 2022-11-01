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

We can put all of this in a file, [schema.json](schema.json) and 

## Layout

Now we want to actually design our website. First, let's create a
basic structure.
