import { useNavigate } from "react-router-dom";
function StudentContainer(){
  const navigate = useNavigate();
  return <>
  <div className="container">
        
       <button onClick={()=>navigate('/student-profile')}>Profile</button>
       <button onClick={()=>navigate('/student-books')}>Books</button>
       <button onClick={()=>navigate('/student-renew')}>Renew</button>
    </div>
  </>
}
export default StudentContainer;