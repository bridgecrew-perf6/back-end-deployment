const AWS = require("aws-sdk");
// update HERE
AWS.config.update({ region: "eu-west-1" });
const docClient = new AWS.DynamoDB.DocumentClient();

// update HERE
const TABLE_NAME = "toDoListItems";

const headers = {
  "Access-Control-Allow-Headers": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
};

const getItems = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId,
    },
  };
  // console.log("params", params);
  const data = await docClient.get(params).promise();
  // console.log("data", data);
  return data;
};

exports.handler = async (event) => {
  // console.log("event", event);
  // console.log("authorizer", event?.requestContext?.authorizer);
  try {
    // ID Token Payload
    // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html
    const userId = event?.requestContext?.authorizer?.claims?.sub;
    const {
      Item: { data },
    } = await getItems(userId);
    if (Array.isArray(data)) {
      return { headers, statusCode: 200, body: JSON.stringify(data) };
    } else {
      throw new Error("data not the right format");
    }
  } catch (err) {
    console.error(err);
    return { headers, statusCode: 503, error: "error fetching from db" };
  }
};
