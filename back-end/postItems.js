const AWS = require("aws-sdk");
// update HERE
AWS.config.update({ region: "eu-west-1" });
const docClient = new AWS.DynamoDB.DocumentClient();

// update HERE
const TABLE_NAME = "route53Table";

const headers = {
  "Access-Control-Allow-Headers": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
};

const updateItems = async (userId, data) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      userId,
      data,
    },
  };
  console.log("params", params);
  await docClient.put(params).promise();
};

exports.handler = async (event) => {
  // console.log("event", event);
  // console.log("authorizer", event?.requestContext?.authorizer);
  try {
    // ID Token Payload
    // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html
    const userId = event?.requestContext?.authorizer?.claims?.sub;
    const data = JSON.parse(event.body);
    await updateItems(userId, data);
    return { headers, statusCode: 200, body: "updated" };
  } catch (err) {
    console.error(err);
    return { headers, statusCode: 503, error: "error updating db" };
  }
};
