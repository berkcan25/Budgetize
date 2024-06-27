import logo from './logo.svg';
import './App.css';

function Budgetize() {
  return (
    <div className="budgetize">
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} className="h-8 w-8 mr-2" alt="logo" />
          <span className="text-white font-semibold text-xl">Budgetize</span>
        </div>
        <div>
          <a href="#home" className="text-gray-300 hover:text-white mx-2">Home</a>
          <a href="#about" className="text-gray-300 hover:text-white mx-2">About</a>
          <a href="#services" className="text-gray-300 hover:text-white mx-2">Services</a>
          <a href="#contact" className="text-gray-300 hover:text-white mx-2">Contact</a>
        </div>
      </div>
    </nav>
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
  );
}

export default Budgetize;
