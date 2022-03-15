import { useState, useEffect, Fragment } from "react";
import { Auth } from "aws-amplify";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

// API Gateway URL
const API_URL = "https://81d7ry81xj.execute-api.eu-west-1.amazonaws.com/prod";

const URL =
  "https://api.weatherapi.com/v1/current.json?key=5777c1b70f2f47cf8f4150736220802&q=London&aqi=no";

const putData = async (data) => {
  const auth = await Auth.currentSession();
  let accessToken = auth.getIdToken().getJwtToken();
  // https://axios-http.com/docs/post_example
  const res = await axios.post("/postItems", data, {
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
};

const Home = () => {
  const [inputValue, setInputValue] = useState(null);
  const [celcious, setCelcious] = useState(null);
  const [toDos, setToDos] = useState([]);

  useEffect(() => {
    const getCelcious = async () => {
      try {
        const results = await axios.get(URL);
        setCelcious(results.data?.current?.temp_c || "could not load");
      } catch (e) {
        console.log("failrd request", e);
      }
    };

    const loadUserData = async () => {
      try {
        const auth = await Auth.currentSession();
        let accessToken = auth.getIdToken().getJwtToken();
        // https://axios-http.com/docs/get_example
        const { data } = await axios.get("/getItems", {
          baseURL: API_URL,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (Array.isArray(data)) {
          console.log(data);
          setToDos(data);
        } else {
          throw new Error("data unexpected format");
        }
      } catch (e) {
        console.log("failed to load data", e);
      }
    };

    loadUserData();
    getCelcious();
  }, []);

  const sumbitHandler = async (e) => {
    e.preventDefault();
    // do not add empty values or numbers
    if (inputValue !== "") {
      console.log("inputValue", inputValue);

      const updatedList = [...toDos, { item: inputValue, checked: false }];

      try {
        const { status } = await putData(updatedList);
        if (status === 200) {
          setToDos(updatedList);
          setInputValue("");
        }
      } catch (error) {
        alert("Server issue, data cannot be backed");
        console.log("error posting data", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setInputValue(value);
  };

  const handleItemToggle = async (e, i) => {
    const checked = e.target.checked || !toDos[i].checked;
    // console.log("item clicked", e);
    const updatedList = [...toDos];
    updatedList[i] = { item: updatedList[i].item, checked };
    try {
      const { status } = await putData(updatedList);
      if (status === 200) {
        setToDos(updatedList);
      }
    } catch (error) {
      alert("Server issue, data cannot be backed");
      console.log("error toggling data", error);
    }
  };

  const handleDelete = async (e, i) => {
    const updatedList = [...toDos];
    updatedList.splice(i, 1);
    try {
      const { status } = await putData(updatedList);
      if (status === 200) {
        setToDos(updatedList);
      }
    } catch (error) {
      alert("Server issue, data cannot be backed");
      console.log("error deleting data", error);
    }
  };

  return (
    <div>
      <h1> Today's Agenda</h1>
      <p
        style={{
          borderBottom: "1px solid grey",
          textAlign: "center",
          justifyContent: "center",
          marginLeft: "34%",
          marginRight: "34%",
        }}
      ></p>
      <h3>Today's Temperature: {celcious || "?"}°C</h3>

      <div id="listContainer">
        <div id="checklist">
          {toDos.map((e, i) => {
            return (
              <Fragment key={i}>
                <input
                  type="checkbox"
                  checked={e.checked}
                  onChange={(e) => handleItemToggle(e, i)}
                ></input>
                <label>
                  <span>
                    <span onClick={(e) => handleItemToggle(e, i)}>
                      {e.item}
                    </span>{" "}
                  </span>
                </label>
                <span style={{ display: "grid" }}>
                  <DeleteOutlined
                    onClick={(e) => handleDelete(e, i)}
                  ></DeleteOutlined>
                </span>
              </Fragment>
            );
          })}
        </div>

        <form onSubmit={sumbitHandler}>
          <input
            id="toDoInput"
            value={inputValue || ""}
            onChange={handleInputChange}
            placeholder="Learn React"
          ></input>
          <button onClick={sumbitHandler}>Add task</button>
        </form>
      </div>
    </div>
  );
};

export default Home;
