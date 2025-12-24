import cassandra from "cassandra-driver";

const client = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_DB],
  localDataCenter: "dc1",
  credentials: {
    username: "cassandra",
    password: "cassandra",
  },
});

export default client;