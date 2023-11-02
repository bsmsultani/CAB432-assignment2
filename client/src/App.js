import logo from './logo.svg';
import './App.css';
import './components/VideoDropBox';
import VideoDropBox from './components/VideoDropBox';

function App() {
  // const server = process.env.REACT_APP_SERVER_URL;
  // get the server url from the environment variable during docker deployment

  const server = 'http://group109lb-1372671419.ap-southeast-2.elb.amazonaws.com';
  localStorage.setItem('server', server);




  return (
    <div className="App">
      <VideoDropBox />
    </div>
  );
}

export default App;
