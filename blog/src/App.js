import './App.css';
import ReactMarkdown from 'react-markdown'
import { ApolloClient,ApolloLink, concat, InMemoryCache, ApolloProvider,
         gql, HttpLink, useQuery } from '@apollo/client';
import rangeParser from 'parse-numeric-range'

/* Syntax highlighting */
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript'
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss'
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import rust from 'react-syntax-highlighter/dist/cjs/languages/prism/rust'
import graphql from 'react-syntax-highlighter/dist/cjs/languages/prism/graphql'
import turtle from 'react-syntax-highlighter/dist/cjs/languages/prism/turtle'

SyntaxHighlighter.registerLanguage('turtle', turtle)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('scss', scss)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('shell', bash)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('rust', rust)
SyntaxHighlighter.registerLanguage('graphql', graphql)

const syntaxTheme = oneDark
const MarkdownComponents = {
    code({ node, inline, className, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      console.log(match);
      const hasMeta = node?.data?.meta

      const applyHighlights  = (applyHighlights) => {
        if (hasMeta) {
          const RE = /{([\d,-]+)}/
          const metadata = node.data.meta?.replace(/\s/g, '')
          const strlineNumbers = RE?.test(metadata)
            ? RE?.exec(metadata)[1]
            : '0'
          const highlightLines = rangeParser(strlineNumbers)
          const highlight = highlightLines
          const data = highlight.includes(applyHighlights)
            ? 'highlight'
            : null
          return { data }
        } else {
          return {}
        }
      }
      return match ? (
          <SyntaxHighlighter
           style={syntaxTheme}
           language={match[1]}
           PreTag="div"
           className="codeStyle"
           showLineNumbers={true}
           useInlineStyles={true}
           lineProps={applyHighlights}
           {...props}
        />
      ) : (
        <SyntaxHighlighter
           style={syntaxTheme}
           language="diagram"
           PreTag="div"
           className="codeStyle"
           showLineNumbers={false}
           useInlineStyles={true}
        {...props}
        />
      )
    },
}

/* GraphQL Boilerplate */
const httpLink = new HttpLink({ uri: "http://localhost:6363/api/graphql/admin/blog" });

const POSTS_QUERY = gql`
 query PostsQuery($offset: Int, $limit: Int) {
    Post(offset: $offset, limit: $limit, orderBy: { date : DESC }) {
        id
        date
        title
        content
    }
}`

const POST_QUERY = gql`
 query PostQuery($id: ID) {
    Post(id: $id) {
        id
        date
        title
        content
    }
}`

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: "Basic YWRtaW46cm9vdA==",
    }

  }));
  return forward(operation);
})

const ComposedLink = concat(authMiddleware, httpLink)

const cache = new InMemoryCache({
  addTypename: false,
});

const client = new ApolloClient({
  cache: cache,
  link: ComposedLink,
});

/* Text Processing */
function snippit(content, size=10) {
  content = content.replace(/```[^`]*```/,'')
  const matcher = new RegExp(`^(.*\n){0,${size}}`, 'g')
  const result = matcher.exec(content)
  if(result !== null) {
    return result[0]
  }else{
    return content.substring(0,100)
  }
}

/* The App */
function Posts() {
  const { loading, error, data } = useQuery(POSTS_QUERY, {variables:{offset:0 , limit:10}});
  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <div name='posts'>
      {data.Post.map((post) => {

        const date_time_obj = new Date(post.date);
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        var date_time = date_time_obj.toLocaleDateString("en-US", options)
        var id = post.id.replace(/^iri:\/\/data/, '')
        var path = `.${id}`
        var content = snippit(post.content) + `... **[see more](${path})**`
        return (
        <div id={id}>
            <span><h2><a href={path}>{post.title}</a></h2></span><em>{date_time}</em>
            <ReactMarkdown components={MarkdownComponents}>
              {content}
            </ReactMarkdown>
       <hr />
       </div>
      )})}
    </div>
  );
}

function Post() {
  var path = window.location.pathname
  var id = path.substring(1,path.length)
  id = "iri://data/" + id
  const { loading, error, data } = useQuery(POST_QUERY, {variables:{id:id}});
  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  console.log(data)
  return (
    <div name='post'>
      {data.Post.map((post) => {

        const date_time_obj = new Date(post.date);
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        var date_time = date_time_obj.toLocaleDateString("en-US", options)
        var id = post.id.replace(/^iri:\/\/data/, '')
        var content = post.content
        return (
        <div id={id}>
            <span><h2>{post.title}</h2></span><em>{date_time}</em>
            <ReactMarkdown components={MarkdownComponents}>
              {content}
            </ReactMarkdown>
       <hr />
       </div>
      )})}
    </div>
  );
}

function is_post(path){
  const re = /^.Post.*/
  return re.exec(path)
}

function App() {
  const path = window.location.pathname
  if(is_post(path)){
    return (
    <div className="App">
       <ApolloProvider client={client}>
          <Post />
        </ApolloProvider>
    </div>
    );
  } else {
   return (
    <div className="App">
        <ReactMarkdown>
            # Gavin's Technical Blog
        </ReactMarkdown>
        <ApolloProvider client={client}>
          <Posts />
        </ApolloProvider>
    </div>
    );
  }
}
export default App;
