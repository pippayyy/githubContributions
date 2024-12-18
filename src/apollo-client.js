import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

const client = new ApolloClient({
  link: new HttpLink({
    uri: GITHUB_GRAPHQL_API,
    headers: {
        Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
      },
  }),
  cache: new InMemoryCache(),
});

export default client;
