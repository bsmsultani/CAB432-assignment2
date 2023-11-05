import logo from './logo.svg';
import './App.css';
import './components/VideoDropBox';
import VideoDropBox from './components/VideoDropBox';

/**
 * The main component of the application.
 * @returns {JSX.Element} The JSX element representing the App component.
 */
function App() {

  const server = 'http://group109lb-1372671419.ap-southeast-2.elb.amazonaws.com';
  localStorage.setItem('server', server);

  return (
    <div className="App">
      <VideoDropBox />
    </div>
  );
}

export default App;
