import cassandra from "cassandra-driver";

const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "dc1",
  credentials: {
    username: "cassandra",
    password: "cassandra",
  },
});

export default client;