import './App.css';
import ChatContainer from './components/Chat/ChatContainer';
import './components/Chat/Chat.css';

function App() {
  return (
    <div className="app">
      <main>
        <ChatContainer />
      </main>
      {/* <footer className="app-footer">
        <p>Desarrollado con React y servicios de IA</p>
      </footer> */}
    </div>
  );
}

export default App;
