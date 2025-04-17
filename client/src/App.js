import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Textarea from "./Components/TextArea";
import SharedCode from "./Components/SharedCode";


function App() {
 
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Textarea />} />
        <Route path="/share/:id" element={<SharedCode />} />
      </Routes>
    </Router>
  );
}

export default App;
