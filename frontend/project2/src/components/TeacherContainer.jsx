import { useNavigate } from "react-router-dom";
function TeacherContainer(){
  const navigate = useNavigate();
  return <>
 <button onClick={()=>navigate('/student-profile')}>Profilee</button>
       <button onClick={()=>navigate('/student-books')}>Books</button>
       <button onClick={()=>navigate('/student-renew')}>Renew</button>
    </>
}
export default TeacherContainer;