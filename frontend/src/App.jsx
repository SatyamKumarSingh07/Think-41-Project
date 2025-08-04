
     import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
     import CustomerList from './CustomerList';
     import CustomerSummary from './CustomerSummary';
     import './App.css';

     function App() {
       return (
         <Router>
           <div className="app-container">
             <nav className="navbar">
               <h1>Customer Management</h1>
               <ul>
                 <li><Link to="/">Customer List</Link></li>
                 <li><Link to="/summary">Customer Summary</Link></li>
               </ul>
             </nav>
             <Routes>
               <Route path="/" element={<CustomerList />} />
               <Route path="/summary" element={<CustomerSummary />} />
             </Routes>
           </div>
         </Router>
       );
     }

     export default App;
 