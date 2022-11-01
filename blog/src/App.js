import './App.css';
import ReactMarkdown from 'react-markdown'
import { ApolloClient,ApolloLink, concat, InMemoryCache, ApolloProvider,
         gql, HttpLink, useQuery } from '@apollo/client';

const httpLink = new HttpLink({ uri: "http://localhost:6363/api/graphql/admin/blog" });

const POST_QUERY = gql`
 query PostQuery($offset: Int, $limit: Int) {
    Post(offset: $offset, limit: $limit, orderBy: { date : ASC }) {
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

function Posts() {
  const { loading, error, data } = useQuery(POST_QUERY, {variables:{offset:0 , limit:10}});
  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  return (
    <div name='post'>
      {data.Post.map((post) => { console.log(post); return (
        <div id={post['@id']}>
            <span><h1>{post.title}</h1></span>{post.date}
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
       </div>
      )})}
    </div>
  );
}

function App() {
  return (
  <div className="Apple">
      <ReactMarkdown>
          # Gavin's Technical Blog
      </ReactMarkdown>
      <ApolloProvider client={client}>
        <Posts />
      </ApolloProvider>
  </div>
  );
}
export default App;
