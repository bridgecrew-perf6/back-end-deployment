import './App.css';
import './CustomeStyle.scss'
import Home from './Components/HomePageBacked';
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";

const App =() => {
  return (
    <div className="App"> 
      <AmplifySignOut />
       <Home></Home>
     
       {/* <Home></Home> */}
    </div>
  );
}

export default withAuthenticator(App);
